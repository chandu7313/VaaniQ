import { randomUUID } from 'node:crypto';
import { query } from '../../db/pool.js';
import { AppError } from '../../lib/errors.js';
import { formatSlot } from '../../lib/time.js';
import { getProvider } from '../llm/index.js';
import { getTenant } from '../tenants.js';
import { getLead } from '../crm.js';
import { loadSession, addMessage, saveConversation } from '../memory.js';
import { getUpcomingAppointment } from '../appointments.js';
import { executeTool } from '../tools/executor.js';
import { maskPII, maskDeep } from '../../lib/privacy.js';
import { analyze, PROFILE_KEYS } from './analyzer.js';
import { answerFromKnowledge } from './responder.js';
import { buildRetrievalQuery } from './context.js';
import { structuredOutputSchema, buildSuggestedAction, buildExplanation } from './output.js';
import { t, tPart, LOCALES } from './templates.js';

const PROPOSAL_TTL_MS = 10 * 60 * 1000;
const FOLLOW_UP_ORDER = ['budget', 'bedrooms', 'location', 'timeline', 'decisionMaker', 'purpose'];

// Business rejections that are correct outcomes of a working system, not failures of the turn.
const EXPECTED_REJECTIONS = new Set(['SLOT_TAKEN', 'LEAD_ALREADY_BOOKED', 'MISSING_CONTACT', 'SLOT_OUTSIDE_POLICY']);

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
const slotLabel = (iso, lang) => formatSlot(new Date(iso), LOCALES[lang]);
const slotList = (slots, lang) => slots.map((s, i) => `${i + 1}) ${slotLabel(s.startsAt, lang)}`).join('; ');

function ackText(lang, newFacts) {
  const parts = [];
  if (newFacts.bedrooms) parts.push(t(lang, 'part_bedrooms', { n: newFacts.bedrooms }));
  if (newFacts.location) parts.push(t(lang, 'part_location', { v: newFacts.location }));
  if (newFacts.budgetMax) parts.push(t(lang, 'part_budget', { v: Math.round(newFacts.budgetMax / 1e5) }));
  if (newFacts.timelineMonths) parts.push(t(lang, 'part_timeline', { v: lang === 'en' ? `${newFacts.timelineMonths} month${newFacts.timelineMonths === 1 ? '' : 's'}` : newFacts.timelineMonths }));
  if (newFacts.decisionMaker) parts.push(tPart(lang, 'part_decision', newFacts.decisionMaker));
  if (newFacts.purpose) parts.push(tPart(lang, 'part_purpose', newFacts.purpose));
  if (newFacts.contact) parts.push(t(lang, 'part_contact'));
  return parts.length ? t(lang, 'ack', { parts: parts.join(', ') }) : null;
}

function budgetFitText(lang, profile, catalog) {
  if (!profile.budgetMax) return null;
  const unit = catalog.units.find((u) => u.bedrooms === profile.bedrooms);
  if (!unit) return null;
  const [lo, hi] = unit.priceLakh;
  return t(lang, profile.budgetMax / 1e5 >= lo ? 'budget_ok' : 'budget_low', { type: unit.type, lo, hi });
}

/**
 * One conversational turn:
 *  analyse -> persist facts (tool) -> escalate | confirm | decline | (answer via RAG + booking flow)
 *  -> score lead -> compose reply -> persist messages, state and decision trace.
 */
// Turns of the SAME conversation are serialized in this process (double-clicks, retries, two tabs),
// so each turn sees the state the previous one saved. Different conversations still run in parallel.
// Data integrity across instances does not depend on this: bookings are protected by a transaction
// and the unique-slot index. A multi-instance deployment would add a distributed lock (Redis/advisory).
const turnQueues = new Map();
export function handleTurn(args) {
  const key = args.conversationId;
  const previous = turnQueues.get(key) ?? Promise.resolve();
  const current = previous.catch(() => {}).then(() => runTurn(args));
  turnQueues.set(key, current);
  current.finally(() => { if (turnQueues.get(key) === current) turnQueues.delete(key); }).catch(() => {});
  return current;
}

async function runTurn({ tenantId, conversationId, text, language, now = new Date() }) {
  const started = Date.now();
  const provider = getProvider();
  const { settings } = await getTenant(tenantId);
  const { conversation, history } = await loadSession(tenantId, conversationId);
  if (conversation.status === 'ended') throw new AppError(409, 'CONVERSATION_ENDED', 'This conversation has ended; start a new one');

  const lang = language || conversation.language;
  const state = structuredClone(conversation.state || {});
  if (state.pendingProposal && new Date(state.pendingProposal.expiresAt) <= now) delete state.pendingProposal;

  const { rows: [{ n }] } = await query('SELECT COUNT(*)::int AS n FROM agent_execution_logs WHERE conversation_id=$1', [conversationId]);
  const trace = { turn: n + 1, language: lang, provider: provider.name, demoMode: provider.isDemo, input: maskPII(text), events: [], steps: [], errors: [] };
  // Concise execution events, one per pipeline step: what happened, never hidden model reasoning.
  const ev = (step, summary) => trace.events.push({ step, ms: Date.now() - started, summary: maskPII(summary) });
  ev('memory', `Session ${conversationId.slice(0, 8)}: ${history.length} prior message(s) loaded${state.pendingProposal ? ', booking proposal pending' : ''}${state.lastTopic ? `, last topic "${state.lastTopic.section}"` : ''}`);

  const analysis = await analyze({ text, state, history, provider, now, trace });
  await addMessage(tenantId, conversationId, { role: 'customer', content: text, sentiment: analysis.sentiment });
  const flags = new Set([analysis.intent, ...analysis.secondary]);
  const e = analysis.entities;
  ev('intent', `${analysis.intent}${analysis.secondary.length ? ` (+${analysis.secondary.join(', ')})` : ''} [${analysis.source}]`);
  ev('entities', Object.keys(e).length ? `Extracted ${Object.keys(e).join(', ')}` : 'No entities stated');
  ev('sentiment', `${analysis.sentiment.label} (${analysis.sentiment.confidence})`);
  trace.analysis = { source: analysis.source, intent: analysis.intent, secondaryIntents: analysis.secondary, entities: maskDeep(e), entitySources: analysis.entitySources, sentiment: analysis.sentiment };

  let lead = await getLead(tenantId, conversation.lead_id);
  const ctx = { tenantId, actor: 'agent', conversationId, leadId: lead.id, now, settings, pendingProposal: state.pendingProposal, customerConfirmed: false };
  const run = async (tool, args, reason) => {
    const rec = await executeTool(ctx, tool, args, reason);
    const { result, ...rest } = rec;
    // Store a compact, PII-masked view of results in the trace (lead rows are summarised).
    const summary = tool === 'updateLead' && result ? { leadId: result.leadId, mergedIntoExistingLead: result.mergedIntoExistingLead }
      : tool === 'searchKnowledge' && result ? result.map(({ title, section, score, relevance }) => ({ title, section, score, relevance }))
      : tool === 'qualifyLead' && result ? { total: result.score.total, classification: result.score.classification, status: result.lead.status }
        : result;
    trace.steps.push(maskDeep({ ...rest, result: summary }));
    ev('tool', `${tool}: ${rec.ok ? 'validated and executed' : `rejected ${rec.error.code}`}`);
    return rec;
  };

  const reply = [];
  let sources = [];
  let outcome = 'responded';
  let asksQuestion = false;
  let convStatus;

  // 1. Persist newly stated facts through the validated CRM tool (never written directly).
  const profilePatch = pick(e, PROFILE_KEYS);
  if (flags.has('request_visit')) profilePatch.visitIntent = 'requested';
  const contact = pick(e, ['fullName', 'phone', 'email']);
  const newFacts = Object.fromEntries(Object.entries(profilePatch).filter(([k, v]) => JSON.stringify(lead.profile[k]) !== JSON.stringify(v)));
  if (Object.keys(newFacts).length || Object.keys(contact).length) {
    const rec = await run('updateLead', { profile: profilePatch, ...contact }, 'Customer stated new qualification or contact details');
    if (rec.ok) { lead = rec.result.lead; ctx.leadId = lead.id; }
  }
  if (Object.keys(contact).length) newFacts.contact = true;
  const ack = ackText(lang, newFacts);
  if (ack) reply.push(ack);
  if (newFacts.budgetMax || (newFacts.bedrooms && lead.profile.budgetMax)) {
    const fit = budgetFitText(lang, lead.profile, settings.catalog);
    if (fit) reply.push(fit);
  }

  const offerSlots = async (args, prefMissed) => {
    const rec = await run('checkAvailability', { ...args, limit: 3 }, prefMissed ? 'Preferred time unavailable: offer nearest free slots' : 'Customer wants a site visit: read real calendar availability');
    if (rec.ok && rec.result.length) {
      state.offeredSlots = rec.result;
      reply.push(t(lang, prefMissed ? 'no_slots_for_pref' : 'offer_slots', { list: slotList(rec.result, lang) }));
      outcome = 'slots_offered';
      asksQuestion = true;
      return true;
    }
    return false;
  };

  const bookingFlow = async () => {
    const upcoming = await getUpcomingAppointment(tenantId, lead.id, now);
    if (upcoming) { reply.push(t(lang, 'already_booked', { slot: slotLabel(upcoming.starts_at.toISOString(), lang) })); outcome = 'already_booked'; return; }

    let chosen = null;
    let prefMissed = false;
    if (e.slotChoice !== undefined && state.offeredSlots?.length) {
      chosen = state.offeredSlots.at(e.slotChoice) ?? null;
    } else if (e.visitHour !== undefined) {
      // Specific time requested: look it up in the real calendar rather than assuming it is free.
      const rec = await run('checkAvailability', { ...(e.visitDate ? { date: e.visitDate } : {}), limit: 10 }, 'Check whether the requested time is free');
      const wanted = (s) => { const d = new Date(new Date(s.startsAt).getTime() + 330 * 60000); return d.getUTCHours() === e.visitHour && d.getUTCMinutes() === (e.visitMinute ?? 0); };
      chosen = rec.ok ? rec.result.find(wanted) ?? null : null;
      prefMissed = !chosen;
    } else if (state.desiredSlot && !e.visitDate && !e.visitDaypart) {
      chosen = state.desiredSlot;
    }

    if (!chosen) {
      const pref = pick({ date: e.visitDate, daypart: e.visitDaypart }, ['date', 'daypart']);
      if (!prefMissed && await offerSlots(pref, false)) return;
      if (await offerSlots({}, true)) return;
      reply.push(t(lang, 'no_slots'));
      outcome = 'no_availability';
      return;
    }
    if (!lead.full_name || !lead.phone) {
      state.desiredSlot = chosen;
      reply.push(t(lang, !lead.full_name && !lead.phone ? 'ask_contact_both' : !lead.full_name ? 'ask_contact_name' : 'ask_contact_phone'));
      outcome = 'awaiting_contact';
      asksQuestion = true;
      return;
    }
    // Structured action proposal. It is NOT executed now: it waits for an explicit "yes" next turn.
    state.pendingProposal = {
      id: randomUUID(), tool: 'bookAppointment', args: { startsAt: chosen.startsAt },
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + PROPOSAL_TTL_MS).toISOString(),
    };
    delete state.desiredSlot;
    trace.proposal = { ...state.pendingProposal, requiresConfirmation: true, status: 'awaiting_customer_confirmation' };
    ev('action_proposal', `bookAppointment ${chosen.startsAt} proposed; awaiting explicit confirmation`);
    reply.push(t(lang, 'confirm_request', { slot: slotLabel(chosen.startsAt, lang) }));
    outcome = 'confirmation_requested';
    asksQuestion = true;
  };

  // 2. Decide the primary action.
  const prevCustomer = [...history].reverse().find((m) => m.role === 'customer');
  const sustainedNegative = analysis.sentiment.label === 'negative' && analysis.sentiment.confidence >= 0.6 && prevCustomer?.sentiment === 'negative';

  if (flags.has('human_request') || sustainedNegative) {
    const reason = flags.has('human_request') ? 'Customer asked to speak with a human' : 'Negative sentiment in consecutive customer messages';
    trace.proposal = { tool: 'escalateToHuman', args: { reason }, requiresConfirmation: false };
    const rec = await run('escalateToHuman', { reason }, reason);
    delete state.pendingProposal;
    reply.push(rec.ok ? t(lang, 'escalated') : t(lang, 'fallback', { project: settings.catalog.project }));
    outcome = rec.ok ? 'escalated' : 'escalation_failed';
    if (rec.ok) convStatus = 'escalated';
    asksQuestion = true;
  } else if (flags.has('confirm') && state.pendingProposal) {
    const p = state.pendingProposal;
    ctx.customerConfirmed = true;
    trace.proposal = { ...p, requiresConfirmation: true, status: 'confirmed_by_customer' };
    const rec = await run(p.tool, p.args, 'Customer explicitly confirmed the pending proposal');
    delete state.pendingProposal;
    delete state.offeredSlots;
    if (rec.ok) {
      reply.push(t(lang, 'booked', { slot: slotLabel(rec.result.starts_at.toISOString?.() ?? rec.result.starts_at, lang), ref: rec.result.id.slice(0, 8).toUpperCase(), project: settings.catalog.project }));
      outcome = 'appointment_booked';
    } else if (rec.error.code === 'SLOT_TAKEN') {
      reply.push(t(lang, 'slot_taken'));
      if (!(await offerSlots({}, false))) reply.push(t(lang, 'no_slots'));
      outcome = 'booking_conflict';
    } else {
      reply.push(t(lang, 'booking_error', { reason: rec.error.message }));
      outcome = 'booking_failed';
    }
  } else if (flags.has('decline') && state.pendingProposal) {
    trace.proposal = { ...state.pendingProposal, status: 'declined_by_customer' };
    delete state.pendingProposal;
    reply.push(t(lang, 'declined'));
    outcome = 'proposal_declined';
    asksQuestion = true;
  } else {
    if (flags.has('ask_info')) {
      // No "retry with the old topic" when nothing matches: that would answer an unsupported question
      // ("Do you have a helipad?") with the previous topic instead of admitting there is no information.
      const rq = buildRetrievalQuery({ text, searchQuery: analysis.searchQuery, profile: lead.profile, lastTopic: state.lastTopic });
      const rec = await run('searchKnowledge', { query: rq.query.slice(0, 500), k: 3 }, rq.contextual ? 'Follow-up question: retrieve using the previous topic from memory' : 'Customer asked for information: retrieve verified documents');
      const hits = rec.ok ? rec.result : [];
      trace.retrieval = { query: maskPII(rq.query), contextAdded: rq.added, hits: hits.map(({ title, section, score, relevance }) => ({ title, section, score, relevance })) };
      if (hits[0]) state.lastTopic = { title: hits[0].title, section: hits[0].section };
      ev('retrieval', hits.length ? `${hits.length} chunk(s), top "${hits[0].section}" ${hits[0].relevance}${rq.contextual ? ` (follow-up context: ${rq.added.join(', ')})` : ''}` : 'No relevant chunk: fallback answer');
      const answer = await answerFromKnowledge({ lang, question: text, hits, provider, trace, history });
      trace.retrieval.answerMethod = answer.method;
      ev('response', `Answer generated: ${answer.method}`);
      reply.push(answer.text);
      sources = hits.map(({ documentId, title, section, relevance }) => ({ documentId, title, section, relevance }));
      outcome = hits.length ? 'info_provided' : 'info_not_found';
    }
    const contactCompletesDesiredSlot = state.desiredSlot && lead.full_name && lead.phone;
    if (flags.has('request_visit') || flags.has('slot_preference') || flags.has('select_slot') || contactCompletesDesiredSlot) {
      await bookingFlow();
    } else if (state.offeredSlots?.length && !flags.has('ask_info') && !Object.keys(newFacts).length) {
      reply.push(t(lang, 'pick_slot_hint'));
      asksQuestion = true;
    }
    if (flags.has('goodbye') && !asksQuestion) { reply.push(t(lang, 'goodbye')); outcome = 'goodbye'; asksQuestion = true; }
    if (flags.has('greeting') && !reply.length) { reply.push(t(lang, 'greeting')); outcome = 'greeted'; asksQuestion = true; }
  }

  // 3. Re-score from stored facts (deterministic, explainable) and persist, through the qualifyLead tool.
  const prevScore = lead.score;
  const qualified = await run('qualifyLead', {}, 'Recompute the explainable lead score from stored, customer-stated facts');
  if (!qualified.ok) throw new AppError(500, 'QUALIFICATION_FAILED', qualified.error.message);
  const { score } = qualified.result;
  lead = qualified.result.lead;
  ev('scoring', `Lead score ${prevScore} → ${score.total} (${score.classification})`);
  trace.scoring = { previous: prevScore, total: score.total, classification: score.classification, factors: score.factors, missing: score.missing };

  // 4. One qualification follow-up question per turn, only if the reply is not already asking something.
  if (!asksQuestion) {
    const next = FOLLOW_UP_ORDER.find((k) => score.missing.includes(k));
    if (next) reply.push(t(lang, `ask_${next}`));
    else if (!reply.length) reply.push(t(lang, 'fallback', { project: settings.catalog.project }));
  }

  const replyText = reply.join(' ');
  const suggestedAction = buildSuggestedAction({ outcome, pendingProposal: state.pendingProposal, offeredSlots: state.offeredSlots, missing: score.missing });
  const explanation = buildExplanation({ analysis, retrieval: trace.retrieval, steps: trace.steps, prevScore, score, suggestedAction });
  // Structured output validation: fails loudly (500 + log) before anything is persisted or returned.
  const output = structuredOutputSchema.parse({
    reply: replyText, intent: analysis.intent, secondaryIntents: analysis.secondary, entities: trace.analysis.entities,
    sentiment: analysis.sentiment, leadQualification: { total: score.total, classification: score.classification, factors: score.factors, missing: score.missing, recommendedNextAction: score.recommendedNextAction },
    sources, suggestedAction, explanation, outcome,
  });
  ev('output_validated', `Structured output valid; suggested action: ${suggestedAction.type}`);
  trace.suggestedAction = suggestedAction;
  trace.explanation = explanation;

  const agentMsg = await addMessage(tenantId, conversationId, { role: 'agent', content: replyText, sources: sources.length ? sources : null });
  await saveConversation(tenantId, conversationId, { state, leadId: lead.id, status: convStatus, language: lang });

  trace.response = { text: replyText, sources, outcome };
  // Turn success: a valid response was produced and no tool failed for an unexpected reason.
  trace.success = trace.steps.every((st) => st.ok || EXPECTED_REJECTIONS.has(st.error?.code));
  trace.latencyMs = Date.now() - started;
  await query(
    `INSERT INTO agent_execution_logs (tenant_id, conversation_id, turn_index, intent, outcome, provider, latency_ms, trace)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [tenantId, conversationId, trace.turn, analysis.intent, outcome, provider.name, trace.latencyMs, trace],
  );

  return {
    ...output,
    messageId: agentMsg.id, language: lang,
    analysis: trace.analysis, score, trace,
    session: { conversationId, leadId: lead.id, turn: trace.turn, language: lang, status: convStatus ?? conversation.status, historyMessagesUsed: history.length },
    lead: { id: lead.id, full_name: lead.full_name, status: lead.status, score: lead.score, profile: lead.profile, is_demo: lead.is_demo },
    pendingConfirmation: state.pendingProposal ? { startsAt: state.pendingProposal.args.startsAt, label: slotLabel(state.pendingProposal.args.startsAt, lang), expiresAt: state.pendingProposal.expiresAt } : null,
    offeredSlots: state.offeredSlots ?? [],
    conversationStatus: convStatus ?? conversation.status,
  };
}

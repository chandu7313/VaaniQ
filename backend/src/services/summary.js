import { query } from '../db/pool.js';
import { log } from '../lib/logger.js';
import { formatSlot } from '../lib/time.js';
import { getProvider } from './llm/index.js';
import { getConversationDetail, saveConversation } from './memory.js';

const lakh = (r) => (r ? `₹${Math.round(r / 1e5)} lakh` : null);

function sentimentTrajectory(messages) {
  const seq = messages.filter((m) => m.role === 'customer' && m.sentiment).map((m) => m.sentiment);
  const val = { negative: -1, neutral: 0, positive: 1 };
  if (!seq.length) return { overall: 'neutral', start: null, end: null, trend: 'unknown', sequence: [] };
  const avg = seq.reduce((s, l) => s + val[l], 0) / seq.length;
  const delta = val[seq.at(-1)] - val[seq[0]];
  return {
    overall: avg > 0.25 ? 'positive' : avg < -0.25 ? 'negative' : 'neutral',
    start: seq[0], end: seq.at(-1),
    trend: seq.length < 2 ? 'single message' : delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'stable',
    sequence: seq,
  };
}

/** Rule-based next best action so recommendations are consistent and auditable. */
export function recommendNextAction({ status, appointment, score, sentiment, escalationReason }) {
  const actions = [];
  if (status === 'escalated') actions.push(`Human sales executive to call back within 1 hour (${escalationReason || 'escalated'}).`);
  if (sentiment.end === 'negative') actions.push('Address the customer\'s concerns before pushing for a visit.');
  if (appointment) {
    actions.push(`Send visit confirmation and location pin; assign a sales executive for ${appointment.label}; reconfirm attendance one day before.`);
    if (score?.missing?.includes('decisionMaker')) actions.push('Invite co-decision makers to the visit.');
  } else if (score?.classification === 'hot') actions.push('Call within 2 hours to schedule a site visit.');
  else if (score?.classification === 'warm') actions.push(`Follow up within 24 hours to collect: ${(score.missing || []).filter((m) => m !== 'visit').join(', ') || 'visit date'}.`);
  else actions.push('Add to nurture campaign and share the project brochure.');
  return actions;
}

export async function generateCallSummary(tenantId, conversationId, { end = true } = {}) {
  const conv = await getConversationDetail(tenantId, conversationId);
  const lead = conv.lead || {};
  const p = lead.profile || {};
  const score = lead.score_breakdown?.factors ? lead.score_breakdown : null;
  const { rows: appts } = await query(`SELECT id, starts_at, status FROM appointments WHERE tenant_id=$1 AND conversation_id=$2 ORDER BY created_at DESC LIMIT 1`, [tenantId, conversationId]);
  const { rows: logs } = await query(`SELECT intent, outcome, trace->'retrieval'->'hits' AS hits FROM agent_execution_logs WHERE conversation_id=$1 ORDER BY turn_index`, [conversationId]);
  const appointment = appts[0] ? { id: appts[0].id, startsAt: appts[0].starts_at, label: formatSlot(appts[0].starts_at), status: appts[0].status } : null;
  const sentiment = sentimentTrajectory(conv.messages);
  const topics = [...new Set(logs.flatMap((l) => (l.hits || []).slice(0, 1).map((h) => h.section)))];

  const summary = {
    generatedAt: new Date().toISOString(),
    language: conv.language,
    customer: { name: lead.full_name || null, phoneOnFile: Boolean(lead.phone), isDemo: lead.is_demo ?? true },
    requirements: {
      configuration: p.bedrooms ? `${p.bedrooms}BHK` : null, location: p.location || null, budget: lakh(p.budgetMax),
      timeline: p.timelineMonths ? `${p.timelineMonths} month${p.timelineMonths === 1 ? '' : 's'}` : null, decisionMaker: p.decisionMaker || null,
      purpose: p.purpose || null, preferences: p.preferences || [],
    },
    topicsDiscussed: topics,
    sentiment,
    leadScore: score ? { total: score.total, classification: score.classification, factors: score.factors, missing: score.missing } : null,
    outcome: conv.status === 'escalated' ? 'Escalated to human' : appointment ? 'Site visit booked' : 'Information shared',
    appointment,
    turns: logs.length,
    recommendedNextActions: recommendNextAction({ status: conv.status, appointment, score, sentiment, escalationReason: conv.escalation_reason }),
  };

  const facts = [
    `${summary.customer.name || 'The customer'} enquired about ${[summary.requirements.configuration, summary.requirements.location && `in ${summary.requirements.location}`].filter(Boolean).join(' ') || 'ABC Heights'}`,
    summary.requirements.budget && `with a budget around ${summary.requirements.budget}`,
    summary.requirements.timeline && `planning to buy within ${summary.requirements.timeline}`,
  ].filter(Boolean).join(', ');
  summary.narrative = `${facts}. Outcome: ${summary.outcome}${appointment ? ` (${appointment.label})` : ''}. Sentiment was ${sentiment.overall}${sentiment.trend !== 'unknown' ? ` and ${sentiment.trend}` : ''}.`;
  summary.narrativeMethod = 'template';

  const provider = getProvider();
  if (!provider.isDemo) {
    try {
      const text = (await provider.chat({
        system: 'Write a 2-3 sentence call summary for a sales manager using ONLY the JSON facts provided. Do not add facts.',
        messages: [{ role: 'user', content: JSON.stringify({ ...summary, narrative: undefined }) }],
      })).trim();
      if (text && text.length < 800) { summary.narrative = text; summary.narrativeMethod = 'llm'; }
    } catch (err) {
      log.warn('llm_summary_fallback', { reason: err.message });
      summary.narrativeError = err.message;
    }
  }

  await query(
    `INSERT INTO call_summaries (tenant_id, conversation_id, lead_id, summary) VALUES ($1,$2,$3,$4)
     ON CONFLICT (conversation_id) DO UPDATE SET summary = EXCLUDED.summary, created_at = now()`,
    [tenantId, conversationId, lead.id ?? null, summary],
  );
  if (end && conv.status === 'active') await saveConversation(tenantId, conversationId, { status: 'ended' });
  if (end && conv.status === 'escalated') await query('UPDATE conversations SET ended_at = now() WHERE id=$1 AND tenant_id=$2', [conversationId, tenantId]);
  return summary;
}

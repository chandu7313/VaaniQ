import { randomUUID } from 'node:crypto';
import { query } from '../db/pool.js';
import { AppError } from '../lib/errors.js';
import { formatSlot } from '../lib/time.js';
import { getPublicTenantBySlug } from '../services/tenants.js';
import { getLead } from '../services/crm.js';
import { startConversation, loadSession, addMessage, saveConversation } from '../services/memory.js';
import { getAvailableSlots, getUpcomingAppointment } from '../services/appointments.js';
import { retrieve } from '../services/rag/knowledge.js';
import { executeTool } from '../services/tools/executor.js';
import { handleTurn } from '../services/agent/orchestrator.js';
import { t, LOCALES } from '../services/agent/templates.js';
import { signCustomerSessionToken } from '../middleware/auth.js';
import { speechCapabilities } from '../services/speech.js';

const PROPOSAL_TTL_MS = 10 * 60 * 1000;
const INTERNAL_POLICY_PATTERN = /sales and booking policies|escalation matrix|call scenarios|objection handling|objection library|conversation examples|negotiation authority/i;

const isInternalDoc = (doc) => doc?.retrieval_scope === 'agent_internal'
  || doc?.retrievalScope === 'agent_internal'
  || INTERNAL_POLICY_PATTERN.test(typeof doc === 'string' ? doc : (doc?.title || ''));
const slotLabel = (iso, lang) => formatSlot(new Date(iso), LOCALES[lang] || LOCALES.en);

function sanitizeRequirements(profile = {}) {
  return {
    bedrooms: profile.bedrooms ?? null,
    location: profile.location ?? null,
    budgetLakh: profile.budgetMax ? Math.round(profile.budgetMax / 1e5) : null,
    timelineMonths: profile.timelineMonths ?? null,
    preferences: Array.isArray(profile.preferences) ? profile.preferences : [],
  };
}

function sanitizeSources(sources = []) {
  return (sources || [])
    .filter((s) => !isInternalDoc(s))
    .map(({ title, section, relevance }) => ({ title, section, relevance }));
}

function sanitizeBookingPolicy(booking = {}) {
  return {
    startHour: booking.startHour,
    endHour: booking.endHour,
    slotMinutes: booking.slotMinutes,
    workDays: booking.workDays,
  };
}

function extractHighlightsFromDocs(docs) {
  const sections = [];
  for (const doc of docs) {
    if (isInternalDoc(doc)) continue;
    const lines = String(doc.content || '').split('\n');
    let heading = doc.title;
    let buffer = [];
    const flush = () => {
      const body = buffer.join(' ').replace(/\(FICTIONAL DEMO DATA[^)]*\)/gi, '').trim();
      if (body && !/disclaimer|fictional/i.test(heading)) {
        sections.push({ title: doc.title, section: heading, content: body });
      }
      buffer = [];
    };
    for (const line of lines) {
      if (line.startsWith('## ')) {
        flush();
        heading = line.replace(/^##\s+/, '').trim();
      } else if (!line.startsWith('# ')) {
        buffer.push(line.trim());
      }
    }
    flush();
  }
  return sections;
}

async function resolveBookedAppointment(tenantId, conversationId, leadId, lang) {
  const { rows } = await query(
    `SELECT id, starts_at FROM appointments
      WHERE tenant_id=$1 AND (conversation_id=$2 OR ($3::uuid IS NOT NULL AND lead_id=$3)) AND status='confirmed'
      ORDER BY created_at DESC LIMIT 1`,
    [tenantId, conversationId, leadId ?? null],
  );
  if (!rows[0]) return null;
  const iso = rows[0].starts_at.toISOString?.() ?? rows[0].starts_at;
  return {
    reference: rows[0].id.slice(0, 8).toUpperCase(),
    startsAt: iso,
    label: slotLabel(iso, lang),
  };
}

export async function resolvePublicTenant(req, _res, next) {
  try {
    req.publicTenant = await getPublicTenantBySlug(req.valid?.params?.slug ?? req.params.slug);
    next();
  } catch (err) {
    next(err);
  }
}

export async function overview(req, res) {
  const tenant = req.publicTenant;
  const { rows: docs } = await query(
    `SELECT title, content, retrieval_scope FROM knowledge_documents
      WHERE tenant_id = $1
        AND retrieval_scope = 'customer_facing'
        AND lifecycle_status NOT IN ('superseded', 'failed', 'uploaded')
      ORDER BY created_at ASC`,
    [tenant.id],
  );
  const availableSlots = await getAvailableSlots(tenant.id, tenant.settings.booking, { limit: 6 });
  const catalog = tenant.settings?.catalog || {};
  res.json({
    data: {
      tenant: {
        slug: tenant.slug,
        companyName: tenant.name.replace(/\s*\(fictional demo\)\s*/i, '').trim(),
        projectName: catalog.publicProject || catalog.project,
        catalogProjectName: catalog.project,
        location: catalog.location,
        isDemo: tenant.is_demo,
        units: catalog.units || [],
        visitingHours: sanitizeBookingPolicy(tenant.settings.booking),
      },
      highlights: extractHighlightsFromDocs(docs),
      availableSlots,
      speech: { serverTranscription: speechCapabilities().serverTranscription },
    },
  });
}

export async function availability(req, res) {
  const tenant = req.publicTenant;
  const { date, daypart, limit } = req.valid.query;
  const slots = await getAvailableSlots(tenant.id, tenant.settings.booking, { date, daypart, limit });
  res.json({ data: slots });
}

export async function searchKnowledge(req, res) {
  const tenant = req.publicTenant;
  const { query: q, k } = req.valid.body;
  const hits = await retrieve(tenant.id, q, { k: Math.min(k + 2, 8), includeInternal: false });
  const safeHits = hits
    .filter((h) => !isInternalDoc(h))
    .slice(0, k)
    .map(({ title, section, content, relevance }) => ({ title, section, content, relevance }));
  res.json({ data: safeHits });
}

export async function startPublicConversation(req, res) {
  const tenant = req.publicTenant;
  const ctx = { tenantId: tenant.id, actor: 'agent', now: new Date(), settings: tenant.settings };
  const leadRec = await executeTool(ctx, 'saveLead', {}, 'Public customer conversation started');
  if (!leadRec.ok) throw new AppError(500, leadRec.error.code, leadRec.error.message);

  const conversation = await startConversation(tenant.id, {
    leadId: leadRec.result.leadId,
    ...req.valid.body,
  });
  const greeting = await addMessage(tenant.id, conversation.id, {
    role: 'agent',
    content: t(conversation.language, 'greeting'),
  });
  const sessionToken = signCustomerSessionToken({
    conversationId: conversation.id,
    tenantId: tenant.id,
    slug: tenant.slug,
  });

  res.status(201).json({
    data: {
      sessionToken,
      conversation: {
        id: conversation.id,
        language: conversation.language,
        channel: conversation.channel,
        status: conversation.status,
        started_at: conversation.started_at,
      },
      greeting: {
        id: greeting.id,
        role: greeting.role,
        content: greeting.content,
        created_at: greeting.created_at,
      },
    },
  });
}

export async function getPublicConversation(req, res) {
  const tenant = req.publicTenant;
  const { conversationId } = req.customerSession;
  const { conversation } = await loadSession(tenant.id, conversationId);
  const { rows: msgs } = await query(
    `SELECT id, role, content, sources, created_at FROM messages
      WHERE tenant_id=$1 AND conversation_id=$2 ORDER BY created_at ASC`,
    [tenant.id, conversationId],
  );
  const lead = conversation.lead_id ? await getLead(tenant.id, conversation.lead_id) : null;
  const state = conversation.state || {};
  const pendingValid = state.pendingProposal && new Date(state.pendingProposal.expiresAt) > new Date();
  const appointment = await resolveBookedAppointment(tenant.id, conversationId, lead?.id, conversation.language);

  res.json({
    data: {
      conversation: {
        id: conversation.id,
        language: conversation.language,
        channel: conversation.channel,
        status: conversation.status,
        started_at: conversation.started_at,
        ended_at: conversation.ended_at,
      },
      messages: msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: sanitizeSources(m.sources),
        created_at: m.created_at,
      })),
      offeredSlots: state.offeredSlots ?? [],
      pendingConfirmation: pendingValid
        ? {
            startsAt: state.pendingProposal.args.startsAt,
            label: slotLabel(state.pendingProposal.args.startsAt, conversation.language),
            expiresAt: state.pendingProposal.expiresAt,
          }
        : null,
      appointment,
      needsContact: Boolean(state.desiredSlot && (!lead?.full_name || !lead?.phone)),
      contactSaved: Boolean(lead?.full_name && lead?.phone),
      collectedRequirements: sanitizeRequirements(lead?.profile),
      conversationStatus: conversation.status,
    },
  });
}

export async function sendPublicMessage(req, res) {
  const tenant = req.publicTenant;
  const { conversationId } = req.customerSession;
  const turn = await handleTurn({
    tenantId: tenant.id,
    conversationId,
    text: req.valid.body.text,
    language: req.valid.body.language,
  });

  const bookedStep = turn.trace?.steps?.find((s) => s.tool === 'bookAppointment' && s.ok);
  let appointment = null;
  if (bookedStep?.result) {
    const iso = bookedStep.result.starts_at?.toISOString?.() ?? bookedStep.result.starts_at;
    appointment = {
      reference: bookedStep.result.id.slice(0, 8).toUpperCase(),
      startsAt: iso,
      label: slotLabel(iso, turn.language),
    };
  } else if (turn.outcome === 'already_booked') {
    const upcoming = await getUpcomingAppointment(tenant.id, turn.lead.id, new Date());
    if (upcoming) {
      const iso = upcoming.starts_at.toISOString?.() ?? upcoming.starts_at;
      appointment = {
        reference: upcoming.id.slice(0, 8).toUpperCase(),
        startsAt: iso,
        label: slotLabel(iso, turn.language),
      };
    }
  }

  const lead = await getLead(tenant.id, turn.lead.id);

  res.json({
    data: {
      messageId: turn.messageId,
      reply: turn.reply,
      language: turn.language,
      sources: sanitizeSources(turn.sources),
      offeredSlots: turn.offeredSlots ?? [],
      pendingConfirmation: turn.pendingConfirmation ?? null,
      appointment,
      needsContact: turn.outcome === 'awaiting_contact',
      contactSaved: Boolean(lead.full_name && lead.phone),
      collectedRequirements: sanitizeRequirements(lead.profile),
      conversationStatus: turn.conversationStatus,
    },
  });
}

export async function selectPublicSlot(req, res) {
  const tenant = req.publicTenant;
  const { conversationId } = req.customerSession;
  const { startsAt, language } = req.valid.body;
  const now = new Date();
  const { conversation } = await loadSession(tenant.id, conversationId);
  if (conversation.status === 'ended') {
    throw new AppError(409, 'CONVERSATION_ENDED', 'This conversation has ended; please start a new one');
  }
  const lang = language || conversation.language;

  const openSlots = await getAvailableSlots(tenant.id, tenant.settings.booking, { limit: 60, now });
  const chosen = openSlots.find((s) => new Date(s.startsAt).getTime() === new Date(startsAt).getTime());
  if (!chosen) {
    throw new AppError(409, 'SLOT_UNAVAILABLE', 'That visit slot is no longer available. Please pick another slot.');
  }

  let lead = await getLead(tenant.id, conversation.lead_id);
  await addMessage(tenant.id, conversationId, {
    role: 'customer',
    content: `I would like to schedule a site visit for ${slotLabel(chosen.startsAt, lang)}.`,
  });

  const ctx = { tenantId: tenant.id, actor: 'agent', conversationId, leadId: lead.id, now, settings: tenant.settings };
  const upd = await executeTool(ctx, 'updateLead', { profile: { visitIntent: 'requested' } }, 'Customer selected a site visit slot');
  if (upd.ok) lead = upd.result.lead;
  await executeTool({ ...ctx, leadId: lead.id }, 'qualifyLead', {}, 'Recompute qualification score after slot selection');

  const state = structuredClone(conversation.state || {});
  const upcoming = await getUpcomingAppointment(tenant.id, lead.id, now);
  if (upcoming) {
    const iso = upcoming.starts_at.toISOString?.() ?? upcoming.starts_at;
    const reply = t(lang, 'already_booked', { slot: slotLabel(iso, lang) });
    const msg = await addMessage(tenant.id, conversationId, { role: 'agent', content: reply });
    return res.json({
      data: {
        messageId: msg.id,
        reply,
        pendingConfirmation: null,
        needsContact: false,
        contactSaved: Boolean(lead.full_name && lead.phone),
        appointment: { reference: upcoming.id.slice(0, 8).toUpperCase(), startsAt: iso, label: slotLabel(iso, lang) },
      },
    });
  }

  if (!lead.full_name || !lead.phone) {
    state.desiredSlot = chosen;
    delete state.pendingProposal;
    await saveConversation(tenant.id, conversationId, { state, leadId: lead.id, language: lang });
    const reply = t(lang, !lead.full_name && !lead.phone ? 'ask_contact_both' : !lead.full_name ? 'ask_contact_name' : 'ask_contact_phone');
    const msg = await addMessage(tenant.id, conversationId, { role: 'agent', content: reply });
    return res.json({
      data: {
        messageId: msg.id,
        reply,
        pendingConfirmation: null,
        needsContact: true,
        contactSaved: false,
        appointment: null,
      },
    });
  }

  state.pendingProposal = {
    id: randomUUID(),
    tool: 'bookAppointment',
    args: { startsAt: chosen.startsAt },
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PROPOSAL_TTL_MS).toISOString(),
  };
  delete state.desiredSlot;
  await saveConversation(tenant.id, conversationId, { state, leadId: lead.id, language: lang });
  const label = slotLabel(chosen.startsAt, lang);
  const reply = t(lang, 'confirm_request', { slot: label });
  const msg = await addMessage(tenant.id, conversationId, { role: 'agent', content: reply });

  return res.json({
    data: {
      messageId: msg.id,
      reply,
      pendingConfirmation: { startsAt: chosen.startsAt, label, expiresAt: state.pendingProposal.expiresAt },
      needsContact: false,
      contactSaved: true,
      appointment: null,
    },
  });
}

export async function savePublicContact(req, res) {
  const tenant = req.publicTenant;
  const { conversationId } = req.customerSession;
  const { fullName, phone, email, language } = req.valid.body;
  const now = new Date();
  const { conversation } = await loadSession(tenant.id, conversationId);
  if (conversation.status === 'ended') {
    throw new AppError(409, 'CONVERSATION_ENDED', 'This conversation has ended; please start a new one');
  }
  const lang = language || conversation.language;

  const ctx = {
    tenantId: tenant.id,
    actor: 'agent',
    conversationId,
    leadId: conversation.lead_id,
    now,
    settings: tenant.settings,
  };
  const upd = await executeTool(
    ctx,
    'updateLead',
    { fullName, phone, ...(email ? { email } : {}) },
    'Customer consented to save contact details for site visit coordination',
  );
  if (!upd.ok) throw new AppError(400, upd.error.code, upd.error.message);
  const lead = upd.result.lead;
  await executeTool({ ...ctx, leadId: lead.id }, 'qualifyLead', {}, 'Recompute qualification score after contact consent');

  const state = structuredClone(conversation.state || {});
  let pendingConfirmation = null;
  let reply;

  const upcoming = await getUpcomingAppointment(tenant.id, lead.id, now);
  if (upcoming) {
    const iso = upcoming.starts_at.toISOString?.() ?? upcoming.starts_at;
    delete state.desiredSlot;
    delete state.pendingProposal;
    await saveConversation(tenant.id, conversationId, { state, leadId: lead.id, language: lang });
    const reply = t(lang, 'already_booked', { slot: slotLabel(iso, lang) });
    const msg = await addMessage(tenant.id, conversationId, { role: 'agent', content: reply });
    return res.json({
      data: {
        messageId: msg.id,
        reply,
        pendingConfirmation: null,
        needsContact: false,
        contactSaved: true,
        appointment: { reference: upcoming.id.slice(0, 8).toUpperCase(), startsAt: iso, label: slotLabel(iso, lang) },
      },
    });
  }

  if (state.desiredSlot) {
    const slot = state.desiredSlot;
    state.pendingProposal = {
      id: randomUUID(),
      tool: 'bookAppointment',
      args: { startsAt: slot.startsAt },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + PROPOSAL_TTL_MS).toISOString(),
    };
    delete state.desiredSlot;
    await saveConversation(tenant.id, conversationId, { state, leadId: lead.id, language: lang });
    const label = slotLabel(slot.startsAt, lang);
    pendingConfirmation = { startsAt: slot.startsAt, label, expiresAt: state.pendingProposal.expiresAt };
    reply = t(lang, 'confirm_request', { slot: label });
  } else {
    reply = t(lang, 'ack', { parts: t(lang, 'part_contact') });
  }

  const msg = await addMessage(tenant.id, conversationId, { role: 'agent', content: reply });
  res.json({
    data: {
      messageId: msg.id,
      reply,
      contactSaved: true,
      needsContact: false,
      pendingConfirmation,
      collectedRequirements: sanitizeRequirements(lead.profile),
    },
  });
}

export async function endPublicConversation(req, res) {
  const tenant = req.publicTenant;
  const { conversationId } = req.customerSession;
  const rec = await executeTool(
    { tenantId: tenant.id, actor: 'agent', conversationId, now: new Date(), settings: tenant.settings },
    'generateCallSummary',
    { end: true },
    'Public customer conversation ended',
  );
  if (!rec.ok) throw new AppError(500, rec.error.code, rec.error.message);
  res.json({ data: { status: 'ended', completed: true } });
}

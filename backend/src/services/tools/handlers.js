import { retrieve } from '../rag/knowledge.js';
import { getAvailableSlots, bookAppointment, getUpcomingAppointment } from '../appointments.js';
import { createLead, upsertLeadFacts, getLead, saveScore, findLeadByPhone } from '../crm.js';
import { saveConversation } from '../memory.js';
import { scoreLead } from '../leadScoring.js';
import { generateCallSummary } from '../summary.js';
import { AppError } from '../../lib/errors.js';

// Tool IMPLEMENTATIONS. Each receives an already validated, authorized context and arguments;
// none of them is reachable except through executor.js.

async function scoreAndSave(ctx, lead) {
  const hasBooking = Boolean(await getUpcomingAppointment(ctx.tenantId, lead.id, ctx.now));
  const score = scoreLead(lead.profile, { catalog: ctx.settings.catalog, scoring: ctx.settings.scoring, hasBooking });
  const saved = await saveScore(ctx.tenantId, lead.id, score, ctx.settings.scoring?.thresholds);
  return { score, lead: saved };
}

export const handlers = {
  searchKnowledge: (ctx, { query, k }) => retrieve(ctx.tenantId, query, { k, includeInternal: ctx.actor === 'staff' }),

  calculateLeadScore: (ctx, { profile, hasBooking }) =>
    scoreLead(profile, { catalog: ctx.settings.catalog, scoring: ctx.settings.scoring, hasBooking }),

  qualifyLead: async (ctx) => scoreAndSave(ctx, await getLead(ctx.tenantId, ctx.leadId)),

  checkAvailability: (ctx, args) => getAvailableSlots(ctx.tenantId, ctx.settings.booking, { ...args, now: ctx.now }),

  bookAppointment: async (ctx, { startsAt, notes }) => {
    const lead = await getLead(ctx.tenantId, ctx.leadId);
    if (!lead.full_name || !lead.phone) throw new AppError(422, 'MISSING_CONTACT', 'Name and phone are required before booking');
    const appointment = await bookAppointment(ctx.tenantId, ctx.settings.booking, {
      leadId: ctx.leadId, conversationId: ctx.conversationId, startsAt, now: ctx.now,
      notes: notes ?? (ctx.actor === 'agent' ? 'Booked by VaaniQ agent after customer confirmation' : 'Booked manually by staff'),
    });
    return appointment;
  },

  saveLead: async (ctx, { fullName, phone, email, profile }) => {
    // Never duplicate a person: a known phone number returns (and enriches) the existing lead.
    const existing = phone ? await findLeadByPhone(ctx.tenantId, phone) : null;
    const base = existing ?? await createLead(ctx.tenantId, { isDemo: ctx.actor === 'agent' });
    const { lead } = await upsertLeadFacts(ctx.tenantId, base.id, { fullName, phone, email, profile });
    const scored = await scoreAndSave(ctx, lead);
    return { leadId: lead.id, created: !existing, lead: scored.lead, score: scored.score };
  },

  updateLead: async (ctx, args) => {
    const { lead, mergedFrom } = await upsertLeadFacts(ctx.tenantId, ctx.leadId, args);
    if (mergedFrom && ctx.conversationId) await saveConversation(ctx.tenantId, ctx.conversationId, { leadId: lead.id });
    return { leadId: lead.id, mergedIntoExistingLead: Boolean(mergedFrom), lead };
  },

  generateCallSummary: (ctx, { end }) => generateCallSummary(ctx.tenantId, ctx.conversationId, { end }),

  escalateToHuman: async (ctx, { reason }) => {
    await saveConversation(ctx.tenantId, ctx.conversationId, { status: 'escalated', escalationReason: reason });
    return { escalated: true, reason };
  },
};

import { registerTool, z } from './registry.js';
import { retrieve } from '../rag/knowledge.js';
import { getAvailableSlots, bookAppointment } from '../appointments.js';
import { upsertLeadFacts, getLead } from '../crm.js';
import { saveConversation } from '../memory.js';
import { AppError } from '../../lib/errors.js';

const profileSchema = z.object({
  bedrooms: z.number().int().min(1).max(5).optional(),
  location: z.string().max(60).optional(),
  budgetMax: z.number().int().positive().optional(),
  budgetApprox: z.boolean().optional(),
  timelineMonths: z.number().positive().max(120).optional(),
  decisionMaker: z.enum(['self', 'joint', 'other']).optional(),
  purpose: z.enum(['self-use', 'investment']).optional(),
  preferences: z.array(z.string().max(40)).max(10).optional(),
  visitIntent: z.enum(['requested']).optional(),
}).strict();

registerTool({
  name: 'search_knowledge_base',
  description: 'BM25 retrieval over the tenant knowledge base',
  sideEffect: 'read',
  argsSchema: z.object({ query: z.string().min(2).max(500), k: z.number().int().min(1).max(8).default(3) }),
  handler: (ctx, { query, k }) => retrieve(ctx.tenantId, query, { k }),
});

registerTool({
  name: 'check_availability',
  description: 'List free site-visit slots from the appointment calendar',
  sideEffect: 'read',
  argsSchema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    daypart: z.enum(['morning', 'afternoon', 'evening']).optional(),
    limit: z.number().int().min(1).max(10).default(3),
  }),
  handler: (ctx, args) => getAvailableSlots(ctx.tenantId, ctx.settings.booking, { ...args, now: ctx.now }),
});

registerTool({
  name: 'update_lead',
  description: 'Save customer-stated requirements and contact details to the CRM',
  sideEffect: 'write',
  argsSchema: z.object({
    profile: profileSchema.default({}),
    fullName: z.string().min(1).max(80).optional(),
    phone: z.string().regex(/^\+91[6-9]\d{9}$/).optional(),
    email: z.string().email().optional(),
  }),
  handler: async (ctx, args) => {
    const { lead, mergedFrom } = await upsertLeadFacts(ctx.tenantId, ctx.leadId, args);
    if (mergedFrom) await saveConversation(ctx.tenantId, ctx.conversationId, { leadId: lead.id });
    return { leadId: lead.id, mergedIntoExistingLead: Boolean(mergedFrom), lead };
  },
});

registerTool({
  name: 'book_appointment',
  description: 'Book a site visit in a confirmed slot (requires explicit customer confirmation)',
  sideEffect: 'write',
  requiresConfirmation: true,
  argsSchema: z.object({ startsAt: z.string().datetime() }),
  handler: async (ctx, { startsAt }) => {
    const lead = await getLead(ctx.tenantId, ctx.leadId);
    if (!lead.full_name || !lead.phone) throw new AppError(422, 'MISSING_CONTACT', 'Name and phone are required before booking');
    return bookAppointment(ctx.tenantId, ctx.settings.booking, { leadId: ctx.leadId, conversationId: ctx.conversationId, startsAt, now: ctx.now, notes: 'Booked by VaaniQ agent after customer confirmation' });
  },
});

registerTool({
  name: 'escalate_to_human',
  description: 'Hand the conversation to a human sales executive',
  sideEffect: 'write',
  argsSchema: z.object({ reason: z.string().min(3).max(200) }),
  handler: async (ctx, { reason }) => {
    await saveConversation(ctx.tenantId, ctx.conversationId, { status: 'escalated', escalationReason: reason });
    return { escalated: true, reason };
  },
});

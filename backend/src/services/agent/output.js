import { z } from 'zod';

// The structured result of one agent turn. It is validated with Zod BEFORE anything is persisted
// or returned, so a bug (or a malformed model contribution) can never reach the client silently.

const sourceSchema = z.object({ documentId: z.string().uuid(), title: z.string(), section: z.string().nullable(), relevance: z.number().min(0).max(1) });
const factorSchema = z.object({ key: z.string(), label: z.string(), max: z.number(), points: z.number(), reason: z.string(),
  evidence: z.array(z.object({ field: z.string(), value: z.unknown(), source: z.string() })) })
  // Never award points without evidence.
  .refine((f) => f.points === 0 || f.evidence.length > 0, { message: 'points awarded without evidence' });

export const suggestedActionSchema = z.object({
  type: z.enum(['confirm_booking', 'choose_slot', 'provide_contact', 'ask_qualification', 'human_handoff', 'prepare_visit', 'none']),
  tool: z.string().optional(),
  args: z.record(z.string(), z.unknown()).optional(),
  field: z.string().optional(),
  requiresConfirmation: z.boolean(),
  executed: z.boolean(),
  reason: z.string(),
});

export const structuredOutputSchema = z.object({
  reply: z.string().min(1).max(4000),
  intent: z.string(),
  secondaryIntents: z.array(z.string()),
  entities: z.record(z.string(), z.unknown()),
  sentiment: z.object({ label: z.enum(['positive', 'neutral', 'negative']), confidence: z.number().min(0).max(1), evidence: z.array(z.object({ phrase: z.string() }).passthrough()), method: z.string(), basis: z.literal('transcript_text') }),
  leadQualification: z.object({ total: z.number().int().min(0).max(100), classification: z.enum(['hot', 'warm', 'cold']), factors: z.array(factorSchema).length(5), missing: z.array(z.string()), recommendedNextAction: z.object({ type: z.string(), text: z.string(), field: z.string().optional() }) }),
  sources: z.array(sourceSchema).max(3),
  suggestedAction: suggestedActionSchema,
  explanation: z.string().min(1).max(600),
  outcome: z.string(),
});

const FIELD_ORDER = ['budget', 'bedrooms', 'location', 'timeline', 'decisionMaker', 'purpose'];

/** What should happen next, derived from backend state (never from free-form model text). */
export function buildSuggestedAction({ outcome, pendingProposal, offeredSlots, missing }) {
  if (outcome === 'escalated') return { type: 'human_handoff', tool: 'escalateToHuman', requiresConfirmation: false, executed: true, reason: 'Conversation handed to a human sales executive' };
  if (outcome === 'appointment_booked') return { type: 'prepare_visit', tool: 'bookAppointment', requiresConfirmation: true, executed: true, reason: 'Visit booked after explicit customer confirmation' };
  if (pendingProposal) {
    return { type: 'confirm_booking', tool: pendingProposal.tool, args: pendingProposal.args, requiresConfirmation: true, executed: false, reason: 'Waiting for the customer to say yes; nothing is booked until then' };
  }
  if (outcome === 'awaiting_contact') return { type: 'provide_contact', requiresConfirmation: false, executed: false, reason: 'Name and phone are required before a booking can be proposed' };
  if (offeredSlots?.length) return { type: 'choose_slot', tool: 'checkAvailability', requiresConfirmation: false, executed: true, reason: `${offeredSlots.length} free slot(s) offered from the live calendar` };
  const field = FIELD_ORDER.find((k) => missing.includes(k));
  if (field) return { type: 'ask_qualification', field, requiresConfirmation: false, executed: false, reason: `Qualification information still missing: ${field}` };
  return { type: 'none', requiresConfirmation: false, executed: false, reason: 'No further action needed this turn' };
}

/** A concise, auditable explanation built from recorded facts (not model reasoning). */
export function buildExplanation({ analysis, retrieval, steps, prevScore, score, suggestedAction }) {
  const parts = [`Intent: ${analysis.intent}${analysis.secondary.length ? ` (+${analysis.secondary.join(', ')})` : ''} via ${analysis.source}.`];
  if (retrieval) {
    parts.push(retrieval.hits.length
      ? `Answered from ${retrieval.hits.length} source(s), top "${retrieval.hits[0].section}" (relevance ${retrieval.hits[0].relevance}).`
      : 'No source passed the relevance threshold, so no answer was invented.');
  }
  const tools = steps.map((s) => `${s.tool}${s.ok ? '' : ` rejected (${s.error?.code})`}`);
  if (tools.length) parts.push(`Tools: ${tools.join(', ')}.`);
  parts.push(`Lead score ${prevScore}→${score.total} (${score.classification}).`);
  parts.push(`Next: ${suggestedAction.type.replace(/_/g, ' ')}.`);
  return parts.join(' ').slice(0, 600);
}

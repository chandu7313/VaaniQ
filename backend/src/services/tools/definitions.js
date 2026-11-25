import { z } from 'zod';

// Tool DEFINITIONS: what each tool is, who may call it, what it needs, and its input schema.
// No behaviour lives here; implementations are in handlers.js and the pipeline in executor.js.
//   actors:               who may invoke it ('agent' = the AI orchestrator, 'staff' = signed-in user)
//   scope:                resources that must exist and belong to the caller's tenant before execution
//   requiresConfirmation: for the agent, the customer must have explicitly confirmed this exact call
//                         (a signed-in staff member invoking it IS the confirming human)

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

const contact = {
  fullName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'phone must be +91 followed by a 10-digit mobile number').optional(),
  email: z.string().email().optional(),
};

export const toolDefinitions = [
  {
    name: 'searchKnowledge',
    description: 'BM25 retrieval of the top-k verified knowledge chunks with relevance scores',
    sideEffect: 'read', actors: ['agent', 'staff'], scope: [],
    argsSchema: z.object({ query: z.string().min(2).max(500), k: z.number().int().min(1).max(8).default(3) }).strict(),
  },
  {
    name: 'calculateLeadScore',
    description: 'Compute the explainable 100-point score for a profile without saving anything',
    sideEffect: 'read', actors: ['agent', 'staff'], scope: [],
    argsSchema: z.object({ profile: profileSchema, hasBooking: z.boolean().default(false) }).strict(),
  },
  {
    name: 'qualifyLead',
    description: 'Score the lead from its stored, customer-stated facts and persist score + status',
    sideEffect: 'write', actors: ['agent', 'staff'], scope: ['lead'],
    argsSchema: z.object({}).strict(),
  },
  {
    name: 'checkAvailability',
    description: 'List free site-visit slots from the live appointment calendar',
    sideEffect: 'read', actors: ['agent', 'staff'], scope: [],
    argsSchema: z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      daypart: z.enum(['morning', 'afternoon', 'evening']).optional(),
      limit: z.number().int().min(1).max(10).default(3),
    }).strict(),
  },
  {
    name: 'bookAppointment',
    description: 'Book a site visit in a slot (transaction + unique-slot constraint); needs explicit confirmation',
    sideEffect: 'write', actors: ['agent', 'staff'], scope: ['lead'], requiresConfirmation: true,
    argsSchema: z.object({ startsAt: z.string().datetime(), notes: z.string().max(300).optional() }).strict(),
  },
  {
    name: 'saveLead',
    description: 'Create a lead (or return the existing one with the same phone) with stated facts',
    sideEffect: 'write', actors: ['agent', 'staff'], scope: [],
    argsSchema: z.object({ ...contact, profile: profileSchema.default({}) }).strict(),
  },
  {
    name: 'updateLead',
    description: 'Merge newly stated requirements and contact details into the lead (merges repeat callers by phone)',
    sideEffect: 'write', actors: ['agent', 'staff'], scope: ['lead'],
    argsSchema: z.object({ ...contact, profile: profileSchema.default({}) }).strict(),
  },
  {
    name: 'generateCallSummary',
    description: 'Build and persist the structured call summary; optionally end the conversation',
    sideEffect: 'write', actors: ['agent', 'staff'], scope: ['conversation'],
    argsSchema: z.object({ end: z.boolean().default(true) }).strict(),
  },
  {
    name: 'escalateToHuman',
    description: 'Hand the conversation to a human sales executive with a reason',
    sideEffect: 'write', actors: ['agent', 'staff'], scope: ['conversation'],
    argsSchema: z.object({ reason: z.string().min(3).max(200) }).strict(),
  },
];

export const definitionsByName = new Map(toolDefinitions.map((d) => [d.name, d]));

/** Public, schema-free view for the UI and docs. */
export const listTools = () => toolDefinitions.map(({ name, description, sideEffect, actors, scope, requiresConfirmation = false }) => ({ name, description, sideEffect, actors, scope, requiresConfirmation }));

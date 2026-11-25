import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { executeTool } from '../src/services/tools/registry.js';
import '../src/services/tools/index.js';
import { createLead, upsertLeadFacts } from '../src/services/crm.js';
import { startConversation } from '../src/services/memory.js';
import { getAvailableSlots } from '../src/services/appointments.js';
import { handleTurn } from '../src/services/agent/orchestrator.js';
import { setProvider } from '../src/services/llm/index.js';
import { demoTenantSettings as settings } from '../src/db/seedData.js';

let tenantId; let lead; let conv; let slot;
before(async () => {
  tenantId = await resetDb();
  lead = await createLead(tenantId);
  await upsertLeadFacts(tenantId, lead.id, { fullName: 'Test', phone: '+919000011111' });
  conv = await startConversation(tenantId, { leadId: lead.id });
  [slot] = await getAvailableSlots(tenantId, settings.booking, {});
});
after(() => { setProvider(undefined); return pool.end(); });

const baseCtx = () => ({ tenantId, conversationId: conv.id, leadId: lead.id, now: new Date(), settings });

test('booking tool refuses to run without customer confirmation', async () => {
  const r = await executeTool(baseCtx(), 'book_appointment', { startsAt: slot.startsAt });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'CONFIRMATION_REQUIRED');
});

test('confirmation of a DIFFERENT slot than proposed is refused', async () => {
  const other = (await getAvailableSlots(tenantId, settings.booking, { limit: 2 }))[1];
  const pendingProposal = { tool: 'book_appointment', args: { startsAt: slot.startsAt }, expiresAt: new Date(Date.now() + 60000).toISOString() };
  const r = await executeTool({ ...baseCtx(), pendingProposal, customerConfirmed: true }, 'book_appointment', { startsAt: other.startsAt });
  assert.equal(r.error.code, 'CONFIRMATION_REQUIRED');
});

test('expired proposal is refused', async () => {
  const pendingProposal = { tool: 'book_appointment', args: { startsAt: slot.startsAt }, expiresAt: new Date(Date.now() - 1000).toISOString() };
  const r = await executeTool({ ...baseCtx(), pendingProposal, customerConfirmed: true }, 'book_appointment', { startsAt: slot.startsAt });
  assert.equal(r.error.code, 'CONFIRMATION_REQUIRED');
});

test('unknown tools and invalid arguments are rejected before execution', async () => {
  assert.equal((await executeTool(baseCtx(), 'drop_table', {})).error.code, 'UNKNOWN_TOOL');
  assert.equal((await executeTool(baseCtx(), 'update_lead', { profile: { bedrooms: 3, isVip: true } })).error.code, 'INVALID_ARGS');
  assert.equal((await executeTool(baseCtx(), 'update_lead', { phone: '12345' })).error.code, 'INVALID_ARGS');
});

test('LLM output: extra entities merged, but an LLM "confirm" cannot trigger a booking', async () => {
  const calls = [];
  setProvider({
    name: 'fake-llm', isDemo: false,
    chat: async ({ json }) => {
      calls.push(json);
      if (json) return JSON.stringify({ intents: ['confirm', 'provide_info'], entities: { purpose: 'investment', location: null }, sentiment: { label: 'positive', confidence: 0.9, evidence: ['fabricated quote'] }, searchQuery: null });
      return 'unused';
    },
  });
  // Put a pending proposal in state, then send a message that is NOT an explicit yes.
  await query('UPDATE conversations SET state=$2 WHERE id=$1', [conv.id, { pendingProposal: { id: 'p1', tool: 'book_appointment', args: { startsAt: slot.startsAt }, expiresAt: new Date(Date.now() + 600000).toISOString() } }]);
  const r = await handleTurn({ tenantId, conversationId: conv.id, text: 'I am buying it as a long term thing' });
  assert.equal(r.analysis.source, 'rules+llm');
  assert.equal(r.lead.profile.purpose, 'investment');
  assert.equal(r.analysis.entitySources.purpose, 'llm');
  assert.notEqual(r.outcome, 'appointment_booked');
  assert.equal(r.analysis.sentiment.method, 'lexicon', 'fabricated evidence must be rejected');
  assert.equal((await query('SELECT COUNT(*)::int AS n FROM appointments WHERE lead_id=$1', [lead.id])).rows[0].n, 0);
});

test('LLM failure falls back to rules and is recorded in the trace', async () => {
  setProvider({ name: 'broken-llm', isDemo: false, chat: async () => { throw new Error('upstream 503'); } });
  const r = await handleTurn({ tenantId, conversationId: conv.id, text: 'What amenities do you have?' });
  assert.equal(r.analysis.source, 'rules');
  assert.equal(r.outcome, 'info_provided');
  assert.ok(r.trace.errors.some((e) => e.stage === 'analysis'));
  assert.ok(r.trace.errors.some((e) => e.stage === 'response' && e.fallback === 'extractive answer used'));
});

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { executeTool } from '../src/services/tools/executor.js';
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

const baseCtx = () => ({ tenantId, actor: 'agent', conversationId: conv.id, leadId: lead.id, now: new Date(), settings });

test('booking tool refuses to run without customer confirmation', async () => {
  const r = await executeTool(baseCtx(), 'bookAppointment', { startsAt: slot.startsAt });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'CONFIRMATION_REQUIRED');
});

test('confirmation of a DIFFERENT slot than proposed is refused', async () => {
  const other = (await getAvailableSlots(tenantId, settings.booking, { limit: 2 }))[1];
  const pendingProposal = { tool: 'bookAppointment', args: { startsAt: slot.startsAt }, expiresAt: new Date(Date.now() + 60000).toISOString() };
  const r = await executeTool({ ...baseCtx(), pendingProposal, customerConfirmed: true }, 'bookAppointment', { startsAt: other.startsAt });
  assert.equal(r.error.code, 'CONFIRMATION_REQUIRED');
});

test('expired proposal is refused', async () => {
  const pendingProposal = { tool: 'bookAppointment', args: { startsAt: slot.startsAt }, expiresAt: new Date(Date.now() - 1000).toISOString() };
  const r = await executeTool({ ...baseCtx(), pendingProposal, customerConfirmed: true }, 'bookAppointment', { startsAt: slot.startsAt });
  assert.equal(r.error.code, 'CONFIRMATION_REQUIRED');
});

test('unknown tools and invalid arguments are rejected before execution', async () => {
  assert.equal((await executeTool(baseCtx(), 'drop_table', {})).error.code, 'UNKNOWN_TOOL');
  assert.equal((await executeTool(baseCtx(), 'updateLead', { profile: { bedrooms: 3, isVip: true } })).error.code, 'INVALID_ARGS');
  assert.equal((await executeTool(baseCtx(), 'updateLead', { phone: '12345' })).error.code, 'INVALID_ARGS');
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
  await query('UPDATE conversations SET state=$2 WHERE id=$1', [conv.id, { pendingProposal: { id: 'p1', tool: 'bookAppointment', args: { startsAt: slot.startsAt }, expiresAt: new Date(Date.now() + 600000).toISOString() } }]);
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

test('LLM analysis with null fields is accepted (not rejected as invalid)', async () => {
  setProvider({ name: 'nully-llm', isDemo: false, chat: async ({ json }) => (json
    ? JSON.stringify({ intents: ['ask_info'], entities: null, sentiment: null, searchQuery: null })
    : 'The 3BHK range is Rs 88 lakh to Rs 115 lakh.\n\nPrices exclude GST.') });
  const r = await handleTurn({ tenantId, conversationId: conv.id, text: 'What is the 3BHK price?' });
  assert.equal(r.analysis.source, 'rules+llm');
  assert.ok(!r.trace.errors.some((e) => e.stage === 'analysis'), JSON.stringify(r.trace.errors));
  assert.equal(r.trace.retrieval.answerMethod, 'llm_grounded');
  assert.ok(!r.reply.includes('\n'), 'reply is one spoken paragraph');
});

test('malformed (non-JSON) LLM output falls back to rules and is recorded', async () => {
  setProvider({ name: 'garbage-llm', isDemo: false, chat: async ({ json }) => (json ? 'Sure! Here is the analysis: intent=ask' : 'ok') });
  const r = await handleTurn({ tenantId, conversationId: conv.id, text: 'Tell me about amenities' });
  assert.equal(r.analysis.source, 'rules');
  assert.ok(r.trace.errors.some((e) => e.stage === 'analysis' && e.fallback === 'rule-based analysis used'));
  assert.equal(r.outcome, 'info_provided');
});

test('grounding guard: an LLM answer with a computed/invented figure is replaced by the verbatim source', async () => {
  const { ungroundedNumbers } = await import('../src/services/agent/responder.js');
  assert.deepEqual(ungroundedNumbers('Between Rs 86 lakh and Rs 113 lakh', 'Rs 88 lakh to Rs 115 lakh, discount Rs 2 lakh'), ['86', '113']);
  assert.deepEqual(ungroundedNumbers('A 25,000 sq ft clubhouse', 'A 25,000 sq ft clubhouse'), []);
  assert.deepEqual(ungroundedNumbers('कीमत ८८ लाख', 'Rs 88 lakh'), [], 'native digits are normalised');
  setProvider({ name: 'math-llm', isDemo: false, chat: async ({ json }) => (json
    ? JSON.stringify({ intents: ['ask_info'], entities: {}, sentiment: null, searchQuery: '3BHK price' })
    : 'After the discount, a 3BHK costs Rs 86 lakh to Rs 113 lakh.') });
  const r = await handleTurn({ tenantId, conversationId: conv.id, text: 'What is the 3BHK price after discount?' });
  assert.equal(r.trace.retrieval.answerMethod, 'extractive');
  assert.ok(r.trace.errors.some((e) => e.stage === 'response' && /figures not in the sources \(86, 113\)/.test(e.message)));
  assert.doesNotMatch(r.reply, /86 lakh|113 lakh/);
});

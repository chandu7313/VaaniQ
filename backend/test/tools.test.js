import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { executeTool } from '../src/services/tools/executor.js';
import { listTools } from '../src/services/tools/definitions.js';
import { createLead, upsertLeadFacts } from '../src/services/crm.js';
import { startConversation } from '../src/services/memory.js';
import { getAvailableSlots } from '../src/services/appointments.js';
import { demoTenantSettings as settings } from '../src/db/seedData.js';

let tenantId; let otherTenant; let lead; let conv;
const ctx = (extra = {}) => ({ tenantId, actor: 'agent', now: new Date(), settings, conversationId: conv.id, leadId: lead.id, ...extra });
const auditRows = (tool) => query('SELECT actor, status, error_code, args, conversation_id, lead_id FROM tool_audit_log WHERE tenant_id=$1 AND tool=$2 ORDER BY created_at', [tenantId, tool]).then((r) => r.rows);

before(async () => {
  tenantId = await resetDb();
  otherTenant = (await query(`INSERT INTO tenants (name, slug, settings) VALUES ('Other', 'other-t', $1) RETURNING id`, [settings])).rows[0].id;
  lead = await createLead(tenantId);
  await upsertLeadFacts(tenantId, lead.id, { fullName: 'Tool Test', phone: '+919700000001' });
  conv = await startConversation(tenantId, { leadId: lead.id });
});
after(() => pool.end());

test('registry exposes exactly the nine controlled tools with metadata', () => {
  const names = listTools().map((t) => t.name).sort();
  assert.deepEqual(names, ['bookAppointment', 'calculateLeadScore', 'checkAvailability', 'escalateToHuman', 'generateCallSummary', 'qualifyLead', 'saveLead', 'searchKnowledge', 'updateLead']);
  assert.ok(listTools().find((t) => t.name === 'bookAppointment').requiresConfirmation);
});

test('every execution returns a structured record and writes an audit row (even rejections)', async () => {
  const ok = await executeTool(ctx(), 'searchKnowledge', { query: 'price of 3BHK' });
  assert.equal(ok.status, 'success');
  assert.deepEqual(ok.validation.checks, ['tool registered', 'arguments valid', 'actor authorized']);
  const bad = await executeTool(ctx(), 'searchKnowledge', { query: 'x', drop: true });
  assert.equal(bad.status, 'rejected');
  assert.equal(bad.error.code, 'INVALID_ARGS');
  const rows = await auditRows('searchKnowledge');
  assert.deepEqual(rows.map((r) => r.status), ['success', 'rejected']);
  assert.equal(rows[0].conversation_id, conv.id);
});

test('authorization: resources from another tenant are rejected and never recorded', async () => {
  const foreignLead = await createLead(otherTenant);
  const r = await executeTool(ctx({ leadId: foreignLead.id }), 'qualifyLead', {});
  assert.equal(r.status, 'rejected');
  assert.equal(r.error.code, 'FORBIDDEN');
  const rows = await auditRows('qualifyLead');
  assert.equal(rows.at(-1).lead_id, null, 'foreign id is not written to the audit log');
  const noTenant = await executeTool({ actor: 'agent', now: new Date(), settings }, 'searchKnowledge', { query: 'price' });
  assert.equal(noTenant.error.code, 'FORBIDDEN');
  const badActor = await executeTool(ctx({ actor: 'customer' }), 'searchKnowledge', { query: 'price' });
  assert.equal(badActor.error.code, 'FORBIDDEN');
});

test('consent: agent needs the customer\'s confirmation; a signed-in staff member is the confirming human', async () => {
  const [slot] = await getAvailableSlots(tenantId, settings.booking, {});
  const agent = await executeTool(ctx(), 'bookAppointment', { startsAt: slot.startsAt });
  assert.equal(agent.error.code, 'CONFIRMATION_REQUIRED');
  const staff = await executeTool(ctx({ actor: 'staff', conversationId: undefined }), 'bookAppointment', { startsAt: slot.startsAt });
  assert.equal(staff.status, 'success');
  assert.ok(staff.validation.checks.includes('confirmed by signed-in staff member'));
  const stored = await query('SELECT status, notes FROM appointments WHERE id=$1', [staff.result.id]);
  assert.deepEqual(stored.rows[0], { status: 'confirmed', notes: 'Booked manually by staff' });
});

test('saveLead deduplicates by phone; calculateLeadScore is pure; audit args are PII-masked', async () => {
  const a = await executeTool(ctx({ actor: 'staff' }), 'saveLead', { fullName: 'Dup Test', phone: '+919700000002', profile: { bedrooms: 3, budgetMax: 9000000 } });
  const b = await executeTool(ctx({ actor: 'staff' }), 'saveLead', { phone: '+919700000002', profile: { timelineMonths: 1 } });
  assert.equal(a.result.created, true);
  assert.equal(b.result.created, false);
  assert.equal(a.result.leadId, b.result.leadId);
  assert.equal(b.result.lead.profile.timelineMonths, 1);
  assert.equal(b.result.score.total, 25 + 9 + 20, 'stored score reflects merged facts');
  const before = (await query('SELECT COUNT(*)::int n FROM leads')).rows[0].n;
  const calc = await executeTool(ctx(), 'calculateLeadScore', { profile: { bedrooms: 2, budgetMax: 7000000 } });
  assert.equal(calc.result.total, 25 + 9);
  assert.equal((await query('SELECT COUNT(*)::int n FROM leads')).rows[0].n, before, 'nothing persisted');
  const rows = await auditRows('saveLead');
  assert.ok(rows.every((r) => !JSON.stringify(r.args).includes('9700000002')), 'phone masked in audit');
});

test('generateCallSummary and escalateToHuman persist their results', async () => {
  const esc = await executeTool(ctx(), 'escalateToHuman', { reason: 'Customer asked for a manager' });
  assert.equal(esc.status, 'success');
  const sum = await executeTool(ctx({ actor: 'staff' }), 'generateCallSummary', { end: true });
  assert.equal(sum.status, 'success');
  const row = await query('SELECT summary FROM call_summaries WHERE conversation_id=$1', [conv.id]);
  assert.equal(row.rows[0].summary.outcome, 'Escalated to human');
});

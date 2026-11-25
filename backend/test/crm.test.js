import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { startServer } from './http.js';
import { hashPassword } from '../src/lib/password.js';

let h; let admin; let agentUser; let tenantId;
const as = (tok) => (m, p, b) => h.request(m, p, b, tok);
let api; let apiAgent;

before(async () => {
  tenantId = await resetDb();
  h = await startServer();
  admin = await h.login();
  await query(`INSERT INTO users (tenant_id, email, password_hash, full_name, role) VALUES ($1, 'exec@abc.test', $2, 'Sales Exec', 'agent')`, [tenantId, await hashPassword('exec-pass-1')]);
  agentUser = await h.login('exec@abc.test', 'exec-pass-1');
  api = as(admin); apiAgent = as(agentUser);
});
after(async () => { h.server.close(); await pool.end(); });

test('leads: create (scored, deduplicated), read, update, delete, all persisted', async () => {
  const c = await api('POST', '/leads', { fullName: 'Kavya N', phone: '+919811100001', profile: { bedrooms: 3, budgetMax: 9000000, timelineMonths: 1 } });
  assert.equal(c.status, 201);
  assert.equal(c.body.data.created, true);
  const id = c.body.data.leadId;
  const row = (await query('SELECT full_name, phone, score, profile, status FROM leads WHERE id=$1', [id])).rows[0];
  assert.deepEqual({ n: row.full_name, s: row.score, b: row.profile.bedrooms }, { n: 'Kavya N', s: 25 + 9 + 20, b: 3 });
  const dup = await api('POST', '/leads', { phone: '+919811100001', profile: { location: 'Gachibowli' } });
  assert.equal(dup.body.data.leadId, id, 'same phone -> same lead');
  assert.equal((await query('SELECT COUNT(*)::int n FROM leads WHERE phone=$1', ['+919811100001'])).rows[0].n, 1);
  assert.equal((await api('GET', `/leads/${id}`)).body.data.profile.location, 'Gachibowli');
  assert.equal((await api('PATCH', `/leads/${id}`, { status: 'nurture' })).body.data.status, 'nurture');
  assert.equal((await api('PATCH', `/leads/${id}`, { score: 100 })).status, 400, 'computed fields cannot be written');
  assert.equal((await api('POST', '/leads', { phone: '12345' })).status, 400);
  assert.equal((await apiAgent('DELETE', `/leads/${id}`)).status, 403, 'only admins delete');
  assert.equal((await api('DELETE', `/leads/${id}`)).status, 204);
  assert.equal((await query('SELECT 1 FROM leads WHERE id=$1', [id])).rowCount, 0);
  assert.equal((await api('GET', `/leads/${id}`)).status, 404);
});

test('customers: a view over identified leads with full CRUD', async () => {
  assert.equal((await api('POST', '/customers', { fullName: 'No Phone' })).status, 400, 'customers need a phone');
  const c = await api('POST', '/customers', { fullName: 'Arun Rao', phone: '+919811100002', email: 'arun@example.test' });
  assert.equal(c.status, 201);
  const id = c.body.data.id;
  assert.equal(c.body.data.appointment_count, 0);
  assert.equal((await api('POST', '/customers', { fullName: 'Arun Rao', phone: '+919811100002' })).status, 200, 'existing customer returned, not duplicated');
  assert.ok((await api('GET', '/customers?search=Arun')).body.data.some((x) => x.id === id));
  const u = await api('PATCH', `/customers/${id}`, { fullName: 'Arun K Rao', profile: { bedrooms: 2 } });
  assert.equal(u.body.data.full_name, 'Arun K Rao');
  assert.equal((await query('SELECT profile->>\'bedrooms\' b FROM leads WHERE id=$1', [id])).rows[0].b, '2');
  const anon = (await api('POST', '/leads', {})).body.data.leadId;
  assert.equal((await api('GET', `/customers/${anon}`)).status, 404, 'an anonymous lead is not a customer');
  assert.equal((await api('DELETE', `/customers/${id}`)).status, 204);
  assert.equal((await query('SELECT 1 FROM leads WHERE id=$1', [id])).rowCount, 0);
});

test('conversations: create, read, delete cascades messages/traces', async () => {
  const conv = (await api('POST', '/conversations', { language: 'en' })).body.data.conversation;
  await api('POST', `/conversations/${conv.id}/messages`, { text: 'What amenities do you have?' });
  assert.ok((await query('SELECT COUNT(*)::int n FROM messages WHERE conversation_id=$1', [conv.id])).rows[0].n >= 3);
  assert.equal((await api('GET', `/conversations/${conv.id}`)).body.data.messages.length, 3);
  assert.equal((await api('DELETE', `/conversations/${conv.id}`)).status, 204);
  for (const t of ['conversations', 'messages', 'agent_execution_logs']) {
    const col = t === 'conversations' ? 'id' : 'conversation_id';
    assert.equal((await query(`SELECT COUNT(*)::int n FROM ${t} WHERE ${col}=$1`, [conv.id])).rows[0].n, 0, t);
  }
});

test('appointments: staff create via tool, read, reschedule, status, delete; duplicate + conflict rejected', async () => {
  const lead = (await api('POST', '/leads', { fullName: 'Slot Owner', phone: '+919811100003' })).body.data.leadId;
  const other = (await api('POST', '/leads', { fullName: 'Second Person', phone: '+919811100004' })).body.data.leadId;
  const anon = (await api('POST', '/leads', {})).body.data.leadId;
  const slots = (await api('GET', '/appointments/availability?limit=5')).body.data;
  const a = await api('POST', '/appointments', { leadId: lead, startsAt: slots[0].startsAt });
  assert.equal(a.status, 201);
  assert.equal((await query('SELECT status FROM appointments WHERE id=$1', [a.body.data.id])).rows[0].status, 'confirmed');
  assert.equal((await api('POST', '/appointments', { leadId: other, startsAt: slots[0].startsAt })).body.error.code, 'SLOT_TAKEN');
  assert.equal((await api('POST', '/appointments', { leadId: lead, startsAt: slots[1].startsAt })).body.error.code, 'LEAD_ALREADY_BOOKED');
  assert.equal((await api('POST', '/appointments', { leadId: anon, startsAt: slots[2].startsAt })).body.error.code, 'MISSING_CONTACT');
  assert.equal((await query('SELECT COUNT(*)::int n FROM appointments WHERE starts_at=$1 AND status=\'confirmed\'', [slots[0].startsAt])).rows[0].n, 1);
  assert.equal((await api('GET', `/appointments/${a.body.data.id}`)).body.data.full_name, 'Slot Owner');
  assert.equal((await api('PATCH', `/appointments/${a.body.data.id}/reschedule`, { startsAt: slots[3].startsAt })).status, 200);
  assert.equal((await api('PATCH', `/appointments/${a.body.data.id}/status`, { status: 'cancelled' })).body.data.status, 'cancelled');
  assert.equal((await api('DELETE', `/appointments/${a.body.data.id}`)).status, 204);
  assert.equal((await query('SELECT 1 FROM appointments WHERE id=$1', [a.body.data.id])).rowCount, 0);
  const audit = (await query(`SELECT status, error_code, actor FROM tool_audit_log WHERE tool='bookAppointment' AND actor='staff' ORDER BY created_at`)).rows;
  assert.deepEqual(audit.map((r) => r.error_code), [null, 'SLOT_TAKEN', 'LEAD_ALREADY_BOOKED', 'MISSING_CONTACT']);
});

test('call summaries: generate, list, read, annotate, delete', async () => {
  const conv = (await api('POST', '/conversations', {})).body.data.conversation;
  await api('POST', `/conversations/${conv.id}/messages`, { text: 'I need a 3BHK in Gachibowli, budget 90 lakhs' });
  const s = await api('POST', '/call-summaries', { conversationId: conv.id });
  assert.equal(s.status, 201);
  const row = (await query('SELECT id, summary FROM call_summaries WHERE conversation_id=$1', [conv.id])).rows[0];
  assert.equal(row.summary.requirements.configuration, '3BHK');
  assert.ok((await api('GET', '/call-summaries')).body.data.some((x) => x.id === row.id));
  const p = await api('PATCH', `/call-summaries/${row.id}`, { staffNotes: 'Called back, wants east facing', followUpDone: true });
  assert.equal(p.body.data.summary.staffNotes, 'Called back, wants east facing');
  assert.equal(p.body.data.summary.requirements.configuration, '3BHK', 'generated content kept');
  assert.equal((await api('PATCH', `/call-summaries/${row.id}`, { outcome: 'faked' })).status, 400, 'generated fields are not editable');
  assert.equal((await api('DELETE', `/call-summaries/${row.id}`)).status, 204);
  assert.equal((await api('GET', `/call-summaries/${row.id}`)).status, 404);
});

test('dashboard KPIs equal direct database counts (no hardcoded analytics)', async () => {
  const o = (await api('GET', '/analytics/overview')).body.data;
  const [db] = (await query(`SELECT (SELECT COUNT(*)::int FROM leads) leads, (SELECT COUNT(*)::int FROM leads WHERE score >= 50) qualified,
    (SELECT COUNT(*)::int FROM appointments WHERE status IN ('confirmed','completed')) booked,
    (SELECT COUNT(DISTINCT lead_id)::int FROM appointments WHERE status IN ('confirmed','completed')) with_visit`)).rows;
  assert.equal(o.kpi.leads, db.leads);
  assert.equal(o.kpi.qualified_leads, db.qualified);
  assert.equal(o.kpi.booked_appointments, db.booked);
  assert.equal(o.kpi.visit_conversion, db.leads ? Math.round((100 * db.with_visit) / db.leads) : 0);
  const pipeline = Object.fromEntries(o.leadsByStatus.map((r) => [r.status, r.count]));
  const direct = Object.fromEntries((await query('SELECT status, COUNT(*)::int c FROM leads GROUP BY status')).rows.map((r) => [r.status, r.c]));
  assert.deepEqual(pipeline, direct);
});

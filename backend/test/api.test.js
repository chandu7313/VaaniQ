import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/password.js';
import { DEMO_ADMIN_EMAIL } from '../src/db/seed.js';

let server; let base; let token; let tenantId;
const SCENARIO = 'I am looking for a 3BHK apartment in Gachibowli. My budget is around ₹90 lakhs. I am planning to purchase within the next month. Can you tell me about the project and arrange a site visit?';

async function api(method, path, body, tok = token) {
  const res = await fetch(`${base}${path}`, { method, headers: { 'content-type': 'application/json', ...(tok ? { authorization: `Bearer ${tok}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const json = res.status === 204 ? null : await res.json();
  return { status: res.status, body: json };
}

before(async () => {
  tenantId = await resetDb();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => { server.close(); await pool.end(); });

test('health check and authentication', async () => {
  assert.equal((await api('GET', '/health', null, null)).body.data.database, 'ok');
  assert.equal((await api('POST', '/auth/login', { email: DEMO_ADMIN_EMAIL, password: 'wrong' }, null)).status, 401);
  assert.equal((await api('GET', '/leads', null, null)).status, 401);
  assert.equal((await api('GET', '/leads', null, 'not-a-jwt')).status, 401);
  const ok = await api('POST', '/auth/login', { email: DEMO_ADMIN_EMAIL, password: 'test-password-1' }, null);
  assert.equal(ok.status, 200);
  token = ok.body.data.token;
  const meta = await api('GET', '/meta');
  assert.equal(meta.body.data.demoMode, true);
  assert.ok(meta.body.data.tools.some((t) => t.name === 'bookAppointment' && t.requiresConfirmation));
});

test('request validation returns a consistent error envelope', async () => {
  const conv = await api('POST', '/conversations', { language: 'en' });
  const bad = await api('POST', `/conversations/${conv.body.data.conversation.id}/messages`, { text: '' });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.code, 'VALIDATION_ERROR');
  assert.equal((await api('POST', '/conversations', { language: 'fr' })).status, 400);
  assert.equal((await api('GET', '/conversations/not-a-uuid')).status, 400);
});

test('full scenario: qualify, RAG answer, offer slots, collect contact, confirm, book, summarise', async () => {
  const start = await api('POST', '/conversations', { language: 'en', channel: 'voice' });
  assert.equal(start.status, 201);
  const id = start.body.data.conversation.id;
  assert.match(start.body.data.greeting.content, /VaaniQ/);

  // Turn 1: the assessment scenario message
  const t1 = (await api('POST', `/conversations/${id}/messages`, { text: SCENARIO })).body.data;
  assert.equal(t1.outcome, 'slots_offered');
  assert.equal(t1.analysis.intent, 'request_visit');
  assert.match(t1.reply, /3BHK/);
  assert.match(t1.reply, /fits our 3BHK range/);
  assert.ok(t1.sources.length > 0, 'answer must cite sources');
  assert.equal(t1.offeredSlots.length, 3);
  assert.equal(t1.score.total, 74);
  assert.equal(t1.pendingConfirmation, null);
  assert.deepEqual(t1.trace.steps.map((s) => s.tool), ['updateLead', 'searchKnowledge', 'checkAvailability', 'qualifyLead']);
  assert.ok(t1.trace.steps.every((s) => s.validation.ok));

  // Turn 2: choose slot + give contact -> proposal awaiting confirmation; nothing booked yet
  const t2 = (await api('POST', `/conversations/${id}/messages`, { text: 'The first one works. My name is Anil Kumar and my number is 98765 43210' })).body.data;
  assert.equal(t2.outcome, 'confirmation_requested');
  assert.ok(t2.pendingConfirmation);
  assert.equal(t2.pendingConfirmation.startsAt, t1.offeredSlots[0].startsAt);
  assert.equal((await query('SELECT COUNT(*)::int AS n FROM appointments WHERE conversation_id=$1', [id])).rows[0].n, 0);
  assert.ok(!JSON.stringify(t2.trace).includes('9876543210'), 'phone must be masked in trace');

  // Turn 3: explicit yes -> validated booking tool executes
  const t3 = (await api('POST', `/conversations/${id}/messages`, { text: 'Yes, please confirm' })).body.data;
  assert.equal(t3.outcome, 'appointment_booked');
  const bookStep = t3.trace.steps.find((s) => s.tool === 'bookAppointment');
  assert.ok(bookStep.ok);
  assert.ok(bookStep.validation.checks.includes('customer confirmed this exact proposal'));
  const appt = (await query('SELECT * FROM appointments WHERE conversation_id=$1', [id])).rows;
  assert.equal(appt.length, 1);
  assert.equal(appt[0].starts_at.toISOString(), t1.offeredSlots[0].startsAt);
  assert.equal(t3.lead.status, 'visit_scheduled');
  assert.equal(t3.score.total, 77);
  assert.match(t3.reply, /When|decision/i);

  // Turn 4: more qualification info
  const t4 = (await api('POST', `/conversations/${id}/messages`, { text: 'I will decide together with my wife. Thank you, this is great!' })).body.data;
  assert.equal(t4.lead.profile.decisionMaker, 'joint');
  assert.equal(t4.analysis.sentiment.label, 'positive');
  assert.equal(t4.score.total, 87);

  // End call -> structured summary persisted
  const summary = (await api('POST', `/conversations/${id}/end`)).body.data;
  assert.equal(summary.outcome, 'Site visit booked');
  assert.equal(summary.requirements.configuration, '3BHK');
  assert.equal(summary.requirements.budget, '₹90 lakh');
  assert.ok(summary.recommendedNextActions.length > 0);
  assert.equal(summary.leadScore.total, 87);
  const detail = (await api('GET', `/conversations/${id}`)).body.data;
  assert.equal(detail.status, 'ended');
  assert.equal(detail.messages.length, 9);
  assert.ok(detail.summary);
  assert.equal((await api('POST', `/conversations/${id}/messages`, { text: 'hello' })).status, 409);

  const traces = (await api('GET', `/conversations/${id}/traces`)).body.data;
  assert.equal(traces.length, 4);
  const overview = (await api('GET', '/analytics/overview')).body.data;
  assert.ok(overview.kpi.confirmed_visits >= 1);
  assert.ok(overview.tools.some((t) => t.tool === 'bookAppointment' && t.succeeded >= 1));
});

test('declining a proposal books nothing', async () => {
  const id = (await api('POST', '/conversations', {})).body.data.conversation.id;
  await api('POST', `/conversations/${id}/messages`, { text: 'I want a site visit. My name is Priya and my number is 9123456780' });
  const t2 = (await api('POST', `/conversations/${id}/messages`, { text: 'second one' })).body.data;
  assert.equal(t2.outcome, 'confirmation_requested');
  const t3 = (await api('POST', `/conversations/${id}/messages`, { text: 'No, not now' })).body.data;
  assert.equal(t3.outcome, 'proposal_declined');
  assert.equal((await query('SELECT COUNT(*)::int AS n FROM appointments WHERE conversation_id=$1', [id])).rows[0].n, 0);
});

test('unknown information is not invented', async () => {
  const id = (await api('POST', '/conversations', {})).body.data.conversation.id;
  const t1 = (await api('POST', `/conversations/${id}/messages`, { text: 'Do you have a helipad and a private golf course?' })).body.data;
  assert.equal(t1.outcome, 'info_not_found');
  assert.match(t1.reply, /do not have verified information/);
  assert.equal(t1.sources.length, 0);
});

test('human escalation and Hindi conversation', async () => {
  const id = (await api('POST', '/conversations', {})).body.data.conversation.id;
  const t1 = (await api('POST', `/conversations/${id}/messages`, { text: 'I want to talk to a human' })).body.data;
  assert.equal(t1.outcome, 'escalated');
  assert.equal(t1.conversationStatus, 'escalated');

  const hi = (await api('POST', '/conversations', { language: 'hi' })).body.data.conversation.id;
  const h1 = (await api('POST', `/conversations/${hi}/messages`, { text: 'मुझे गाचीबोवली में 3BHK चाहिए, बजट 90 लाख है। कीमत क्या है?' })).body.data;
  assert.equal(h1.lead.profile.bedrooms, 3);
  assert.equal(h1.lead.profile.budgetMax, 9000000);
  assert.match(h1.reply, /नोट किया/);
  assert.ok(h1.sources.some((s) => /Pricing/.test(s.title)));
});

test('tenant isolation: another tenant cannot read this tenant\'s data', async () => {
  const { rows } = await query(`INSERT INTO tenants (name, slug, settings) VALUES ('Other Co', 'other-co', $1) RETURNING id`, [{}]);
  await query(`INSERT INTO users (tenant_id, email, password_hash, full_name) VALUES ($1, 'other@other.test', $2, 'Other')`, [rows[0].id, await hashPassword('other-pass-1')]);
  const other = (await api('POST', '/auth/login', { email: 'other@other.test', password: 'other-pass-1' }, null)).body.data.token;
  const mine = (await api('GET', '/conversations')).body.data;
  assert.ok(mine.length > 0);
  assert.equal((await api('GET', `/conversations/${mine[0].id}`, null, other)).status, 404);
  assert.equal((await api('POST', `/conversations/${mine[0].id}/messages`, { text: 'hi' }, other)).status, 404);
  assert.equal((await api('GET', '/leads', null, other)).body.data.length, 0);
  assert.equal((await api('GET', '/knowledge', null, other)).body.data.length, 0);
});

test('deleting a user revokes their existing token immediately', async () => {
  const { rows } = await query(`INSERT INTO users (tenant_id, email, password_hash, full_name) VALUES ($1, 'temp@abc.test', $2, 'Temp') RETURNING id`, [tenantId, await hashPassword('temp-pass-1')]);
  const tok = (await api('POST', '/auth/login', { email: 'temp@abc.test', password: 'temp-pass-1' }, null)).body.data.token;
  assert.equal((await api('GET', '/meta', null, tok)).status, 200);
  await query('DELETE FROM users WHERE id = $1', [rows[0].id]);
  const after = await api('GET', '/meta', null, tok);
  assert.equal(after.status, 401);
  assert.equal(after.body.error.code, 'INVALID_TOKEN');
});

test('knowledge base: ingest, search with citations, delete', async () => {
  const doc = (await api('POST', '/knowledge', { title: 'Rooftop Observatory (demo)', content: '# Rooftop Observatory\n## Telescope booking\nResidents can reserve the rooftop telescope deck for stargazing in one-hour sessions.' })).body.data;
  assert.equal(doc.chunkCount, 1);
  const hits = (await api('POST', '/knowledge/search', { query: 'reserve the telescope for stargazing' })).body.data;
  assert.equal(hits[0].title, 'Rooftop Observatory (demo)');
  assert.equal(hits[0].section, 'Telescope booking');
  assert.equal((await api('DELETE', `/knowledge/${doc.id}`)).status, 204);
  assert.notEqual((await api('POST', '/knowledge/search', { query: 'reserve the telescope for stargazing' })).body.data[0]?.title, 'Pet Policy (demo)');
});

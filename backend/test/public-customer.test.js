import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool } from './helpers.js';
import { createApp } from '../src/app.js';
import { DEMO_ADMIN_EMAIL } from '../src/db/seed.js';

let server;
let base;

async function req(method, path, body, headers = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = res.status === 204 ? null : await res.json();
  return { status: res.status, body: json };
}

before(async () => {
  await resetDb();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server?.close();
  await pool.end();
});

test('public overview resolves allowed slug only and hides internal policies', async () => {
  const bad = await req('GET', '/public/unknown-tenant/overview');
  assert.equal(bad.status, 404);

  const ok = await req('GET', '/public/abc-developers/overview');
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.tenant.slug, 'abc-developers');
  assert.equal(ok.body.data.tenant.projectName, 'GreenHaven Residences');
  assert.ok(ok.body.data.tenant.units.length >= 2);
  assert.ok(ok.body.data.availableSlots.length > 0);
  assert.ok(
    !ok.body.data.highlights.some((h) => /sales and booking policies/i.test(h.title)),
    'internal policy documents must not be exposed publicly',
  );
});

test('public knowledge search excludes internal policies', async () => {
  const res = await req('POST', '/public/abc-developers/knowledge/search', {
    query: 'cancellation refund token discount negotiation policy',
    k: 6,
  });
  assert.equal(res.status, 200);
  assert.ok(
    !res.body.data.some((h) => /sales and booking policies/i.test(h.title)),
    'internal sales policy chunks must be filtered from public RAG search',
  );
});

test('public session isolation blocks cross-conversation access and admin APIs', async () => {
  const s1 = await req('POST', '/public/abc-developers/conversations', { language: 'en', channel: 'voice' });
  const s2 = await req('POST', '/public/abc-developers/conversations', { language: 'en', channel: 'voice' });
  assert.equal(s1.status, 201);
  assert.equal(s2.status, 201);

  const c1 = s1.body.data.conversation.id;
  const tok1 = s1.body.data.sessionToken;
  const c2 = s2.body.data.conversation.id;

  // Missing session token rejected
  const noTok = await req('GET', `/public/abc-developers/conversations/${c1}`);
  assert.equal(noTok.status, 401);

  // Token 1 cannot access conversation 2
  const cross = await req('GET', `/public/abc-developers/conversations/${c2}`, null, {
    'x-customer-session': tok1,
  });
  assert.equal(cross.status, 403);

  // Customer session token cannot access admin endpoints even if sent as Bearer token
  const adminLeads = await req('GET', '/leads', null, { authorization: `Bearer ${tok1}` });
  assert.equal(adminLeads.status, 401);
  const adminTraces = await req('GET', '/traces', null, { authorization: `Bearer ${tok1}` });
  assert.equal(adminTraces.status, 401);
});

test('full public customer journey persists to PostgreSQL and is visible in Business Admin Panel without leaking CRM/trace publicly', async () => {
  const start = await req('POST', '/public/abc-developers/conversations', { language: 'en', channel: 'voice' });
  assert.equal(start.status, 201);
  const { sessionToken, conversation } = start.body.data;
  const convId = conversation.id;
  const sessionHdr = { 'x-customer-session': sessionToken };

  // Check start response does not expose CRM leadId
  assert.equal(start.body.data.leadId, undefined);

  // Turn 1: Customer asks about 3BHK + states budget & timeline
  const t1 = await req(
    'POST',
    `/public/abc-developers/conversations/${convId}/messages`,
    { text: 'I am looking for a 3BHK apartment in Gachibowli with a budget of 90 lakh within 2 months.' },
    sessionHdr,
  );
  assert.equal(t1.status, 200);
  const d1 = t1.body.data;
  assert.equal(d1.trace, undefined, 'must not expose agent decision trace publicly');
  assert.equal(d1.lead, undefined, 'must not expose CRM lead record publicly');
  assert.equal(d1.score, undefined, 'must not expose internal lead score publicly');
  assert.equal(d1.sentiment, undefined, 'must not expose sentiment internals publicly');
  assert.equal(d1.collectedRequirements.bedrooms, 3);
  assert.equal(d1.collectedRequirements.budgetLakh, 90);
  assert.equal(d1.collectedRequirements.location, 'Gachibowli');
  assert.equal(d1.collectedRequirements.timelineMonths, 2);

  // Customer checks availability and selects an open slot
  const avail = await req('GET', '/public/abc-developers/availability?limit=3');
  assert.equal(avail.status, 200);
  assert.ok(avail.body.data.length > 0);
  const chosenSlot = avail.body.data[0].startsAt;

  const pick = await req(
    'POST',
    `/public/abc-developers/conversations/${convId}/select-slot`,
    { startsAt: chosenSlot },
    sessionHdr,
  );
  assert.equal(pick.status, 200);
  assert.equal(pick.body.data.needsContact, true);
  assert.equal(pick.body.data.pendingConfirmation, null);

  // Contact submission requires explicit consent: true
  const badContact = await req(
    'POST',
    `/public/abc-developers/conversations/${convId}/contact`,
    { fullName: 'Priya Nair', phone: '+919876501234', consent: false },
    sessionHdr,
  );
  assert.equal(badContact.status, 400);

  const okContact = await req(
    'POST',
    `/public/abc-developers/conversations/${convId}/contact`,
    { fullName: 'Priya Nair', phone: '+919876501234', consent: true },
    sessionHdr,
  );
  assert.equal(okContact.status, 200);
  assert.equal(okContact.body.data.contactSaved, true);
  assert.ok(okContact.body.data.pendingConfirmation);
  assert.equal(okContact.body.data.pendingConfirmation.startsAt, chosenSlot);

  // Customer explicitly confirms booking
  const confirm = await req(
    'POST',
    `/public/abc-developers/conversations/${convId}/messages`,
    { text: 'Yes, please confirm' },
    sessionHdr,
  );
  assert.equal(confirm.status, 200);
  assert.ok(confirm.body.data.appointment);
  assert.equal(confirm.body.data.appointment.startsAt, chosenSlot);
  assert.match(confirm.body.data.appointment.reference, /^[A-Z0-9]{8}$/);

  // Customer completes/ends conversation
  const end = await req('POST', `/public/abc-developers/conversations/${convId}/end`, {}, sessionHdr);
  assert.equal(end.status, 200);
  assert.equal(end.body.data.status, 'ended');
  assert.equal(end.body.data.summary, undefined, 'must not leak internal summary/score to customer');

  // Admin logs into Business Admin Panel and sees the exact persisted conversation, lead, score, trace, summary & appointment
  const login = await req('POST', '/auth/login', { email: DEMO_ADMIN_EMAIL, password: 'test-password-1' });
  assert.equal(login.status, 200);
  const adminHdr = { authorization: `Bearer ${login.body.data.token}` };

  const adminConv = await req('GET', `/conversations/${convId}`, null, adminHdr);
  assert.equal(adminConv.status, 200);
  assert.equal(adminConv.body.data.lead.full_name, 'Priya Nair');
  assert.equal(adminConv.body.data.lead.status, 'visit_scheduled');
  assert.ok(adminConv.body.data.lead.score > 0);
  assert.ok(adminConv.body.data.summary, 'admin panel must see generated call summary');

  const adminTraces = await req('GET', `/conversations/${convId}/traces`, null, adminHdr);
  assert.equal(adminTraces.status, 200);
  assert.ok(adminTraces.body.data.length >= 2);
});

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { createApp } from '../src/app.js';
import { DEMO_ADMIN_EMAIL } from '../src/db/seed.js';
import { setMailer } from '../src/services/email.js';

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
  setMailer(null);
  server?.close();
  await pool.end();
});

test('public contact stores customer email and admin confirmation sends confirmation email', async () => {
  const sentEmails = [];
  setMailer(async (mail) => {
    sentEmails.push(mail);
    return { messageId: 'test-msg-1' };
  });

  // 1. Customer starts conversation, selects a slot, enters name + phone + email, and confirms slot
  const start = await req('POST', '/public/abc-developers/conversations', { language: 'en', channel: 'voice' });
  const convId = start.body.data.conversation.id;
  const sessionHdr = { 'x-customer-session': start.body.data.sessionToken };
  const avail = await req('GET', '/public/abc-developers/availability?limit=3');
  const slot = avail.body.data[0].startsAt;

  await req('POST', `/public/abc-developers/conversations/${convId}/select-slot`, { startsAt: slot }, sessionHdr);
  const contact = await req(
    'POST',
    `/public/abc-developers/conversations/${convId}/contact`,
    { fullName: 'Aarav Mehta', phone: '+919876511223', email: 'aarav.mehta@example.com', consent: true },
    sessionHdr,
  );
  assert.equal(contact.status, 200);
  await req('POST', `/public/abc-developers/conversations/${convId}/messages`, { text: 'Yes, confirm' }, sessionHdr);

  const apptRow = (await query('SELECT id, confirmed_by_admin, confirmation_email_sent_at FROM appointments WHERE conversation_id=$1', [convId])).rows[0];
  assert.ok(apptRow);
  assert.equal(apptRow.confirmed_by_admin, false, 'not yet admin confirmed');
  assert.equal(sentEmails.length, 0);

  // 2. Admin logs in and confirms the appointment -> triggers email to customer
  const login = await req('POST', '/auth/login', { email: DEMO_ADMIN_EMAIL, password: 'test-password-1' });
  const adminHdr = { authorization: `Bearer ${login.body.data.token}` };
  const confirm = await req('POST', `/appointments/${apptRow.id}/confirm`, {}, adminHdr);
  assert.equal(confirm.status, 200);
  assert.equal(confirm.body.data.confirmed_by_admin, true);
  assert.equal(confirm.body.data.emailNotification.sent, true);
  assert.equal(confirm.body.data.emailNotification.to, 'aarav.mehta@example.com');
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'aarav.mehta@example.com');
  assert.match(sentEmails[0].subject, /Site Visit Confirmed: GreenHaven Residences/);
  assert.match(sentEmails[0].text, /Aarav Mehta/);

  // 3. Admin creates an appointment manually for a lead with email -> sends email automatically
  const leadRes = await req(
    'POST',
    '/leads',
    { fullName: 'Diya Kapoor', phone: '+919876544332', email: 'diya.kapoor@example.com' },
    adminHdr,
  );
  const book = await req(
    'POST',
    '/appointments',
    { leadId: leadRes.body.data.leadId, startsAt: avail.body.data[1].startsAt },
    adminHdr,
  );
  assert.equal(book.status, 201);
  assert.equal(book.body.data.result.emailNotification.sent, true);
  assert.equal(sentEmails.length, 2);
  assert.equal(sentEmails[1].to, 'diya.kapoor@example.com');
});

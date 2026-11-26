// Integration tests for the AI request lifecycle (HTTP -> orchestrator -> PostgreSQL), DEMO_MODE provider.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { createApp } from '../src/app.js';
import { DEMO_ADMIN_EMAIL } from '../src/db/seed.js';

let server; let base; let token;
const call = async (method, path, body) => {
  const res = await fetch(`${base}${path}`, { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json() };
};
const newSession = async (language = 'en') => (await call('POST', '/conversations', { language })).body.data.conversation.id;
const say = async (id, text, language) => {
  const r = await call('POST', `/conversations/${id}/messages`, { text, ...(language ? { language } : {}) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return r.body.data;
};
const factor = (turn, key) => turn.leadQualification.factors.find((f) => f.key === key).points;

before(async () => {
  await resetDb();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
  const login = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: DEMO_ADMIN_EMAIL, password: 'test-password-1' }) });
  token = (await login.json()).data.token;
});
after(async () => { server.close(); await pool.end(); });

test('response contract: every structured field is present and the pipeline events are recorded', async () => {
  const t = await say(await newSession(), 'What is the price of a 3BHK?');
  for (const k of ['reply', 'intent', 'entities', 'sentiment', 'leadQualification', 'sources', 'suggestedAction', 'explanation', 'session', 'trace']) assert.ok(k in t, `missing ${k}`);
  assert.deepEqual(
    [...new Set(t.trace.events.map((e) => e.step))],
    ['memory', 'intent', 'entities', 'sentiment', 'tool', 'retrieval', 'response', 'scoring', 'output_validated'],
  );
  assert.ok(t.trace.events.every((e) => typeof e.summary === 'string' && e.summary.length < 200), 'events are concise');
  assert.equal(t.session.turn, 1);
});

test('1. pricing question: answered from the Price list with sources, no invented figures', async () => {
  const t = await say(await newSession(), 'What is the price of a 3BHK?');
  assert.equal(t.intent, 'ask_info');
  assert.equal(t.outcome, 'info_provided');
  assert.equal(t.sources[0].section, 'Price list');
  assert.ok(t.sources.length <= 3);
  assert.match(t.reply, /88 lakh to Rs 115 lakh/);
  assert.match(t.explanation, /Price list/);
  assert.equal(t.suggestedAction.type, 'ask_qualification');
  assert.equal(t.suggestedAction.field, 'budget');
});

test('2. unsupported question: explicit fallback, no sources, nothing made up', async () => {
  const t = await say(await newSession(), 'Do you have a helipad and a cricket stadium?');
  assert.equal(t.outcome, 'info_not_found');
  assert.deepEqual(t.sources, []);
  assert.match(t.reply, /do not have verified information/);
  assert.doesNotMatch(t.reply, /lakh|₹|Rs /);
  assert.match(t.explanation, /no answer was invented/);
});

test('3. budget change mid-conversation: newer value wins and the score is recomputed', async () => {
  const id = await newSession();
  const t1 = await say(id, 'I want a 3BHK in Gachibowli, budget 90 lakhs');
  assert.equal(factor(t1, 'budget'), 25);
  const t2 = await say(id, 'Actually, my budget is now 75 lakhs');
  assert.equal(t2.lead.profile.budgetMax, 7500000);
  assert.equal(t2.lead.profile.bedrooms, 3, 'earlier facts are kept');
  assert.equal(factor(t2, 'budget'), 10, '75L is 10-20% below the 3BHK floor of 88L');
  assert.match(t2.reply, /budget around ₹75 lakh/);
  assert.match(t2.reply, /slightly above that budget/);
  const stored = await query('SELECT profile->>\'budgetMax\' AS b FROM leads WHERE id = $1', [t2.lead.id]);
  assert.equal(stored.rows[0].b, '7500000');
});

test('4. follow-up question uses the previous topic from memory', async () => {
  const id = await newSession();
  const t1 = await say(id, 'Tell me about the 3BHK apartments');
  assert.equal(t1.outcome, 'info_provided');
  const t2 = await say(id, 'How big are they?');
  assert.equal(t2.outcome, 'info_provided');
  assert.ok(t2.trace.retrieval.contextAdded.length > 0, 'context from memory was added to the query');
  assert.ok(t2.sources.some((s) => s.section === 'Apartment configurations'));
  assert.match(t2.reply, /1620 to 1840 sq ft/);
  assert.equal(t2.session.historyMessagesUsed, 3, 'greeting + first exchange were loaded');
});

test('5. language switch: replies follow the newly selected language and it is persisted', async () => {
  const id = await newSession('en');
  const t1 = await say(id, 'What amenities do you have?');
  assert.match(t1.reply, /From our project information/);
  const t2 = await say(id, 'क्या पार्किंग है?', 'hi');
  assert.equal(t2.session.language, 'hi');
  assert.match(t2.reply, /हमारी परियोजना जानकारी के अनुसार/);
  assert.ok(t2.sources.some((s) => /parking/i.test(s.section)));
  const conv = await query('SELECT language FROM conversations WHERE id = $1', [id]);
  assert.equal(conv.rows[0].language, 'hi');
});

test('6. incomplete information: nothing is invented and the agent asks for what is missing', async () => {
  const t = await say(await newSession(), 'I want to buy a flat');
  assert.deepEqual(t.lead.profile, {});
  assert.equal(t.leadQualification.total, 0);
  for (const m of ['budget', 'bedrooms', 'timeline', 'decisionMaker']) assert.ok(t.leadQualification.missing.includes(m));
  assert.equal(t.suggestedAction.type, 'ask_qualification');
  assert.match(t.reply, /What budget range do you have in mind\?/);
});

test('sessions never mix: two concurrent customers keep separate memory, leads and slots', async () => {
  const [a, b] = await Promise.all([newSession(), newSession()]);
  const [ta, tb] = await Promise.all([
    say(a, 'I need a 3BHK in Gachibowli with a budget of 95 lakhs and I want a site visit'),
    say(b, 'Looking for a 2BHK in Kondapur, budget 70 lakhs'),
  ]);
  assert.notEqual(ta.lead.id, tb.lead.id);
  assert.equal(ta.lead.profile.bedrooms, 3);
  assert.equal(tb.lead.profile.bedrooms, 2);
  assert.equal(ta.offeredSlots.length, 3);
  assert.equal(tb.offeredSlots.length, 0);
  const tb2 = await say(b, 'the first one');
  assert.notEqual(tb2.outcome, 'awaiting_contact', 'B cannot pick a slot that was only offered to A');
  assert.equal(tb2.lead.profile.budgetMax, 7000000);
});

test('structured action proposal: suggestedAction mirrors backend state, not model text', async () => {
  const id = await newSession();
  const t1 = await say(id, 'Please arrange a site visit. My name is Asha Rao and my number is 9811122233');
  assert.equal(t1.suggestedAction.type, 'choose_slot');
  const t2 = await say(id, 'the second one');
  assert.equal(t2.suggestedAction.type, 'confirm_booking');
  assert.equal(t2.suggestedAction.tool, 'bookAppointment');
  assert.equal(t2.suggestedAction.executed, false);
  assert.equal(t2.suggestedAction.args.startsAt, t1.offeredSlots[1].startsAt);
  assert.ok(t2.trace.events.some((e) => e.step === 'action_proposal'));
  const t3 = await say(id, 'yes');
  assert.equal(t3.suggestedAction.type, 'prepare_visit');
  assert.equal(t3.suggestedAction.executed, true);
});

test('memory never turns an unsupported question into an answer about the previous topic', async () => {
  const id = await newSession();
  assert.equal((await say(id, 'What amenities do you have?')).outcome, 'info_provided');
  const t2 = await say(id, 'Do you have a helipad?');
  assert.equal(t2.outcome, 'info_not_found');
  assert.deepEqual(t2.sources, []);
  const t3 = await say(id, 'And what about the size of those apartments?');
  assert.ok(t3.trace.retrieval.contextAdded.length > 0, 'explicit back-reference does use memory');
});

test('a loan amount is not mistaken for a budget; "payment schedule" is not a visit request (regressions)', async () => {
  const t1 = await say(await newSession(), 'What would my EMI be for a 70 lakh loan?');
  assert.equal(t1.lead.profile.budgetMax, undefined, 'loan amount not stored as budget');
  assert.match(t1.reply, /Rs 60,748/);
  const t2 = await say(await newSession(), 'What is the payment schedule?');
  assert.notEqual(t2.outcome, 'slots_offered');
  assert.match(t2.reply, /construction-linked/);
  const t3 = await say(await newSession(), 'Can I schedule a site visit for Saturday?');
  assert.equal(t3.outcome, 'slots_offered', 'a real scheduling request still offers slots');
});

test('demo-mode answer combines the most relevant sentences across close sections', async () => {
  const t = await say(await newSession(), 'Which schools and hospitals are nearby?');
  assert.match(t.reply, /CBSE and IB school/);
  assert.match(t.reply, /multi-speciality hospital/);
  const p = await say(await newSession(), 'What is the price of a 3BHK?');
  assert.equal((p.reply.match(/Rs 88 lakh to Rs 115 lakh/g) || []).length, 1, 'same price not repeated from two documents');
});

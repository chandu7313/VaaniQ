// END-TO-END ACCEPTANCE TEST (assessment scenario). Every claim is checked against PostgreSQL rows,
// not against API responses alone. DEMO_MODE provider; real Express app, real database.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { startServer } from './http.js';
import { scoreLead } from '../src/services/leadScoring.js';
import { demoTenantSettings } from '../src/db/seedData.js';

let h; let api;
const say = async (id, text) => {
  const r = await api('POST', `/conversations/${id}/messages`, { text });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return r.body.data;
};
const db = (sql, params) => query(sql, params).then((r) => r.rows);

before(async () => {
  await resetDb();
  h = await startServer();
  const token = await h.login();
  api = (m, p, b) => h.request(m, p, b, token);
});
after(async () => { h.server.close(); await pool.end(); });

const state = {};

test('A. collects missing information turn by turn', async () => {
  state.conv = (await api('POST', '/conversations', { language: 'en' })).body.data.conversation.id;
  const t1 = await say(state.conv, 'Hi, I am looking for a 3BHK apartment in Gachibowli.');
  assert.equal(t1.suggestedAction.type, 'ask_qualification');
  assert.equal(t1.suggestedAction.field, 'budget');
  assert.match(t1.reply, /What budget range do you have in mind\?/);
  const t2 = await say(state.conv, 'My budget is around 90 lakhs and I plan to buy within a month.');
  assert.equal(t2.leadQualification.recommendedNextAction.field, 'decisionMaker');
  assert.match(t2.reply, /decision yourself, or together with family\?/);
  state.leadId = t2.lead.id;
});

test('B. retrieves relevant documents with sources', async () => {
  const t = await say(state.conv, 'What does a 3BHK cost here?');
  assert.equal(t.outcome, 'info_provided');
  assert.equal(t.sources[0].title, '3BHK Pricing Details');
  assert.match(t.reply, /89,50,000.*92,00,000|89\.5 lakh to ₹?92 lakh/);
});

test('C. qualifies the customer and shows an explainable score', async () => {
  const t = await say(state.conv, 'I will decide myself.');
  const s = t.leadQualification;
  const f = Object.fromEntries(s.factors.map((x) => [x.key, x]));
  assert.deepEqual([f.budget.points, f.requirements.points, f.timeline.points, f.authority.points, f.appointment.points], [25, 17, 20, 15, 0]);
  assert.equal(s.total, 77);
  assert.equal(s.classification, 'hot');
  assert.ok(f.appointment.evidence.length === 0, 'no visit requested yet: no evidence, no points');
  assert.equal(s.recommendedNextAction.type, 'offer_visit');
  const lead = (await db('SELECT score, score_breakdown, profile, status FROM leads WHERE id=$1', [state.leadId]))[0];
  assert.equal(lead.score, 77, 'score persisted');
  assert.equal(lead.status, 'qualified');
  assert.deepEqual(lead.profile, { bedrooms: 3, location: 'Gachibowli', budgetMax: 9000000, budgetApprox: true, timelineMonths: 1, decisionMaker: 'self' });
});

test('D. checks real availability, collects contact, and PROPOSES (not books) a slot', async () => {
  const t1 = await say(state.conv, 'Can I visit the site?');
  assert.equal(t1.outcome, 'slots_offered');
  assert.equal(t1.offeredSlots.length, 3);
  const booked = await db(`SELECT starts_at FROM appointments WHERE status='confirmed'`);
  assert.ok(t1.offeredSlots.every((s) => !booked.some((b) => b.starts_at.toISOString() === s.startsAt)), 'only free slots offered');
  state.slot = t1.offeredSlots[0].startsAt;
  const t2 = await say(state.conv, 'The first one');
  assert.equal(t2.outcome, 'awaiting_contact');
  const t3 = await say(state.conv, 'My name is Ravi Teja, my number is 98450 12345');
  assert.equal(t3.outcome, 'confirmation_requested');
  assert.equal(t3.suggestedAction.type, 'confirm_booking');
  assert.equal(t3.suggestedAction.executed, false);
  assert.equal((await db('SELECT COUNT(*)::int n FROM appointments WHERE lead_id=$1', [state.leadId]))[0].n, 0, 'a proposal is not an appointment');
  const lead = (await db('SELECT full_name, phone FROM leads WHERE id=$1', [state.leadId]))[0];
  assert.deepEqual(lead, { full_name: 'Ravi Teja', phone: '+919845012345' }, 'lead saved with contact details');
});

test('E. books only after explicit confirmation, inside a transaction, and confirms', async () => {
  const t = await say(state.conv, 'Yes, confirm it.');
  assert.equal(t.outcome, 'appointment_booked');
  assert.match(t.reply, /Your site visit is confirmed for .* Reference: [0-9A-F]{8}/);
  const appts = await db('SELECT id, status, starts_at, conversation_id, notes FROM appointments WHERE lead_id=$1', [state.leadId]);
  assert.equal(appts.length, 1);
  assert.equal(appts[0].status, 'confirmed');
  assert.equal(appts[0].starts_at.toISOString(), state.slot);
  assert.equal(appts[0].conversation_id, state.conv);
  assert.ok(t.reply.includes(appts[0].id.slice(0, 8).toUpperCase()), 'reference matches the stored row');
  const lead = (await db('SELECT status, score, profile FROM leads WHERE id=$1', [state.leadId]))[0];
  assert.equal(lead.status, 'visit_scheduled');
  const expected = scoreLead(lead.profile, { catalog: demoTenantSettings.catalog, scoring: demoTenantSettings.scoring, hasBooking: true });
  assert.equal(lead.score, expected.total);
  assert.equal(lead.score, 92);
  const audit = await db(`SELECT status, actor FROM tool_audit_log WHERE tool='bookAppointment' AND conversation_id=$1`, [state.conv]);
  assert.deepEqual(audit, [{ status: 'success', actor: 'agent' }]);
});

test('F. duplicate booking: the same customer cannot book a second visit', async () => {
  const t = await say(state.conv, 'Can I book one more site visit?');
  assert.equal(t.outcome, 'already_booked');
  const slots = (await api('GET', '/appointments/availability?limit=3')).body.data;
  const staff = await api('POST', '/appointments', { leadId: state.leadId, startsAt: slots[0].startsAt });
  assert.equal(staff.status, 409);
  assert.equal(staff.body.error.code, 'LEAD_ALREADY_BOOKED');
  assert.equal((await db('SELECT COUNT(*)::int n FROM appointments WHERE lead_id=$1', [state.leadId]))[0].n, 1);
});

test('G. booking conflict: slot taken between proposal and confirmation is refused and re-offered', async () => {
  const conv = (await api('POST', '/conversations', {})).body.data.conversation.id;
  const t1 = await say(conv, 'Please arrange a site visit. My name is Meena Iyer and my number is 9845099999');
  const contested = t1.offeredSlots[0].startsAt;
  const t2 = await say(conv, 'the first one');
  assert.equal(t2.outcome, 'confirmation_requested');
  // Another customer takes that exact slot through staff before Meena says yes.
  const rival = (await api('POST', '/leads', { fullName: 'Rival Buyer', phone: '+919845088888' })).body.data.leadId;
  assert.equal((await api('POST', '/appointments', { leadId: rival, startsAt: contested })).status, 201);
  const t3 = await say(conv, 'Yes please');
  assert.equal(t3.outcome, 'booking_conflict');
  assert.match(t3.reply, /just taken by another customer/);
  assert.ok(t3.offeredSlots.length > 0 && t3.offeredSlots.every((s) => s.startsAt !== contested), 'fresh, free slots re-offered');
  assert.equal(t3.trace.success, true, 'a conflict is a correct business outcome, not a system failure');
  assert.equal((await db(`SELECT COUNT(*)::int n FROM appointments WHERE starts_at=$1 AND status='confirmed'`, [contested]))[0].n, 1);
  assert.equal((await db(`SELECT COUNT(*)::int n FROM appointments a JOIN leads l ON l.id=a.lead_id WHERE l.phone='+919845099999'`))[0].n, 0);
  const audit = await db(`SELECT status, error_code FROM tool_audit_log WHERE tool='bookAppointment' AND conversation_id=$1`, [conv]);
  assert.deepEqual(audit, [{ status: 'failed', error_code: 'SLOT_TAKEN' }]);
});

test('H. produces and persists the structured call summary', async () => {
  const r = await api('POST', `/conversations/${state.conv}/end`);
  assert.equal(r.status, 200);
  const row = (await db('SELECT summary, lead_id FROM call_summaries WHERE conversation_id=$1', [state.conv]))[0];
  const s = row.summary;
  assert.equal(row.lead_id, state.leadId);
  assert.equal(s.customerProfile.name, 'Ravi Teja');
  assert.equal(s.customerProfile.decisionMaker, 'self');
  assert.deepEqual([s.requirements.configuration, s.requirements.location, s.requirements.timeline], ['3BHK', 'Gachibowli', '1 month']);
  assert.equal(s.budget.stated, '₹90 lakh');
  assert.match(s.budget.fit, /fits the 3BHK range/);
  assert.equal(s.buyingIntent.level, 'high');
  assert.equal(s.leadScore.total, 92);
  assert.equal(s.appointmentOutcome, 'confirmed');
  assert.ok(s.appointment.label);
  assert.ok(s.recommendedNextActions.length > 0);
  assert.ok(Array.isArray(s.concerns));
  assert.equal((await db('SELECT status FROM conversations WHERE id=$1', [state.conv]))[0].status, 'ended');
});

test('I. decision trace and audit trail are complete and contain no raw phone numbers', async () => {
  const logs = await db('SELECT turn_index, intent, outcome, trace FROM agent_execution_logs WHERE conversation_id=$1 ORDER BY turn_index', [state.conv]);
  assert.equal(logs.length, 9);
  for (const l of logs) {
    for (const k of ['analysis', 'steps', 'events', 'response', 'scoring', 'suggestedAction', 'explanation']) assert.ok(k in l.trace, `turn ${l.turn_index} missing ${k}`);
    assert.equal(typeof l.trace.success, 'boolean');
  }
  const booking = logs.find((l) => l.outcome === 'appointment_booked').trace;
  assert.equal(booking.proposal.status, 'confirmed_by_customer');
  assert.ok(booking.steps.find((s) => s.tool === 'bookAppointment').validation.checks.includes('customer confirmed this exact proposal'));
  assert.ok(logs.find((l) => l.outcome === 'info_provided').trace.retrieval.hits.length > 0);
  const everything = JSON.stringify(logs) + JSON.stringify(await db('SELECT args FROM tool_audit_log'));
  assert.ok(!everything.includes('9845012345') && !everything.includes('98450 12345'), 'phone never stored raw in traces/audit');
});

test('J. a proposal left unconfirmed at the end of a call is reported as NOT booked', async () => {
  const conv = (await api('POST', '/conversations', {})).body.data.conversation.id;
  await say(conv, 'Book a site visit for me. I am Farah Khan, 9845077777');
  await say(conv, 'the second one');
  const s = (await api('POST', `/conversations/${conv}/end`)).body.data;
  assert.equal(s.appointmentOutcome, 'proposed_not_confirmed');
  assert.equal(s.appointment, null);
  assert.equal((await db(`SELECT COUNT(*)::int n FROM appointments a JOIN leads l ON l.id=a.lead_id WHERE l.phone='+919845077777'`))[0].n, 0);
});

import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool } from './helpers.js';
import { createLead, upsertLeadFacts } from '../src/services/crm.js';
import { getAvailableSlots, bookAppointment } from '../src/services/appointments.js';
import { demoTenantSettings } from '../src/db/seedData.js';

const booking = demoTenantSettings.booking;
const NOW = new Date('2026-11-25T03:30:00Z'); // Wed 09:00 IST
let tenantId;
before(async () => { tenantId = await resetDb(); });
after(() => pool.end());

test('slots respect visiting hours, working days and minimum lead time', async () => {
  const slots = await getAvailableSlots(tenantId, booking, { now: NOW, limit: 100 });
  assert.ok(slots.length > 0);
  // first slot: 11:00 IST today (09:00 + 2h lead time)
  assert.equal(slots[0].startsAt, '2026-11-25T05:30:00.000Z');
  // no Sunday (Nov 29 2026) slots
  assert.ok(!slots.some((s) => s.startsAt.startsWith('2026-11-29')));
});

test('booking is persisted, removes the slot, and blocks a second booking of that slot', async () => {
  const a = await createLead(tenantId);
  const b = await createLead(tenantId);
  const [slot] = await getAvailableSlots(tenantId, booking, { now: NOW, date: '2026-11-26' });
  const appt = await bookAppointment(tenantId, booking, { leadId: a.id, startsAt: slot.startsAt, now: NOW });
  assert.equal(appt.status, 'confirmed');
  const after1 = await getAvailableSlots(tenantId, booking, { now: NOW, date: '2026-11-26' });
  assert.ok(!after1.some((s) => s.startsAt === slot.startsAt));
  await assert.rejects(bookAppointment(tenantId, booking, { leadId: b.id, startsAt: slot.startsAt, now: NOW }), { code: 'SLOT_TAKEN' });
});

test('concurrent bookings of the same slot: exactly one succeeds', async () => {
  const leads = await Promise.all([1, 2, 3, 4, 5].map(() => createLead(tenantId)));
  const [slot] = await getAvailableSlots(tenantId, booking, { now: NOW, date: '2026-11-27' });
  const results = await Promise.allSettled(leads.map((l) => bookAppointment(tenantId, booking, { leadId: l.id, startsAt: slot.startsAt, now: NOW })));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.ok(results.filter((r) => r.status === 'rejected').every((r) => r.reason.code === 'SLOT_TAKEN'));
});

test('a lead cannot hold two upcoming visits; out-of-policy times are rejected', async () => {
  const l = await createLead(tenantId);
  const slots = await getAvailableSlots(tenantId, booking, { now: NOW, date: '2026-11-28' });
  await bookAppointment(tenantId, booking, { leadId: l.id, startsAt: slots[0].startsAt, now: NOW });
  await assert.rejects(bookAppointment(tenantId, booking, { leadId: l.id, startsAt: slots[1].startsAt, now: NOW }), { code: 'LEAD_ALREADY_BOOKED' });
  await assert.rejects(bookAppointment(tenantId, booking, { leadId: l.id, startsAt: '2026-11-28T16:30:00.000Z', now: NOW }), { code: 'SLOT_OUTSIDE_POLICY' }); // 22:00 IST
});

test('repeat caller: phone match merges the temporary lead into the existing one', async () => {
  const first = await createLead(tenantId);
  await upsertLeadFacts(tenantId, first.id, { phone: '+919811111111', fullName: 'Asha', profile: { bedrooms: 2 } });
  const second = await createLead(tenantId);
  const { lead, mergedFrom } = await upsertLeadFacts(tenantId, second.id, { phone: '+919811111111', profile: { budgetMax: 8000000 } });
  assert.equal(lead.id, first.id);
  assert.equal(mergedFrom, second.id);
  assert.deepEqual({ b: lead.profile.bedrooms, m: lead.profile.budgetMax, n: lead.full_name }, { b: 2, m: 8000000, n: 'Asha' });
});

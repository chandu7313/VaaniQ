import { query, withTransaction } from '../db/pool.js';
import { AppError, conflict, notFound, badRequest } from '../lib/errors.js';
import { istParts, istDate, formatSlot } from '../lib/time.js';

const DAYPARTS = { morning: [10, 12], afternoon: [12, 16], evening: [16, 18] };

/** All bookable slot start times by policy (working days/hours, horizon, min lead time). */
function policySlots(booking, now, { date, daypart } = {}) {
  const { startHour, endHour, slotMinutes, workDays, daysAhead, minLeadHours } = booking;
  const earliest = now.getTime() + minLeadHours * 3600000;
  const today = istParts(now);
  const slots = [];
  for (let d = 0; d <= daysAhead; d++) {
    const day = istParts(new Date(istDate(today.year, today.month, today.day).getTime() + d * 86400000));
    const key = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    if (!workDays.includes(day.weekday) || (date && key !== date)) continue;
    for (let m = startHour * 60; m + slotMinutes <= endHour * 60; m += slotMinutes) {
      const h = Math.floor(m / 60);
      if (daypart && !(h >= DAYPARTS[daypart][0] && h < DAYPARTS[daypart][1])) continue;
      const start = istDate(day.year, day.month, day.day, h, m % 60);
      if (start.getTime() >= earliest) slots.push(start);
    }
  }
  return slots;
}

const toSlot = (start, slotMinutes) => ({
  startsAt: start.toISOString(),
  endsAt: new Date(start.getTime() + slotMinutes * 60000).toISOString(),
  label: formatSlot(start),
});

/** Free slots = policy slots minus confirmed appointments (read from the database, not guessed). */
export async function getAvailableSlots(tenantId, booking, { date, daypart, limit = 6, now = new Date() } = {}) {
  const candidates = policySlots(booking, now, { date, daypart });
  if (!candidates.length) return [];
  const { rows } = await query(
    `SELECT starts_at FROM appointments WHERE tenant_id=$1 AND status='confirmed' AND starts_at BETWEEN $2 AND $3`,
    [tenantId, candidates[0], candidates[candidates.length - 1]],
  );
  const taken = new Set(rows.map((r) => r.starts_at.getTime()));
  return candidates.filter((s) => !taken.has(s.getTime())).slice(0, limit).map((s) => toSlot(s, booking.slotMinutes));
}

function assertBookable(booking, startsAt, now) {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) throw badRequest('Invalid slot time');
  const valid = policySlots(booking, now).some((s) => s.getTime() === start.getTime());
  if (!valid) throw new AppError(422, 'SLOT_OUTSIDE_POLICY', 'Requested time is not a bookable slot (outside visiting hours, in the past, or beyond the booking window)');
  return start;
}

/**
 * Books a visit inside a transaction. Two layers prevent conflicts:
 *  1. The lead row is locked (FOR UPDATE) so one customer cannot double-book themselves concurrently.
 *  2. The partial unique index appointments_slot_uq makes a second confirmed booking of the same slot
 *     fail at the database, even under races across server instances.
 */
export async function bookAppointment(tenantId, booking, { leadId, conversationId, startsAt, notes, now = new Date() }) {
  const start = assertBookable(booking, startsAt, now);
  const end = new Date(start.getTime() + booking.slotMinutes * 60000);
  try {
    return await withTransaction(async (c) => {
      const lead = await c.query('SELECT id FROM leads WHERE tenant_id=$1 AND id=$2 FOR UPDATE', [tenantId, leadId]);
      if (!lead.rowCount) throw notFound('Lead');
      const existing = await c.query(
        `SELECT starts_at FROM appointments WHERE tenant_id=$1 AND lead_id=$2 AND status='confirmed' AND starts_at > $3`,
        [tenantId, leadId, now],
      );
      if (existing.rowCount) {
        const err = conflict(`Lead already has an upcoming visit on ${formatSlot(existing.rows[0].starts_at)}`, 'LEAD_ALREADY_BOOKED');
        err.details = { existingStartsAt: existing.rows[0].starts_at.toISOString() };
        throw err;
      }
      const { rows } = await c.query(
        `INSERT INTO appointments (tenant_id, lead_id, conversation_id, starts_at, ends_at, notes)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, starts_at, ends_at, status`,
        [tenantId, leadId, conversationId ?? null, start, end, notes ?? null],
      );
      await c.query(`UPDATE leads SET status='visit_scheduled', updated_at=now() WHERE tenant_id=$1 AND id=$2`, [tenantId, leadId]);
      return { ...rows[0], label: formatSlot(start) };
    });
  } catch (err) {
    if (err.code === '23505') throw conflict('That slot has just been booked by someone else', 'SLOT_TAKEN');
    throw err;
  }
}

export async function listAppointments(tenantId, { from, status } = {}) {
  const params = [tenantId];
  let where = 'a.tenant_id = $1';
  if (from) { params.push(from); where += ` AND a.starts_at >= $${params.length}`; }
  if (status) { params.push(status); where += ` AND a.status = $${params.length}`; }
  const { rows } = await query(
    `SELECT a.id, a.starts_at, a.ends_at, a.status, a.notes, a.created_at, a.conversation_id,
            l.id AS lead_id, l.full_name, l.phone, l.score, l.is_demo
       FROM appointments a JOIN leads l ON l.id = a.lead_id
      WHERE ${where} ORDER BY a.starts_at ASC LIMIT 500`,
    params,
  );
  return rows;
}

export async function setAppointmentStatus(tenantId, id, status) {
  const { rows } = await query(
    `UPDATE appointments SET status=$3 WHERE tenant_id=$1 AND id=$2 RETURNING id, lead_id, starts_at, status`,
    [tenantId, id, status],
  );
  if (!rows[0]) throw notFound('Appointment');
  return rows[0];
}

export async function rescheduleAppointment(tenantId, booking, id, startsAt, now = new Date()) {
  const start = assertBookable(booking, startsAt, now);
  try {
    const { rows } = await query(
      `UPDATE appointments SET starts_at=$3, ends_at=$4 WHERE tenant_id=$1 AND id=$2 AND status='confirmed'
       RETURNING id, starts_at, ends_at, status`,
      [tenantId, id, start, new Date(start.getTime() + booking.slotMinutes * 60000)],
    );
    if (!rows[0]) throw notFound('Confirmed appointment');
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw conflict('That slot is already booked', 'SLOT_TAKEN');
    throw err;
  }
}

export async function getUpcomingAppointment(tenantId, leadId, now = new Date()) {
  if (!leadId) return null;
  const { rows } = await query(
    `SELECT id, starts_at FROM appointments WHERE tenant_id=$1 AND lead_id=$2 AND status='confirmed' AND starts_at > $3 ORDER BY starts_at LIMIT 1`,
    [tenantId, leadId, now],
  );
  return rows[0] ?? null;
}

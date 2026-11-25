import { getTenant } from '../services/tenants.js';
import { listAppointments, getAvailableSlots, setAppointmentStatus, rescheduleAppointment, bookAppointment } from '../services/appointments.js';

const bookingPolicy = async (tenantId) => (await getTenant(tenantId)).settings.booking;

export const list = async (req, res) => res.json({ data: await listAppointments(req.user.tenantId, req.valid.query) });

export async function availability(req, res) {
  res.json({ data: await getAvailableSlots(req.user.tenantId, await bookingPolicy(req.user.tenantId), req.valid.query) });
}

// Manual booking by a signed-in staff member (the staff member is the human confirming it).
export async function create(req, res) {
  const body = { ...req.valid.body, notes: req.valid.body.notes ?? 'Booked manually by staff' };
  res.status(201).json({ data: await bookAppointment(req.user.tenantId, await bookingPolicy(req.user.tenantId), body) });
}

export const setStatus = async (req, res) => res.json({ data: await setAppointmentStatus(req.user.tenantId, req.valid.params.id, req.valid.body.status) });

export async function reschedule(req, res) {
  res.json({ data: await rescheduleAppointment(req.user.tenantId, await bookingPolicy(req.user.tenantId), req.valid.params.id, req.valid.body.startsAt) });
}

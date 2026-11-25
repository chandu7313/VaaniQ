import { getTenant } from '../services/tenants.js';
import { listAppointments, getAvailableSlots, setAppointmentStatus, rescheduleAppointment, getAppointment, deleteAppointment } from '../services/appointments.js';
import { runStaffTool } from './toolContext.js';

const bookingPolicy = async (tenantId) => (await getTenant(tenantId)).settings.booking;

export const list = async (req, res) => res.json({ data: await listAppointments(req.user.tenantId, req.valid.query) });

export async function availability(req, res) {
  res.json({ data: await getAvailableSlots(req.user.tenantId, await bookingPolicy(req.user.tenantId), req.valid.query) });
}

// Manual booking by a signed-in staff member (the staff member is the human confirming it),
// through the same bookAppointment tool, transaction and unique-slot constraint as the agent.
export async function create(req, res) {
  const { leadId, startsAt, notes } = req.valid.body;
  res.status(201).json({ data: await runStaffTool(req, 'bookAppointment', { startsAt, ...(notes ? { notes } : {}) }, { leadId }) });
}

export const detail = async (req, res) => res.json({ data: await getAppointment(req.user.tenantId, req.valid.params.id) });

export async function remove(req, res) {
  await deleteAppointment(req.user.tenantId, req.valid.params.id);
  res.status(204).end();
}

export const setStatus = async (req, res) => res.json({ data: await setAppointmentStatus(req.user.tenantId, req.valid.params.id, req.valid.body.status) });

export async function reschedule(req, res) {
  res.json({ data: await rescheduleAppointment(req.user.tenantId, await bookingPolicy(req.user.tenantId), req.valid.params.id, req.valid.body.startsAt) });
}

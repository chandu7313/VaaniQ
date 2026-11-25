import { Router } from 'express';
import { z } from 'zod';
import { getTenant } from '../services/tenants.js';
import { listAppointments, getAvailableSlots, setAppointmentStatus, rescheduleAppointment, bookAppointment } from '../services/appointments.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';

const r = Router();
const idParams = z.object({ id: z.string().uuid() });
const bookingCfg = async (tenantId) => (await getTenant(tenantId)).settings.booking;

r.get('/', validate({ query: z.object({ from: z.string().datetime().optional(), status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']).optional() }) }), ah(async (req, res) =>
  res.json({ data: await listAppointments(req.user.tenantId, req.valid.query) })));

r.get('/availability', validate({ query: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), daypart: z.enum(['morning', 'afternoon', 'evening']).optional(), limit: z.coerce.number().int().min(1).max(60).default(24) }) }), ah(async (req, res) =>
  res.json({ data: await getAvailableSlots(req.user.tenantId, await bookingCfg(req.user.tenantId), req.valid.query) })));

// Manual booking by a signed-in staff member (the staff member is the human confirming it).
r.post('/', validate({ body: z.object({ leadId: z.string().uuid(), startsAt: z.string().datetime(), notes: z.string().max(300).optional() }) }), ah(async (req, res) =>
  res.status(201).json({ data: await bookAppointment(req.user.tenantId, await bookingCfg(req.user.tenantId), { ...req.valid.body, notes: req.valid.body.notes ?? 'Booked manually by staff' }) })));

r.patch('/:id/status', validate({ params: idParams, body: z.object({ status: z.enum(['cancelled', 'completed', 'no_show', 'confirmed']) }) }), ah(async (req, res) =>
  res.json({ data: await setAppointmentStatus(req.user.tenantId, req.valid.params.id, req.valid.body.status) })));

r.patch('/:id/reschedule', validate({ params: idParams, body: z.object({ startsAt: z.string().datetime() }) }), ah(async (req, res) =>
  res.json({ data: await rescheduleAppointment(req.user.tenantId, await bookingCfg(req.user.tenantId), req.valid.params.id, req.valid.body.startsAt) })));

export default r;

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as c from '../controllers/appointments.controller.js';

const r = Router();
const idParams = z.object({ id: z.string().uuid() });
const listQuery = z.object({ from: z.string().datetime().optional(), status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']).optional() });
const availabilityQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  daypart: z.enum(['morning', 'afternoon', 'evening']).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});
const createBody = z.object({ leadId: z.string().uuid(), startsAt: z.string().datetime(), notes: z.string().max(300).optional() });
const statusBody = z.object({ status: z.enum(['cancelled', 'completed', 'no_show', 'confirmed']) });
const rescheduleBody = z.object({ startsAt: z.string().datetime() });

r.get('/', validate({ query: listQuery }), ah(c.list));
r.get('/availability', validate({ query: availabilityQuery }), ah(c.availability));
r.post('/', validate({ body: createBody }), ah(c.create));
r.patch('/:id/status', validate({ params: idParams, body: statusBody }), ah(c.setStatus));
r.patch('/:id/reschedule', validate({ params: idParams, body: rescheduleBody }), ah(c.reschedule));

export default r;

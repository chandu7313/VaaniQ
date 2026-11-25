import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileBody, phone } from './schemas.js';
import { ah } from '../middleware/error.js';
import * as c from '../controllers/leads.controller.js';

const r = Router();
const status = z.enum(['new', 'contacted', 'qualified', 'visit_scheduled', 'nurture', 'lost']);
const idParams = z.object({ id: z.string().uuid() });
const listQuery = z.object({ status: status.optional(), search: z.string().max(80).optional() });
// strict(): unknown fields (e.g. "score") are rejected, so clients cannot overwrite computed values.
const updateBody = z.object({ status: status.optional(), fullName: z.string().min(1).max(80).optional(), email: z.string().email().optional() }).strict();

const createBody = z.object({ fullName: z.string().trim().min(1).max(80).optional(), phone: phone.optional(), email: z.string().email().optional(), profile: profileBody.optional() }).strict();

r.get('/', validate({ query: listQuery }), ah(c.list));
r.post('/', validate({ body: createBody }), ah(c.create));
r.get('/:id', validate({ params: idParams }), ah(c.detail));
r.patch('/:id', validate({ params: idParams, body: updateBody }), ah(c.update));
r.delete('/:id', requireRole('admin'), validate({ params: idParams }), ah(c.remove));

export default r;

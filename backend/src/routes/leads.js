import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as c from '../controllers/leads.controller.js';

const r = Router();
const status = z.enum(['new', 'contacted', 'qualified', 'visit_scheduled', 'nurture', 'lost']);
const idParams = z.object({ id: z.string().uuid() });
const listQuery = z.object({ status: status.optional(), search: z.string().max(80).optional() });
// strict(): unknown fields (e.g. "score") are rejected, so clients cannot overwrite computed values.
const updateBody = z.object({ status: status.optional(), fullName: z.string().min(1).max(80).optional(), email: z.string().email().optional() }).strict();

r.get('/', validate({ query: listQuery }), ah(c.list));
r.get('/:id', validate({ params: idParams }), ah(c.detail));
r.patch('/:id', validate({ params: idParams, body: updateBody }), ah(c.update));

export default r;

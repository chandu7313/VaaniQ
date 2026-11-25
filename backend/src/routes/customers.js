import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { idParams, profileBody, phone } from './schemas.js';
import * as c from '../controllers/customers.controller.js';

const r = Router();
const createBody = z.object({ fullName: z.string().trim().min(1).max(80), phone, email: z.string().email().optional(), profile: profileBody.optional() }).strict();
const updateBody = z.object({ fullName: z.string().trim().min(1).max(80).optional(), phone: phone.optional(), email: z.string().email().optional(), profile: profileBody.optional() }).strict();

r.get('/', validate({ query: z.object({ search: z.string().max(80).optional() }) }), ah(c.list));
r.post('/', validate({ body: createBody }), ah(c.create));
r.get('/:id', validate({ params: idParams }), ah(c.detail));
r.patch('/:id', validate({ params: idParams, body: updateBody }), ah(c.update));
r.delete('/:id', requireRole('admin'), validate({ params: idParams }), ah(c.remove));

export default r;

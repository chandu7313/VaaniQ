import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { idParams } from './schemas.js';
import * as c from '../controllers/callSummaries.controller.js';

const r = Router();
r.get('/', validate({ query: z.object({ leadId: z.string().uuid().optional() }) }), ah(c.list));
r.post('/', validate({ body: z.object({ conversationId: z.string().uuid(), end: z.boolean().default(false) }).strict() }), ah(c.create));
r.get('/:id', validate({ params: idParams }), ah(c.detail));
r.patch('/:id', validate({ params: idParams, body: z.object({ staffNotes: z.string().max(2000).optional(), followUpDone: z.boolean().optional() }).strict() }), ah(c.update));
r.delete('/:id', requireRole('admin'), validate({ params: idParams }), ah(c.remove));

export default r;

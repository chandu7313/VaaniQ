import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as c from '../controllers/knowledge.controller.js';

const r = Router();
const idParams = z.object({ id: z.string().uuid() });
const createBody = z.object({ title: z.string().trim().min(3).max(150), content: z.string().trim().min(20).max(200000), sourceType: z.enum(['text', 'markdown', 'file']).default('text') });
const searchBody = z.object({ query: z.string().trim().min(2).max(500), k: z.number().int().min(1).max(10).default(5) });

r.get('/', ah(c.list));
r.post('/', validate({ body: createBody }), ah(c.create));
r.post('/search', validate({ body: searchBody }), ah(c.search));
r.get('/:id', validate({ params: idParams }), ah(c.detail));
r.delete('/:id', validate({ params: idParams }), ah(c.remove));

export default r;

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as c from '../controllers/insights.controller.js';

const r = Router();
const tracesQuery = z.object({ conversationId: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(200).default(50) });

r.get('/meta', ah(c.meta));
r.get('/analytics/overview', ah(c.analyticsOverview));
r.get('/traces', validate({ query: tracesQuery }), ah(c.traces));
r.get('/traces/:id', validate({ params: z.object({ id: z.string().uuid() }) }), ah(c.trace));

export default r;

import { Router } from 'express';
import { limiter } from '../middleware/rateLimit.js';
import { z } from 'zod';
import { config } from '../config.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as c from '../controllers/conversations.controller.js';

const r = Router();
const lang = z.enum(['en', 'hi', 'te']);
const idParams = z.object({ id: z.string().uuid() });
const startBody = z.object({ language: lang.default('en'), channel: z.enum(['voice', 'text']).default('voice') });
const messageBody = z.object({ text: z.string().trim().min(1).max(1000), language: lang.optional() });
const agentLimiter = limiter({ windowMs: 60 * 1000, limit: config.agentRateLimitMax, message: 'Too many messages in a short time. Please wait a moment.' });

r.get('/', ah(c.list));
r.post('/', validate({ body: startBody }), ah(c.start));
r.get('/:id', validate({ params: idParams }), ah(c.detail));
r.post('/:id/messages', agentLimiter, validate({ params: idParams, body: messageBody }), ah(c.sendMessage));
r.post('/:id/end', validate({ params: idParams }), ah(c.end));
r.get('/:id/traces', validate({ params: idParams }), ah(c.traces));
r.delete('/:id', requireRole('admin'), validate({ params: idParams }), ah(c.remove));

export default r;

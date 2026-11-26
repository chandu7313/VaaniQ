import { Router } from 'express';
import { audioBody, sttLimiter, sttQuery } from './speech.js';
import { transcribeAudio } from '../controllers/speech.controller.js';
import { z } from 'zod';
import { config } from '../config.js';
import { limiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { requireCustomerSession } from '../middleware/auth.js';
import { phone } from './schemas.js';
import * as p from '../controllers/public.controller.js';

const r = Router();

const slugParams = z.object({ slug: z.string().regex(/^[a-z0-9-]{2,60}$/) });
const slugIdParams = z.object({ slug: z.string().regex(/^[a-z0-9-]{2,60}$/), id: z.string().uuid() });
const lang = z.enum(['en', 'hi', 'te']);

const availabilityQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  daypart: z.enum(['morning', 'afternoon', 'evening']).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(48),
});

const knowledgeSearchBody = z.object({
  query: z.string().trim().min(2).max(300),
  k: z.number().int().min(1).max(6).default(4),
});

const startBody = z.object({
  language: lang.default('en'),
  channel: z.enum(['voice', 'text']).default('voice'),
});

const messageBody = z.object({
  text: z.string().trim().min(1).max(1000),
  language: lang.optional(),
});

const slotBody = z.object({
  startsAt: z.string().datetime(),
  language: lang.optional(),
});

const contactBody = z.object({
  fullName: z.string().trim().min(1, 'Please enter your name').max(80),
  phone,
  email: z.string().trim().email('Please enter a valid email address').max(120).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required before saving contact details' }) }),
  language: lang.optional(),
});

const startLimiter = limiter({
  windowMs: 60 * 1000,
  limit: 20,
  message: 'Too many new conversations started. Please wait a moment.',
});

const messageLimiter = limiter({
  windowMs: 60 * 1000,
  limit: config.agentRateLimitMax,
  message: 'Too many messages in a short time. Please wait a moment.',
});

r.get('/:slug/overview', validate({ params: slugParams }), ah(p.resolvePublicTenant), ah(p.overview));
r.get('/:slug/availability', validate({ params: slugParams, query: availabilityQuery }), ah(p.resolvePublicTenant), ah(p.availability));
r.post('/:slug/knowledge/search', messageLimiter, validate({ params: slugParams, body: knowledgeSearchBody }), ah(p.resolvePublicTenant), ah(p.searchKnowledge));
r.post('/:slug/conversations', startLimiter, validate({ params: slugParams, body: startBody }), ah(p.resolvePublicTenant), ah(p.startPublicConversation));
r.get('/:slug/conversations/:id', validate({ params: slugIdParams }), ah(p.resolvePublicTenant), requireCustomerSession, ah(p.getPublicConversation));
r.post('/:slug/conversations/:id/messages', messageLimiter, validate({ params: slugIdParams, body: messageBody }), ah(p.resolvePublicTenant), requireCustomerSession, ah(p.sendPublicMessage));
r.post('/:slug/conversations/:id/select-slot', messageLimiter, validate({ params: slugIdParams, body: slotBody }), ah(p.resolvePublicTenant), requireCustomerSession, ah(p.selectPublicSlot));
r.post('/:slug/conversations/:id/contact', messageLimiter, validate({ params: slugIdParams, body: contactBody }), ah(p.resolvePublicTenant), requireCustomerSession, ah(p.savePublicContact));
r.post('/:slug/conversations/:id/transcribe', sttLimiter, audioBody, validate({ params: slugIdParams, query: sttQuery }), ah(p.resolvePublicTenant), requireCustomerSession, ah(transcribeAudio));
r.post('/:slug/conversations/:id/end', validate({ params: slugIdParams }), ah(p.resolvePublicTenant), requireCustomerSession, ah(p.endPublicConversation));

export default r;

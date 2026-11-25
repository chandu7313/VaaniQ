import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as auth from '../controllers/auth.controller.js';

const r = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
const loginBody = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

r.post('/login', loginLimiter, validate({ body: loginBody }), ah(auth.login));
r.get('/me', requireAuth, ah(auth.me));

export default r;

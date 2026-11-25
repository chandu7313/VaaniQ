import { Router } from 'express';
import { limiter } from '../middleware/rateLimit.js';
import { z } from 'zod';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import * as auth from '../controllers/auth.controller.js';

const r = Router();
// Only FAILED logins count, so brute-force attempts are throttled without locking out a working admin.
const loginLimiter = limiter({ windowMs: 15 * 60 * 1000, limit: config.loginRateLimitMax, skipSuccessfulRequests: true, code: 'TOO_MANY_LOGIN_ATTEMPTS', message: 'Too many failed sign-in attempts. Try again in 15 minutes.' });
const loginBody = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

r.post('/login', loginLimiter, validate({ body: loginBody }), ah(auth.login));
r.get('/me', requireAuth, ah(auth.me));

export default r;

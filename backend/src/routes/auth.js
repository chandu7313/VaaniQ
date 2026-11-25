import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { verifyPassword } from '../lib/password.js';
import { AppError } from '../lib/errors.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';

const r = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

r.post('/login', loginLimiter, validate({ body: z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }) }), ah(async (req, res) => {
  const { email, password } = req.valid.body;
  const { rows } = await query('SELECT u.*, t.name AS tenant_name FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE u.email=$1', [email.toLowerCase()]);
  const user = rows[0];
  // Same error for unknown user and wrong password (no account enumeration).
  if (!user || !(await verifyPassword(password, user.password_hash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  res.json({ data: { token: signToken(user), user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, tenantName: user.tenant_name } } });
}));

r.get('/me', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT u.id, u.email, u.full_name, u.role, t.name AS tenant_name FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE u.id=$1', [req.user.id]);
  if (!rows[0]) throw new AppError(401, 'INVALID_TOKEN', 'User no longer exists');
  res.json({ data: rows[0] });
}));

export default r;

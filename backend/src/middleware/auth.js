import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';
import { query } from '../db/pool.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, tid: user.tenant_id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' });

/**
 * Verifies the bearer token. The tenant id used by every downstream query comes ONLY from the
 * verified token (req.user.tenantId), never from the request body or URL: this is tenant isolation.
 */
export async function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'UNAUTHENTICATED', 'Missing bearer token'));
  let p;
  try {
    p = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    return next(new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired'));
  }
  try {
    // A signature alone is not enough: the user must still exist in that tenant. Deleting a user
    // (or resetting a demo database) revokes their tokens immediately instead of at expiry.
    // One primary-key lookup per request; a cache (Redis) is the production option.
    const { rowCount } = await query('SELECT 1 FROM users WHERE id = $1 AND tenant_id = $2', [p.sub, p.tid]);
    if (!rowCount) return next(new AppError(401, 'INVALID_TOKEN', 'Session is no longer valid; please sign in again'));
  } catch (err) {
    return next(err);
  }
  req.user = { id: p.sub, tenantId: p.tid, role: p.role, email: p.email };
  return next();
}

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new AppError(403, 'FORBIDDEN', 'Insufficient role'));

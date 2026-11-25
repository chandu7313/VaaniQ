import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, tid: user.tenant_id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' });

/**
 * Verifies the bearer token. The tenant id used by every downstream query comes ONLY from the
 * verified token (req.user.tenantId), never from the request body or URL: this is tenant isolation.
 */
export function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'UNAUTHENTICATED', 'Missing bearer token'));
  try {
    const p = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    req.user = { id: p.sub, tenantId: p.tid, role: p.role, email: p.email };
    return next();
  } catch {
    return next(new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired'));
  }
}

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new AppError(403, 'FORBIDDEN', 'Insufficient role'));

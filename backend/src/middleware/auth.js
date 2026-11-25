import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';
import { query } from '../db/pool.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, tid: user.tenant_id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' });

/** Signs an ephemeral session token scoped strictly to one public conversation inside one tenant slug. */
export const signCustomerSessionToken = ({ conversationId, tenantId, slug }) =>
  jwt.sign(
    { cid: conversationId, tid: tenantId, slug, purpose: 'public_customer_session' },
    config.jwtSecret,
    { expiresIn: '4h', algorithm: 'HS256' },
  );

/**
 * Verifies the bearer token for staff/admin users. Rejects ephemeral customer session tokens.
 * The tenant id used by every downstream query comes ONLY from the verified token (req.user.tenantId).
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
  if (!p.sub || p.purpose) {
    return next(new AppError(401, 'INVALID_TOKEN', 'Invalid staff session token'));
  }
  try {
    const { rowCount } = await query('SELECT 1 FROM users WHERE id = $1 AND tenant_id = $2', [p.sub, p.tid]);
    if (!rowCount) return next(new AppError(401, 'INVALID_TOKEN', 'Session is no longer valid; please sign in again'));
  } catch (err) {
    return next(err);
  }
  req.user = { id: p.sub, tenantId: p.tid, role: p.role, email: p.email };
  return next();
}

/**
 * Enforces session isolation for the public customer experience:
 * token must match the server-resolved tenant, slug, and requested conversation id.
 */
export async function requireCustomerSession(req, _res, next) {
  const header = req.get('x-customer-session') || '';
  if (!header) return next(new AppError(401, 'SESSION_REQUIRED', 'Missing customer session token'));
  let p;
  try {
    p = jwt.verify(header, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    return next(new AppError(401, 'SESSION_EXPIRED', 'Your conversation session has expired; please start a new conversation'));
  }
  const tenant = req.publicTenant;
  const convId = req.valid?.params?.id ?? req.params?.id;
  if (
    p.purpose !== 'public_customer_session' ||
    !tenant ||
    p.tid !== tenant.id ||
    p.slug !== tenant.slug ||
    (convId && p.cid !== convId)
  ) {
    return next(new AppError(403, 'SESSION_MISMATCH', 'Conversation session does not match'));
  }
  try {
    const { rowCount } = await query('SELECT 1 FROM conversations WHERE id = $1 AND tenant_id = $2', [p.cid, p.tid]);
    if (!rowCount) return next(new AppError(404, 'NOT_FOUND', 'Conversation not found'));
  } catch (err) {
    return next(err);
  }
  req.customerSession = { conversationId: p.cid, tenantId: p.tid, slug: p.slug };
  return next();
}

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new AppError(403, 'FORBIDDEN', 'Insufficient role'));

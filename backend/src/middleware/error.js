import { AppError } from '../lib/errors.js';
import { randomUUID } from 'node:crypto';
import { log } from '../lib/logger.js';

export function requestId(req, res, next) {
  req.id = randomUUID();
  res.set('x-request-id', req.id);
  next();
}

export const notFoundHandler = (req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route ${req.method} ${req.path}` } });

const DB_DOWN_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET', '57P01', '57P02', '57P03', '08000', '08001', '08003', '08006']);

// Consistent error envelope: { error: { code, message, details?, requestId } }.
// Unexpected errors are logged with the request id; internals are never sent to the client.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') err = { status: 400, code: 'INVALID_JSON', message: 'Malformed JSON body' };
  if (err.type === 'entity.too.large') err = { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' };
  // Database outages become a clear, retryable 503 instead of an opaque 500.
  if (DB_DOWN_CODES.has(err.code) || /Connection terminated|timeout exceeded when trying to connect|connect ECONNREFUSED/i.test(err.message || '')) {
    log.error('database_unavailable', { requestId: req.id, path: req.path, code: err.code });
    return res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'The database is temporarily unavailable. Please try again in a moment.', requestId: req.id } });
  }
  const status = err.status && err.status < 600 ? err.status : 500;
  // Deliberate application errors (AppError, with a code) keep their user-facing message even when 5xx
  // (e.g. 502 "speech service unavailable, please type instead"). Unexpected errors never leak internals.
  const expected = err instanceof AppError;
  if (status >= 500 && !expected) log.error('unhandled_error', { requestId: req.id, path: req.path, message: err.message, stack: err.stack?.split('\n').slice(0, 4).join(' | ') });
  res.status(status).json({
    error: { code: status >= 500 && !expected ? 'INTERNAL_ERROR' : err.code, message: status >= 500 && !expected ? 'Unexpected server error' : err.message, details: err.details, requestId: req.id },
  });
}

/** Wrap async route handlers so rejections reach the error middleware. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

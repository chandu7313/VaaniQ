import { randomUUID } from 'node:crypto';
import { log } from '../lib/logger.js';

export function requestId(req, res, next) {
  req.id = randomUUID();
  res.set('x-request-id', req.id);
  next();
}

export const notFoundHandler = (req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route ${req.method} ${req.path}` } });

// Consistent error envelope: { error: { code, message, details?, requestId } }.
// Unexpected errors are logged with the request id; internals are never sent to the client.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') err = { status: 400, code: 'INVALID_JSON', message: 'Malformed JSON body' };
  if (err.type === 'entity.too.large') err = { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' };
  const status = err.status && err.status < 600 ? err.status : 500;
  if (status >= 500) log.error('unhandled_error', { requestId: req.id, path: req.path, message: err.message, stack: err.stack?.split('\n').slice(0, 4).join(' | ') });
  res.status(status).json({
    error: { code: status >= 500 ? 'INTERNAL_ERROR' : err.code, message: status >= 500 ? 'Unexpected server error' : err.message, details: err.details, requestId: req.id },
  });
}

/** Wrap async route handlers so rejections reach the error middleware. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

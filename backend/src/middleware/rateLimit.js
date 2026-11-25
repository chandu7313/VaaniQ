import rateLimit from 'express-rate-limit';

/**
 * Rate limiter that answers in the standard error envelope, so the UI can show a clear message
 * instead of an unparseable plain-text 429.
 */
export function limiter({ windowMs, limit, code = 'RATE_LIMITED', message = 'Too many requests. Please wait a moment and try again.', ...options }) {
  return rateLimit({
    windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false, ...options,
    handler: (req, res) => res.status(429).json({ error: { code, message, retryAfterSeconds: Math.ceil(windowMs / 1000), requestId: req.id } }),
  });
}

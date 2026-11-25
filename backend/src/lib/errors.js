/** Operational error with an HTTP status and a stable machine-readable code. */
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
export const notFound = (what = 'Resource') => new AppError(404, 'NOT_FOUND', `${what} not found`);
export const badRequest = (msg, details) => new AppError(400, 'BAD_REQUEST', msg, details);
export const conflict = (msg, code = 'CONFLICT') => new AppError(409, code, msg);

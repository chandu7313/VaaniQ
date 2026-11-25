import { AppError } from '../lib/errors.js';

/** Validates body/query/params with Zod schemas; parsed values land on req.valid. */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = {};
  for (const part of ['body', 'query', 'params']) {
    if (!schemas[part]) continue;
    const r = schemas[part].safeParse(req[part] ?? {});
    if (!r.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed',
        r.error.issues.map((i) => ({ path: `${part}.${i.path.join('.')}`, message: i.message }))));
    }
    req.valid[part] = r.data;
  }
  return next();
};

// PII masking for anything persisted as a trace or audit record (never for the CRM itself).
// Phone numbers keep their last 2 digits; e-mails keep only the domain.
export const maskPII = (s) => String(s)
  .replace(/(?:\+?91[\s-]?)?(?:\d[\s-]?){8}(\d)[\s-]?(\d)/g, '******$1$2')
  .replace(/[\w.+-]+@([\w-]+\.[\w.-]+)/g, '***@$1');

export const maskDeep = (v) => JSON.parse(maskPII(JSON.stringify(v ?? null)));

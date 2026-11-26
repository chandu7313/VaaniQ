// PII masking for anything persisted as a trace or audit record (never for the CRM itself).
// Phone numbers keep their last 2 digits; e-mails keep only the domain.
//
// The phone pattern must stand alone: it may not touch letters, digits or hyphens on either side.
// Otherwise digit runs inside UUIDs ("…1234-5678-90…") were masked too, corrupting ids in traces.
const PHONE = /(?<![\w-])(?:\+?91[\s-]?)?(?:\d[\s-]?){8}(\d)[\s-]?(\d)(?![\w-])/g;
const EMAIL = /[\w.+-]+@([\w-]+\.[\w.-]+)/g;

export const maskPII = (s) => String(s).replace(PHONE, '******$1$2').replace(EMAIL, '***@$1');

export const maskDeep = (v) => JSON.parse(maskPII(JSON.stringify(v ?? null)));

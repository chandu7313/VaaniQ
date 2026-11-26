const TZ = 'Asia/Kolkata';
export const fmtDateTime = (d) => (d ? new Intl.DateTimeFormat('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(d)) : '—');
export const fmtSlot = (d) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(d));
export const fmtDay = (d) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, day: 'numeric', month: 'short' }).format(new Date(d));
export const fmtRupees = (r) => (r ? `₹${Math.round(r / 1e5)} lakh` : '—');
// Unit area as configured: a single approximate figure ("≈1,180 sq.ft built-up") or a range.
export const fmtArea = (u) => {
  const [a, b] = u.sizeSqft || [];
  const n = (x) => Number(x).toLocaleString('en-IN');
  const v = a === b || b == null ? `≈${n(a)}` : `${n(a)}–${n(b)}`;
  return `${v} sq.ft${u.areaBasis ? ` ${u.areaBasis}` : ''}`;
};
export const LANG_LABEL = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు' };
export const LANG_NAME = { en: 'English', hi: 'Hindi', te: 'Telugu' };
export const BCP47 = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
export const STATUS_LABEL = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', visit_scheduled: 'Visit scheduled', nurture: 'Nurture', lost: 'Lost' };
export const scoreClass = (s) => (s >= 75 ? 'hot' : s >= 50 ? 'warm' : 'cold');
export const humanize = (s) => (s ? String(s).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '—');

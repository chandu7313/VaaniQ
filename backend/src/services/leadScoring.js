// Explainable lead qualification. Every point awarded carries a reason built from facts
// the customer actually stated; anything not stated scores 0 and is listed as missing.

export const DEFAULT_WEIGHTS = { budget: 25, requirements: 25, timeline: 20, authority: 15, appointment: 15 };
const lakh = (r) => Math.round(r / 1e5);

function budgetFactor(p, catalog) {
  if (!p.budgetMax) return { fraction: 0, reason: 'Budget not shared yet', missing: ['budget'] };
  const unit = catalog.units.find((u) => u.bedrooms === p.bedrooms);
  const [lo, hi] = unit ? unit.priceLakh : [Math.min(...catalog.units.map((u) => u.priceLakh[0])), Math.max(...catalog.units.map((u) => u.priceLakh[1]))];
  const b = p.budgetMax / 1e5;
  const label = unit ? `${unit.type} range ₹${lo}–${hi} lakh` : `project range ₹${lo}–${hi} lakh`;
  if (b >= lo) return { fraction: 1, reason: `Budget ₹${lakh(p.budgetMax)} lakh fits the ${label}` };
  const gap = (lo - b) / lo;
  if (gap <= 0.1) return { fraction: 0.7, reason: `Budget ₹${lakh(p.budgetMax)} lakh is within 10% below the ${label}` };
  if (gap <= 0.2) return { fraction: 0.4, reason: `Budget ₹${lakh(p.budgetMax)} lakh is 10–20% below the ${label}` };
  return { fraction: 0.15, reason: `Budget ₹${lakh(p.budgetMax)} lakh is more than 20% below the ${label}` };
}

function requirementsFactor(p) {
  // Sub-weights (out of 25): configuration 9, location 8, purpose 4, specific preferences 4.
  const parts = [
    ['bedrooms', 9, p.bedrooms && `${p.bedrooms}BHK`],
    ['location', 8, p.location && `location ${p.location}`],
    ['purpose', 4, p.purpose && `purpose ${p.purpose}`],
    ['preferences', 4, p.preferences?.length && `preferences: ${p.preferences.join(', ')}`],
  ];
  const have = parts.filter(([, , v]) => v);
  return {
    fraction: have.reduce((s, [, w]) => s + w, 0) / 25,
    reason: have.length ? `Stated ${have.map(([, , v]) => v).join('; ')}` : 'No specific requirements stated yet',
    missing: parts.filter(([, , v]) => !v).map(([k]) => k),
  };
}

function timelineFactor(p) {
  const m = p.timelineMonths;
  if (m == null) return { fraction: 0, reason: 'Purchase timeline not shared yet', missing: ['timeline'] };
  if (m <= 1) return { fraction: 1, reason: 'Plans to buy within about a month' };
  if (m <= 3) return { fraction: 0.7, reason: `Plans to buy within ${m} months` };
  if (m <= 6) return { fraction: 0.4, reason: `Plans to buy within ${m} months` };
  return { fraction: 0.15, reason: `Timeline of ${m} months is long-term` };
}

function authorityFactor(p) {
  switch (p.decisionMaker) {
    case 'self': return { fraction: 1, reason: 'Customer is the decision-maker' };
    case 'joint': return { fraction: 0.67, reason: 'Decision shared with family/spouse' };
    case 'other': return { fraction: 0.33, reason: 'Someone else makes the final decision' };
    default: return { fraction: 0, reason: 'Decision-maker not known yet', missing: ['decisionMaker'] };
  }
}

function appointmentFactor(hasBooking, p) {
  if (hasBooking) return { fraction: 1, reason: 'Site visit booked and confirmed' };
  if (p.visitIntent === 'requested') return { fraction: 0.8, reason: 'Customer asked for a site visit' };
  return { fraction: 0, reason: 'No site visit requested yet', missing: ['visit'] };
}

const LABELS = { budget: 'Budget fit', requirements: 'Requirement clarity', timeline: 'Purchase timeline', authority: 'Decision authority', appointment: 'Appointment intent' };

export function scoreLead(profile, { catalog, scoring = {}, hasBooking = false }) {
  const weights = { ...DEFAULT_WEIGHTS, ...(scoring.weights || {}) };
  const thresholds = { hot: 75, warm: 50, ...(scoring.thresholds || {}) };
  const results = {
    budget: budgetFactor(profile, catalog),
    requirements: requirementsFactor(profile),
    timeline: timelineFactor(profile),
    authority: authorityFactor(profile),
    appointment: appointmentFactor(hasBooking, profile),
  };
  const factors = Object.entries(results).map(([key, r]) => ({
    key, label: LABELS[key], max: weights[key], points: Math.round(weights[key] * r.fraction), reason: r.reason,
  }));
  const total = Math.min(100, factors.reduce((s, f) => s + f.points, 0));
  const missing = Object.values(results).flatMap((r) => r.missing || []);
  const classification = total >= thresholds.hot ? 'hot' : total >= thresholds.warm ? 'warm' : 'cold';
  return { total, classification, factors, missing };
}

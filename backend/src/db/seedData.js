// ALL DATA BELOW IS FICTIONAL DEMONSTRATION DATA. "ABC Developers" is not a real company.
import { loadKnowledgeBase } from './knowledgeBase.js';

export const demoTenantSettings = {
  catalog: {
    // One project name everywhere (UI, documents, agent replies), so retrieval and answers agree.
    project: 'GreenHaven Residences',
    location: 'Gachibowli, Hyderabad',
    units: [
      // Canonical (VaaniQ_Knowledge_Base/config/*.json): approximate BUILT-UP area and indicative BASE price.
      // Carpet area is not provided and is never derived from these figures.
      { type: '2BHK', bedrooms: 2, sizeSqft: [1180, 1180], areaBasis: 'built-up', priceLakh: [67.5, 69] },
      { type: '3BHK', bedrooms: 3, sizeSqft: [1560, 1560], areaBasis: 'built-up', priceLakh: [89.5, 92] },
    ],
  },
  // Configurable qualification model (sums to 100). Hot/warm cut-offs are score thresholds.
  scoring: {
    weights: { budget: 25, requirements: 25, timeline: 20, authority: 15, appointment: 15 },
    thresholds: { hot: 75, warm: 50 },
  },
  booking: { startHour: 10, endHour: 18, slotMinutes: 60, workDays: [1, 2, 3, 4, 5, 6], daysAhead: 7, minLeadHours: 2 },
};

// The 69 validated documents in VaaniQ_Knowledge_Base/ are the demo tenant's knowledge (stable doc ids
// ABC-GHR-KB-01..69). Facts there and in the catalog above come from the same canonical source,
// with frontmatter metadata preserved (PENDING_REVIEW approval status never auto-approved).
export const demoDocuments = loadKnowledgeBase();

// Sample CRM records so the CRM pages are not empty on first run. Flagged is_demo and shown as fictional
// in the UI. Profiles contain only facts a customer could have stated; scores are NOT hand-written:
// the seed computes them with the real scoring model (services/leadScoring.js), so they always match it.
export const demoLeads = [
  { full_name: 'Ravi Kumar (demo)', phone: '+919000000001', status: 'qualified',
    profile: { bedrooms: 3, location: 'Gachibowli', budgetMax: 9500000, timelineMonths: 1, decisionMaker: 'self' } },
  { full_name: 'Sneha Reddy (demo)', phone: '+919000000002', status: 'qualified',
    profile: { bedrooms: 2, location: 'Gachibowli', budgetMax: 7500000, timelineMonths: 4, decisionMaker: 'joint' } },
  { full_name: 'Lakshmi Prasad (demo)', phone: '+919000000004', status: 'nurture',
    profile: { bedrooms: 2, location: 'Kondapur', budgetMax: 6000000, timelineMonths: 8, purpose: 'investment' } },
  { full_name: 'Imran Shaikh (demo)', phone: '+919000000003', status: 'new',
    profile: { bedrooms: 3 } },
];

// ALL DATA BELOW IS FICTIONAL DEMONSTRATION DATA. "ABC Developers" is not a real company.

export const demoTenantSettings = {
  catalog: {
    project: 'ABC Heights',
    location: 'Gachibowli, Hyderabad',
    units: [
      { type: '2BHK', bedrooms: 2, sizeSqft: [1150, 1290], priceLakh: [68, 82] },
      { type: '3BHK', bedrooms: 3, sizeSqft: [1620, 1840], priceLakh: [88, 115] },
    ],
  },
  // Configurable qualification model (sums to 100). Hot/warm cut-offs are score thresholds.
  scoring: {
    weights: { budget: 25, requirements: 25, timeline: 20, authority: 15, appointment: 15 },
    thresholds: { hot: 75, warm: 50 },
  },
  booking: { startHour: 10, endHour: 18, slotMinutes: 60, workDays: [1, 2, 3, 4, 5, 6], daysAhead: 7, minLeadHours: 2 },
};

const { project, location, units } = demoTenantSettings.catalog;
const fmtPrice = (u) => `Rs ${u.priceLakh[0]} lakh to Rs ${u.priceLakh[1]} lakh`;

export const demoDocuments = [
  {
    title: 'ABC Heights - Project Overview',
    content: `# ABC Heights - Project Overview
(FICTIONAL DEMO DATA - ABC Developers is not a real company.)

## About the project
${project} is a gated residential apartment community by ABC Developers in ${location}. It has 2 towers of 18 floors with 264 apartments in total, built on 4.2 acres with 70 percent open space.

## Apartment configurations
${units.map((u) => `${u.type} apartments: ${u.sizeSqft[0]} to ${u.sizeSqft[1]} sq ft, priced ${fmtPrice(u)}.`).join('\n')}
All apartments are vastu compliant with 2 covered parking slots for 3BHK and 1 for 2BHK.

## Construction status
Tower A is at the 11th floor slab stage and Tower B is at the 8th floor slab stage as of the demonstration data date.`,
  },
  {
    title: 'ABC Heights - Pricing and Payment Plans',
    content: `# ABC Heights - Pricing and Payment Plans
(FICTIONAL DEMO DATA)

## Price list
${units.map((u) => `${u.type}: ${fmtPrice(u)} depending on floor and facing. Base price excludes registration, GST and maintenance deposit.`).join('\n')}

## Payment plan
Construction linked plan: 10 percent booking amount, 80 percent in stage-wise instalments linked to construction milestones, and 10 percent at possession.

## Home loan support
ABC Developers has tie-ups with three fictional partner banks. Pre-approved loans are available for eligible buyers, subject to the bank's assessment.

## Offers
A festive discount of Rs 2 lakh applies on 3BHK bookings made after a site visit, valid for the demonstration period only.`,
  },
  {
    title: 'ABC Heights - Amenities',
    content: `# ABC Heights - Amenities
(FICTIONAL DEMO DATA)

## Clubhouse and sports
A 25,000 sq ft clubhouse with a gym, indoor games room, swimming pool, badminton court and a yoga deck.

## Family facilities
A children's play area, senior citizen park, jogging track, and a convenience store inside the campus.

## Safety and utilities
24x7 security with CCTV, power backup for common areas and lifts, rainwater harvesting and a sewage treatment plant.`,
  },
  {
    title: 'ABC Heights - Location and Connectivity',
    content: `# ABC Heights - Location and Connectivity
(FICTIONAL DEMO DATA)

## Neighbourhood
${project} is located in ${location}, close to the financial district and major IT parks, about 10 minutes from the Financial District and 20 minutes from the airport expressway.

## Nearby facilities
Schools, hospitals and shopping malls are within 3 km. The nearest metro station is planned at about 2.5 km (planned, not operational).`,
  },
  {
    title: 'ABC Heights - Possession, RERA and Legal',
    content: `# ABC Heights - Possession, RERA and Legal
(FICTIONAL DEMO DATA)

## Possession timeline
Tower A possession is planned for December 2027 and Tower B for June 2028.

## RERA registration
The project carries the fictional registration number P00000000000 for demonstration only. Buyers should always verify real RERA numbers on the official state portal.

## Title and approvals
Clear title and approvals are described here only as demonstration content.`,
  },
  {
    title: 'ABC Developers - Site Visit Policy and FAQs',
    content: `# ABC Developers - Site Visit Policy and FAQs
(FICTIONAL DEMO DATA)

## Site visits
Site visits are available Monday to Saturday between 10 AM and 6 PM in one-hour slots. A sales executive shows the sample apartment and the construction site. Visits are free. Please carry a photo ID.

## Rescheduling
Visits can be rescheduled or cancelled up to 4 hours before the slot by contacting the sales team.

## Can I bring family
Yes. Family members and co-decision makers are welcome on the visit.`,
  },
];

// Sample CRM data so dashboards are not empty on first run. Flagged is_demo and shown as fictional in the UI.
export const demoLeads = [
  { full_name: 'Ravi Kumar (demo)', phone: '+919000000001', status: 'qualified', score: 78,
    profile: { bedrooms: 3, location: 'Gachibowli', budgetMax: 9500000, timelineMonths: 1, decisionMaker: 'self' } },
  { full_name: 'Sneha Reddy (demo)', phone: '+919000000002', status: 'contacted', score: 52,
    profile: { bedrooms: 2, location: 'Gachibowli', budgetMax: 7500000, timelineMonths: 4, decisionMaker: 'joint' } },
  { full_name: 'Imran Shaikh (demo)', phone: '+919000000003', status: 'new', score: 24,
    profile: { bedrooms: 3 } },
];

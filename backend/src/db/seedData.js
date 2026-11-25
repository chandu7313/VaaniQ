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
  {
    title: 'ABC Developers - Company Profile',
    content: `# ABC Developers - Company Profile
(FICTIONAL DEMO DATA - ABC Developers is not a real company.)

## Who we are
ABC Developers is a Hyderabad-based residential developer founded in 2009. It has delivered 6 residential projects with over 1,800 homes in western Hyderabad, all fictional for this demonstration.

## Current project
The company's current project is ABC Heights. Configurations, prices and availability are described in the ABC Heights project documents.

## Sales office
The sales office at the ABC Heights site is open Monday to Saturday, 10 AM to 6 PM. A human sales executive can call back customers who prefer to speak with a person.`,
  },
  {
    title: 'ABC Heights - Inventory and Availability',
    content: `# ABC Heights - Inventory and Availability
(FICTIONAL DEMO DATA)

## Total inventory
ABC Heights has 264 apartments in 2 towers: each tower has 66 2BHK and 66 3BHK apartments.

## Units available
As of the demonstration data date: 2BHK apartments available: 49 (18 in Tower A and 31 in Tower B). 3BHK apartments available: 33 (11 in Tower A and 22 in Tower B).

## Facing and floors
East-facing and north-facing units are available in both configurations. Higher floors carry a floor-rise charge that is included in the quoted price range.

## Availability changes
Availability changes daily as units are booked. The sales team confirms the exact unit availability at the time of booking.`,
  },
  {
    title: 'ABC Developers - Sales and Booking Policies',
    content: `# ABC Developers - Sales and Booking Policies
(FICTIONAL DEMO DATA)

## Blocking a unit
A token amount of Rs 1 lakh blocks a selected unit for 7 days. The token is adjusted against the 10 percent booking amount.

## Cancellation and refunds
The token is fully refundable if the booking is cancelled within 7 days. After the sale agreement is signed, a cancellation charge of 2 percent of the agreement value applies.

## Discounts and negotiation
Only the offers published in the official price list apply. No sales representative, including the VaaniQ virtual assistant, may promise any other discount. Price negotiation is handled only by the sales manager.

## Quotations
Prices may change. A written quotation is valid for 15 days from its date.

## Documents required
Buyers need PAN, Aadhaar and two passport-size photographs to book. NRI buyers are welcome and need a valid passport.`,
  },
  {
    title: 'ABC Heights - Frequently Asked Questions',
    content: `# ABC Heights - Frequently Asked Questions
(FICTIONAL DEMO DATA)

## What are the maintenance charges
Maintenance is Rs 3 per sq ft per month, collected from possession.

## Are pets allowed
Pets are allowed. Owners must keep pets on a leash in common areas.

## What is the water supply
Municipal water supply is supplemented by borewells and rainwater harvesting.

## Can I visit on a Sunday
Site visits are not available on Sundays. Visits run Monday to Saturday, 10 AM to 6 PM.

## Is car parking included
Each 3BHK includes 2 covered parking slots and each 2BHK includes 1 covered parking slot.`,
  },
];

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

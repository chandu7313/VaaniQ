// ALL DATA BELOW IS FICTIONAL DEMONSTRATION DATA. "ABC Developers" is not a real company.

export const demoTenantSettings = {
  catalog: {
    // One project name everywhere (UI, documents, agent replies), so retrieval and answers agree.
    project: 'GreenHaven Residences',
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
    title: 'GreenHaven Residences - Project Overview',
    content: `# GreenHaven Residences - Project Overview
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
    title: 'GreenHaven Residences - Pricing and Payment Plans',
    content: `# GreenHaven Residences - Pricing and Payment Plans
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
    title: 'GreenHaven Residences - Amenities',
    content: `# GreenHaven Residences - Amenities
(FICTIONAL DEMO DATA)

## Clubhouse and sports
A 25,000 sq ft clubhouse with a gym, indoor games room, swimming pool, badminton court and a yoga deck.

## Family facilities
A children's play area, senior citizen park, jogging track, and a convenience store inside the campus.

## Safety and utilities
24x7 security with CCTV, power backup for common areas and lifts, rainwater harvesting and a sewage treatment plant.`,
  },
  {
    title: 'GreenHaven Residences - Location and Connectivity',
    content: `# GreenHaven Residences - Location and Connectivity
(FICTIONAL DEMO DATA)

## Neighbourhood
${project} is located in ${location}, close to the financial district and major IT parks, about 10 minutes from the Financial District and 20 minutes from the airport expressway.

## Nearby facilities
Schools, hospitals and shopping malls are within 3 km. The nearest metro station is planned at about 2.5 km (planned, not operational).`,
  },
  {
    title: 'GreenHaven Residences - Possession, RERA and Legal',
    content: `# GreenHaven Residences - Possession, RERA and Legal
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
The company's current project is GreenHaven Residences. Configurations, prices and availability are described in the GreenHaven Residences project documents.

## Sales office
The sales office at the GreenHaven Residences site is open Monday to Saturday, 10 AM to 6 PM. A human sales executive can call back customers who prefer to speak with a person.`,
  },
  {
    title: 'GreenHaven Residences - Inventory and Availability',
    content: `# GreenHaven Residences - Inventory and Availability
(FICTIONAL DEMO DATA)

## Total inventory
GreenHaven Residences has 264 apartments in 2 towers: each tower has 66 2BHK and 66 3BHK apartments.

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
    title: 'GreenHaven Residences - Frequently Asked Questions',
    content: `# GreenHaven Residences - Frequently Asked Questions
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
  {
    title: 'GreenHaven Residences - Floor Plans and Carpet Areas',
    content: `# GreenHaven Residences - Floor Plans and Carpet Areas
(FICTIONAL DEMO DATA)

## 2BHK floor plan
2BHK apartments have a super built-up area of 1150 to 1290 sq ft and a carpet area of 820 to 920 sq ft. Each has a living and dining area, two bedrooms, two bathrooms, a kitchen with a utility area, and two balconies.

## 3BHK floor plan
3BHK apartments have a super built-up area of 1620 to 1840 sq ft and a carpet area of 1160 to 1320 sq ft. Each has a living and dining area, three bedrooms, three bathrooms, a kitchen with a utility area, a pooja niche, and three balconies.

## Room sizes
Master bedroom: 13 ft x 14 ft in 3BHK and 12 ft x 13 ft in 2BHK. Living room: 12 ft x 20 ft in 3BHK and 11 ft x 17 ft in 2BHK. Kitchen: 9 ft x 10 ft in both configurations.

## Carpet area versus super built-up area
Carpet area is the usable floor area inside the apartment walls. Super built-up area adds the wall thickness, balconies and a proportionate share of common areas such as lobbies, staircases and the clubhouse. Prices are quoted on super built-up area.`,
  },
  {
    title: 'GreenHaven Residences - Specifications and Finishes',
    content: `# GreenHaven Residences - Specifications and Finishes
(FICTIONAL DEMO DATA)

## Structure
RCC framed structure designed for seismic zone II, with solid concrete block walls.

## Flooring
800 mm x 800 mm vitrified tiles in the living, dining and bedrooms. Laminated wooden flooring in the master bedroom of 3BHK apartments. Anti-skid ceramic tiles in bathrooms, balconies and the utility area.

## Kitchen specification
Granite counter top with a stainless steel sink, ceramic wall tiles up to 2 ft above the counter, and provisions for a water purifier, a chimney, a microwave and a washing machine in the utility area. Kitchen cabinets are not included.

## Bathrooms
Wall tiles up to 7 ft, wall-mounted EWC, chrome-plated fittings, and provision for a geyser in every bathroom.

## Doors and windows
Teak wood frame main door, UPVC sliding windows with mosquito mesh, and UPVC sliding doors to the balconies.

## Electrical and power
Concealed copper wiring with modular switches. Each apartment has a 5 kW connection for 2BHK and 7 kW for 3BHK, with 100 percent DG power backup for common areas and 2 kW backup per apartment.

## Lifts
Three high-speed lifts per tower, including one service lift.`,
  },
  {
    title: 'GreenHaven Residences - Construction-Linked Payment Schedule',
    content: `# GreenHaven Residences - Construction-Linked Payment Schedule
(FICTIONAL DEMO DATA)

## Payment schedule by construction stage
The payment schedule for every apartment is construction-linked, paid in 10 instalments of 10 percent each:
Booking: 10 percent. Completion of foundation: 10 percent. Completion of the 2nd slab: 10 percent. Completion of the 5th slab: 10 percent. Completion of the 8th slab: 10 percent. Completion of the 11th slab: 10 percent. Completion of the 14th slab: 10 percent. Completion of the top (18th) slab: 10 percent. Completion of flooring and finishing: 10 percent. Possession: 10 percent.

## Taxes and charges
GST, registration, stamp duty and the maintenance deposit are payable in addition to the instalments, as per applicable rules at the time of payment.

## How to pay
Payments are accepted by bank transfer or cheque in favour of the project escrow account only. ABC Developers does not accept cash payments.`,
  },
  {
    title: 'ABC Developers - Home Loans and EMI Guide',
    content: `# ABC Developers - Home Loans and EMI Guide
(FICTIONAL DEMO DATA. Interest rates and EMIs are illustrative, not an offer.)

## Partner banks
GreenHaven Residences is pre-approved by three fictional partner lenders: Deccan Housing Bank, Charminar Finance and Godavari Home Loans. Buyers may also use any other bank.

## Loan eligibility
Under RBI loan-to-value norms, lenders can finance up to 80 percent of the property value for loans from Rs 30 lakh to Rs 75 lakh, and up to 75 percent for loans above Rs 75 lakh, subject to income, credit score and the lender's own assessment. Loan tenure can be up to 30 years.

## Illustrative EMI examples
At an illustrative interest rate of 8.5 percent for 20 years: a loan of Rs 50 lakh has an EMI of about Rs 43,391; a loan of Rs 70 lakh has an EMI of about Rs 60,748; and a loan of Rs 80 lakh has an EMI of about Rs 69,426. Actual EMIs depend on the lender's rate on the day of sanction.

## Documents for a home loan
PAN, Aadhaar, the last 6 months of salary slips or 2 years of income tax returns for self-employed buyers, 6 months of bank statements, and the allotment letter from ABC Developers.`,
  },
  {
    title: 'GreenHaven Residences - Neighbourhood Guide',
    content: `# GreenHaven Residences - Neighbourhood Guide
(FICTIONAL DEMO DATA. Distances are approximate.)

## Schools nearby
An international CBSE and IB school at about 1.8 km, a state-board school at about 2.2 km, and two pre-schools within 1 km.

## Hospitals nearby
A 300-bed multi-speciality hospital at about 2.6 km and a 24x7 clinic and pharmacy at about 900 m.

## Shopping and daily needs
A large shopping mall at about 2.9 km, two supermarkets within 1.5 km, and a convenience store inside the campus.

## Workplaces
The Financial District and major IT parks are about 10 minutes away by road.`,
  },
  {
    title: 'GreenHaven Residences - Green and Safety Features',
    content: `# GreenHaven Residences - Green and Safety Features
(FICTIONAL DEMO DATA)

## Energy and water
Solar panels power the common-area lighting. A sewage treatment plant recycles water for landscaping, and rainwater harvesting pits recharge groundwater. Treated water is used for flushing.

## Electric vehicles
Each tower has shared EV charging points in the basement, and every 3BHK parking slot has provision for a private charger.

## Fire and life safety
Automatic sprinklers and smoke detectors in common areas, fire hydrants on every floor, and two staircases per tower.

## Security
Three-tier security with a manned gate, CCTV in common areas and an intercom from every apartment to the security desk.

## Certification status
The project is designed to green-building guidelines, but no green-building certification has been obtained.`,
  },
  {
    title: 'ABC Developers - Maintenance, Society and After-Sales',
    content: `# ABC Developers - Maintenance, Society and After-Sales
(FICTIONAL DEMO DATA)

## Maintenance charges
Maintenance is Rs 3 per sq ft per month, collected from possession. A one-time corpus fund of Rs 50 per sq ft is collected at possession.

## Owners' association
ABC Developers manages the facilities for the first 12 months after possession, after which the registered owners' association takes over.

## Defect liability
Structural defects reported within 5 years of possession are rectified by ABC Developers at no cost, as required under RERA.

## Customer care
The customer care desk is open Monday to Saturday, 10 AM to 6 PM. Service requests can be raised at the site office or by email to the sales team.`,
  },
  {
    title: 'ABC Developers - NRI Buyer Guide',
    content: `# ABC Developers - NRI Buyer Guide
(FICTIONAL DEMO DATA. General guidance only, not legal or tax advice.)

## Can NRIs buy here
Non-resident Indians can buy residential apartments at GreenHaven Residences. The ABC Developers sales team assists NRI buyers remotely.

## Payments for NRI buyers
NRI payments must come from an NRE, NRO or FCNR account in India, or by inward remittance through normal banking channels.

## Documents for NRI buyers
A valid passport, an overseas address proof, PAN, and passport-size photographs. A power of attorney can be used if the buyer cannot be present for registration.

## Site visits for NRI buyers
NRI buyers can join a video site visit with a sales executive during visiting hours, Monday to Saturday, 10 AM to 6 PM.`,
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

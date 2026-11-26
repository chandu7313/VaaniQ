---
doc_id: ABC-GHR-KB-19
tenant_slug: abc-developers
document_title: "Parking and Vehicle Facilities"
category: apartments
subcategory: parking
version: 1.0.0
status: active_demo
authority_level: 3
data_classification: public
retrieval_scope: customer_facing
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: true
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Parking and Vehicle Facilities

> **FICTIONAL DEMONSTRATION DATA.** Parking allocations and vehicle facilities are `SYNTHETIC_DEMO_ASSUMPTION`. Car-parking charges are `NOT_PROVIDED`. Slot numbers are allotted by the CRM team and are not part of this document.

## 1. Purpose
Explains how residential parking, visitor parking, two-wheeler parking and electric-vehicle (EV) provisions are planned at GreenHaven Residences, and what the agent must not promise about slot location or cost.

## 2. Business context
In Gachibowli most households own at least one car and many own two; parking is therefore a frequent deciding factor, especially for 3BHK buyers. Questions about EV charging are increasing. Because slot allotment and charges are commercial decisions, the agent describes the plan and leaves allotment to the CRM team.

## 3. Parking provisions
| Item | Provision | Status |
|---|---|---|
| Covered car parking, 2BHK | 1 slot per apartment | SYNTHETIC_DEMO_ASSUMPTION |
| Covered car parking, 3BHK | 2 slots per apartment | SYNTHETIC_DEMO_ASSUMPTION |
| Parking levels | Two basement levels below the towers | SYNTHETIC_DEMO_ASSUMPTION |
| Two-wheeler parking | Designated common two-wheeler bays in the basement | SYNTHETIC_DEMO_ASSUMPTION |
| Visitor parking | Marked visitor bays at surface level near the main gate | SYNTHETIC_DEMO_ASSUMPTION |
| EV-charging provision | Conduit and power provision at each allotted slot; charger hardware purchased by the owner | SYNTHETIC_DEMO_ASSUMPTION |
| Common EV chargers | — | NOT_CONFIGURED |
| Car-parking charge | — | NOT_PROVIDED |
| Additional (extra) slot purchase | — | REQUIRES_HUMAN_CONFIRMATION |
| Slot location / slot number | Allotted by the CRM team after booking | Operational record, not RAG |

### 3.1 Access and safety (SYNTHETIC_DEMO_ASSUMPTION)
- Ramps from the main internal road to both basement levels; separate entry and exit ramps.
- CCTV coverage, lighting and fire sprinklers in the basements (`ABC-GHR-KB-14`).
- Lifts from both basement levels to every residential floor.
- Vehicle stickers or RFID tags issued by the facility-management team at handover (`ABC-GHR-KB-67`).

### 3.2 How allotment works (SYNTHETIC_DEMO_ASSUMPTION)
Slots are allotted after the booking is confirmed and recorded in the allotment letter. Allotment rules (for example by tower or by booking order) are decided by the CRM team; the agent does not predict where a customer's slot will be.

## 4. Customer-facing explanation
"Each 2BHK comes with one covered car-parking slot and each 3BHK with two, in the basement levels. There's separate two-wheeler parking and visitor parking near the gate. Every allotted slot has provision for an EV charger, and you'd install your own charger. Parking charges and the exact slot location are confirmed by our team after booking."

## 5. Important conditions
- Never state or estimate a parking charge; it is `NOT_PROVIDED` and belongs on the approved cost sheet (`ABC-GHR-KB-32`).
- Never promise a specific slot, a slot near the lift, or an extra slot.
- Parking counts are synthetic and may change in the approved plan; say "as per the current plan".

## 6. Exceptions
- **Customer needs a third slot:** possible availability is `REQUIRES_HUMAN_CONFIRMATION`; record the request and route to the sales executive.
- **Accessibility needs:** the agent records the need (with consent) and the CRM team considers it during allotment; nothing is promised.
- **Commercial vehicles:** parking of commercial vehicles inside the campus is not permitted (SYNTHETIC_DEMO_ASSUMPTION; society rules govern after handover).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "How many car parks with a 3BHK?" | Two covered slots (synthetic). |
| "Is parking included in the price?" | Charges NOT_PROVIDED; cost sheet confirms. |
| "Can I charge my EV?" | Provision at each slot; owner installs the charger. |
| "Which slot will I get?" | Allotted after booking by the CRM team. |
| "Where do my guests park?" | Visitor bays near the main gate. |

## 8. What the AI agent can confidently answer
Number of covered slots per configuration, basement location, two-wheeler and visitor parking, EV provision, allotment process.

## 9. What the AI must not claim
Parking charges, slot locations, extra slots, common EV chargers, or that numbers are final.

## 10. Escalation
Extra-slot or accessibility requests → **sales executive** (`ESC-08`); parking charges → cost sheet (`ESC-05`); allotment disputes after booking → **customer care** (`ESC-06`).

Related documents: `ABC-GHR-KB-14`, `ABC-GHR-KB-15`, `ABC-GHR-KB-16`, `ABC-GHR-KB-32`.

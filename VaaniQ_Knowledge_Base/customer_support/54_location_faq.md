---
doc_id: ABC-GHR-KB-54
tenant_slug: abc-developers
document_title: "Location FAQ"
category: customer_support
subcategory: faq_location
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
source_of_truth: "config/*.json (FAQ answers restate structured records)"
approval_status: PENDING_REVIEW
---
# Location FAQ

> **FICTIONAL DEMONSTRATION DATA.** The locality (Gachibowli, Hyderabad, Telangana) is CANONICAL. **Exact distances, travel times and the site address are `NOT_PROVIDED`** (seed distances superseded, reconciliation item R-08). General descriptions of Gachibowli are public knowledge stated without measurements.

## 1. Purpose
Answers location and neighbourhood questions without inventing distances, travel times or claims about future infrastructure.

## 2. Business context
Commute is a top decision factor for IT professionals. Wrong distance claims are easy to check and quickly damage trust.

## 3. Questions and answers
| Question | Answer |
|---|---|
| Where is GreenHaven Residences? | In Gachibowli, in western Hyderabad, Telangana. |
| What's the exact address? | NOT_PROVIDED; the sales team shares the site location for visits. |
| How far is it from the Financial District / HITEC City? | Exact distances are not provided. Gachibowli is part of Hyderabad's western IT corridor, which includes those areas. |
| How long is the drive to the airport? | NOT_PROVIDED; travel time depends on route and traffic. |
| Is there a metro station nearby? | NOT_PROVIDED for distance; do not name a station as "nearby". |
| Which schools and hospitals are close? | NOT_PROVIDED; the sales team can share local information. |
| Is Gachibowli a good area to invest? | No investment advice; the agent can describe the project. |
| Is there a new road / flyover coming? | Future infrastructure is not stated; no speculation. |
| Is the area safe? | No guarantees; the community has planned security features (`ABC-GHR-KB-14`). |
| Where is the sales office? | At the project site in Gachibowli (SYNTHETIC_DEMO_ASSUMPTION). |

## 4. Customer-facing explanation
"GreenHaven Residences is in Gachibowli, part of Hyderabad's western IT corridor. I don't have verified distances or travel times, so I'd suggest visiting at your usual commute time; our team can share the exact location."

## 5. Important conditions
- Never state a distance in km or minutes.
- Never name schools, hospitals or malls as "nearby" with an implied distance.

## 6. Exceptions
- Customers sharing their office location: the agent can acknowledge it but not estimate the commute.

## 7. Common customer questions
The table above.

## 8. What the AI agent can confidently answer
Locality, city, state, general corridor description, sales-office location.

## 9. What the AI must not claim
Distances, travel times, landmarks as nearby, future infrastructure, investment value.

## 10. Escalation
Neighbourhood specifics → **sales executive** (`ESC-08`).

Related documents: `ABC-GHR-KB-08`, `ABC-GHR-KB-53`.

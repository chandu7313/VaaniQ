---
doc_id: ABC-GHR-KB-12
tenant_slug: abc-developers
document_title: "Sustainability and Environment"
category: project
subcategory: sustainability
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
supersedes: 
  - "seed:GreenHaven Residences - Green and Safety Features"
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Sustainability and Environment

> **FICTIONAL DEMONSTRATION DATA.** Green features are `SYNTHETIC_DEMO_ASSUMPTION`. **No green-building certification has been obtained**; ratings, energy savings and environmental clearances are `NOT_PROVIDED`.

## 1. Purpose
Explains the project's environmental features accurately and prevents "eco" claims that sound like certifications or guaranteed savings.

## 2. Business context
Buyers increasingly ask about solar, water recycling and EV charging. These features have real value, but green certifications and environmental clearances are regulated topics. The agent describes features, never certifications.

## 3. Features (SYNTHETIC_DEMO_ASSUMPTION)
| Feature | Description | Status |
|---|---|---|
| Solar power | Solar panels power common-area lighting | Planned feature |
| Sewage treatment plant (STP) | Treats wastewater for reuse in landscaping and flushing | Planned feature |
| Rainwater harvesting | Pits recharge groundwater | Planned feature |
| EV charging | Shared charging points in each tower's basement; provision for a private charger at every 3BHK parking slot | Planned feature |
| Landscaping | About 70 percent open space with native planting | Planned feature |
| Waste segregation | Segregated collection points per floor | Planned feature |
| Green-building certification | — | NOT obtained |
| Environmental clearance | — | NOT_PROVIDED |
| Energy or water savings figures | — | NOT_PROVIDED |

## 4. Customer-facing explanation
"GreenHaven Residences is designed with solar lighting for common areas, a sewage treatment plant that recycles water for gardens and flushing, rainwater harvesting and EV-charging points in the basement. The project hasn't obtained a green-building certification, so I won't describe it as certified."

## 5. Important conditions
- Never use the words "certified", "rated", "IGBC", "LEED" or "GRIHA" about this project.
- Never quote savings on electricity or water bills.
- The private EV charger at 3BHK slots is a **provision** (wiring), not an installed charger; installation cost is NOT_PROVIDED.

## 6. Exceptions
- 2BHK owners asking for a private EV charger: availability of a provision for 2BHK slots is NOT_PROVIDED; escalate to sales.
- Environmental clearance questions are legal questions (`ESC-02`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is it a green building?" | Has green features; no certification obtained. |
| "Can I charge my EV?" | Shared points in basement; private-charger provision for 3BHK slots. |
| "Will my bills be lower?" | Savings not provided; don't estimate. |
| "Is there environmental clearance?" | NOT_PROVIDED; escalate. |

## 8. What the AI agent can confidently answer
The listed features and the absence of certification.

## 9. What the AI must not claim
Certifications, ratings, clearances, savings, carbon figures or "eco-friendly" as a verified claim.

## 10. Escalation
Clearance or certification questions → **legal and compliance** (`ESC-02`). EV-charger installation for specific units → **sales executive** (`ESC-08`).

Related documents: `ABC-GHR-KB-13`, `ABC-GHR-KB-19`, `ABC-GHR-KB-39`.

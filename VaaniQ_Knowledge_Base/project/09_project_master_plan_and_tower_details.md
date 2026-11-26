---
doc_id: ABC-GHR-KB-09
tenant_slug: abc-developers
document_title: "Project Master Plan and Tower Details"
category: project
subcategory: master_plan
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
  - "seed:GreenHaven Residences - Inventory and Availability"
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Project Master Plan and Tower Details

> **FICTIONAL DEMONSTRATION DATA.** Towers A and B are CANONICAL fictional sample towers. Floor counts, unit mix and layout are `SYNTHETIC_DEMO_ASSUMPTION` carried over from the original seed data. Approved site plans are `NOT_PROVIDED`.

## 1. Purpose
Describes how the project is laid out (towers, floors, unit mix, common areas) so the agent can answer structural questions consistently. It deliberately contains **no live availability**; unit status lives in the inventory database (NOT_CONFIGURED in the demo app).

## 2. Business context
Customers ask which tower is better, how many floors there are and where the amenities sit. These are static design facts (synthetic here); which specific units are still available is dynamic and comes only from live systems.

## 3. Master plan (SYNTHETIC_DEMO_ASSUMPTION)
| Element | Description |
|---|---|
| Site | about 4.2 acres, about 70 percent open space |
| Towers | Tower A and Tower B, 18 residential floors each |
| Central podium | Landscaped gardens, children's play area, clubhouse (approx. 25,000 sq.ft) |
| Periphery | Jogging track and landscaped walkways |
| Parking | Basement covered parking for both towers |
| Entry | Single gated entry with security cabin |

### 3.1 Unit mix per tower (SYNTHETIC_DEMO_ASSUMPTION)
| Tower | 2BHK units | 3BHK units | Total |
|---|---|---|---|
| Tower A | 66 | 66 | 132 |
| Tower B | 66 | 66 | 132 |
| **Project** | **132** | **132** | **264** |

### 3.2 Typical floor (SYNTHETIC_DEMO_ASSUMPTION)
Each tower has about 7–8 apartments per floor (264 ÷ 2 towers ÷ 18 floors ≈ 7.3; ground-level and amenity floors vary). Exact floor plates, unit numbering and facing per unit are `NOT_PROVIDED` until approved floor plans are published (`ABC-GHR-KB-17`).

### 3.3 Facings
East-facing and north-facing units exist in both configurations (SYNTHETIC_DEMO_ASSUMPTION). Which facings are currently available is a **live inventory** question.

### 3.4 Lifts and staircases
Three high-speed lifts per tower including one service lift, and two staircases per tower (SYNTHETIC_DEMO_ASSUMPTION; see `ABC-GHR-KB-11`, `ABC-GHR-KB-14`).

## 4. Customer-facing explanation
"GreenHaven Residences has two towers, A and B, each with 18 floors, around a central landscaped podium with the clubhouse. Both towers have 2BHK and 3BHK homes. For which floors and facings are available right now, our sales executive checks the live inventory."

## 5. Important conditions
- Never state how many units remain, which floors are "sold out" or which units are "best".
- Unit numbers and exact floor plates come only from approved plans.

## 6. Exceptions
- Earlier seed text listed per-tower availability numbers; that static availability is **superseded** because availability belongs in the live database (reconciliation report, item R-09).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Which tower is better?" | Both have the same unit mix; preferences (facing, floor) are discussed with sales. |
| "How many floors?" | 18 per tower (SYNTHETIC_DEMO_ASSUMPTION). |
| "Is a high floor available?" | Live inventory; offer sales follow-up. |
| "How many flats per floor?" | About 7–8; exact plates NOT_PROVIDED. |

## 8. What the AI agent can confidently answer
Tower names, floor count, unit mix and the general layout (all labelled demonstration data).

## 9. What the AI must not claim
Live availability, sold-out status, best units, view guarantees or approved plans.

## 10. Escalation
Availability or specific-unit questions → **sales executive** (`ESC-08`). Site-plan approvals → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-07`, `ABC-GHR-KB-17`, `ABC-GHR-KB-19`, `ABC-GHR-KB-21`.

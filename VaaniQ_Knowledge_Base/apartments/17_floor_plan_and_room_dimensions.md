---
doc_id: ABC-GHR-KB-17
tenant_slug: abc-developers
document_title: "Floor Plan and Room Dimensions"
category: apartments
subcategory: floor_plans
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
  - "seed:GreenHaven Residences - Floor Plans and Carpet Areas"
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Floor Plan and Room Dimensions

> **FICTIONAL DEMONSTRATION DATA.** Approved floor plans are `NOT_PROVIDED`. The room dimensions below are an **indicative layout (`SYNTHETIC_DEMO_ASSUMPTION`)** for conversation purposes only; they are **not** used to calculate carpet, built-up or saleable area, and they may change in the approved plan (`REQUIRES_HUMAN_CONFIRMATION`).

## 1. Purpose
Lets the agent describe room sizes when a customer asks "how big is the master bedroom?" while making clear these are indicative and not an area calculation. Replaces the seed document that stated carpet areas derived from built-up figures (reconciliation item R-05).

## 2. Business context
Customers imagine furniture and family use from room sizes. Indicative dimensions help that conversation; presenting them as approved or summing them into an area would be misleading.

## 3. Indicative room dimensions (SYNTHETIC_DEMO_ASSUMPTION)
### 3.1 2BHK (built-up approximately 1,180 sq.ft, CANONICAL)
| Room | Indicative size (feet) |
|---|---|
| Living and dining | 11 × 17 |
| Master bedroom | 12 × 13 |
| Bedroom 2 | 11 × 12 |
| Kitchen | 8 × 10 |
| Utility | 4 × 6 |
| Master bathroom | 5 × 8 |
| Common bathroom | 5 × 7 |
| Balconies (2) | 4 × 10 each |

### 3.2 3BHK (built-up approximately 1,560 sq.ft, CANONICAL)
| Room | Indicative size (feet) |
|---|---|
| Living and dining | 12 × 20 |
| Master bedroom | 13 × 14 |
| Bedroom 2 | 11 × 13 |
| Bedroom 3 | 10 × 12 |
| Kitchen | 9 × 10 |
| Utility | 4 × 7 |
| Bathrooms (3) | 5 × 8 each |
| Balconies (3) | 4 × 10 each |

## 4. Why these numbers must not be summed
Room dimensions exclude walls, corridors, ducts and shared areas, and indicative layouts change during approval. Adding them up gives neither carpet area nor built-up area. **Carpet area is NOT_PROVIDED** for both configurations; only the approved plan states it (`ABC-GHR-KB-18`).

## 5. Customer-facing explanation
"As an indicative layout, the 3BHK master bedroom is about 13 by 14 feet and the living-dining area about 12 by 20 feet. These are approximate and can change in the approved plan. The official carpet area will be on the approved plan and your agreement."

## 6. Important conditions
- Always say "indicative" or "approximate" with any room size.
- Never present a total derived from room sizes.
- Approved plans and the sale agreement override this document.

## 7. Exceptions / common questions
| Question | Answer approach |
|---|---|
| "Can I get the floor plan PDF?" | Approved plan NOT_PROVIDED; sales executive shares it when available. |
| "Will a king-size bed fit in the master bedroom?" | Indicative 13 × 14 ft (3BHK) or 12 × 13 ft (2BHK); confirm at site visit. |
| "What's the carpet area then?" | NOT_PROVIDED; do not calculate. |
| "Which way does the balcony face?" | Depends on unit; live inventory. |

## 8. What the AI agent can confidently answer
Indicative room sizes, clearly labelled.

## 9. What the AI must not claim
Approved dimensions, carpet area, totals, or that dimensions are guaranteed.

## 10. Escalation
Approved-plan requests → **sales executive** (`ESC-08`); plan disputes after booking → **customer care** (`ESC-06`).

Related documents: `ABC-GHR-KB-15`, `ABC-GHR-KB-16`, `ABC-GHR-KB-18`.

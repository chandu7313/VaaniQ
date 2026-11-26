---
doc_id: ABC-GHR-KB-20
tenant_slug: abc-developers
document_title: "Apartment Customization Policy"
category: apartments
subcategory: customization
version: 1.0.0
status: active_demo
authority_level: 2
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
# Apartment Customization Policy

> **FICTIONAL DEMONSTRATION DATA.** The customization policy is `SYNTHETIC_DEMO_ASSUMPTION` and is `PENDING_REVIEW`. Customization charges are `NOT_PROVIDED`. Structural changes are never permitted.

## 1. Purpose
Defines which changes a buyer may request before handover, which are never allowed, how requests are approved, and what the agent may say about them.

## 2. Business context
Buyers often ask to change flooring, kitchen layout or fittings. Allowing limited, non-structural changes improves satisfaction, but every change affects construction scheduling, cost and safety. The agent therefore explains the policy and never approves a request.

## 3. Policy
### 3.1 Permitted on request (SYNTHETIC_DEMO_ASSUMPTION)
| Change | Condition |
|---|---|
| Choice of floor-tile colour from the standard range | Request before the flooring stage of the unit |
| Electrical point relocation within the same room | Request before internal wiring; limited to a set number of points |
| Omission of kitchen granite counter (credit not guaranteed) | Written request; credit, if any, decided by the project team |
| Bathroom fitting upgrades from a builder-approved list | Paid upgrade; price on request |

### 3.2 Never permitted
- Changes to structural elements: columns, beams, slabs, shear walls.
- Moving bathrooms, kitchens or plumbing shafts.
- Changes to the external façade, balcony enclosure or window positions.
- Anything that would breach approved plans or building regulations.

### 3.3 Process (SYNTHETIC_DEMO_ASSUMPTION)
1. Customer submits a written request to the CRM team after booking.
2. The project team reviews feasibility and the construction stage of the unit.
3. If feasible, the customer receives a written quotation and timeline impact.
4. Work proceeds only after the customer accepts in writing and pays any charge.
5. Requests received after the relevant construction stage are declined.

| Field | Status |
|---|---|
| Customization charges | NOT_PROVIDED |
| Cut-off stages per item | REQUIRES_HUMAN_CONFIRMATION |
| Effect on possession timeline | REQUIRES_HUMAN_CONFIRMATION |

## 4. Customer-facing explanation
"Some non-structural changes, such as tile colour from our standard range or moving electrical points within a room, can be requested after booking, as long as the request comes before that stage of construction. Structural changes and moving kitchens or bathrooms aren't allowed. Every request is reviewed by the project team, and any cost is confirmed in writing first."

## 5. Important conditions
- The agent cannot approve, price or schedule a customization.
- Customizations do not change the area or the base price range of the apartment.
- Interior work after handover is governed by the society's rules and requires no structural change (`ABC-GHR-KB-68`).

## 6. Exceptions
- **Pre-booking requests:** the agent records the interest and explains requests are reviewed only after booking.
- **Accessibility modifications** (grab bars, ramps inside the unit): considered sympathetically by the project team; still subject to feasibility (REQUIRES_HUMAN_CONFIRMATION).
- **Combining two apartments:** not permitted (SYNTHETIC_DEMO_ASSUMPTION).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Can I remove a wall to enlarge the living room?" | Structural or partition changes not allowed before handover; never approve. |
| "Can I choose wooden flooring in all bedrooms?" | Upgrade options on request; project team decides. |
| "How much will customization cost?" | NOT_PROVIDED; quotation after review. |
| "Will it delay my possession?" | REQUIRES_HUMAN_CONFIRMATION. |

## 8. What the AI agent can confidently answer
The categories of permitted and prohibited changes and the request process.

## 9. What the AI must not claim
Approval of any request, prices, cut-off dates, or timeline effects.

## 10. Escalation
Customization requests → **CRM team via sales executive** (`ESC-08`); disputes about declined requests → **customer care** (`ESC-06`).

Related documents: `ABC-GHR-KB-11`, `ABC-GHR-KB-17`, `ABC-GHR-KB-64`, `ABC-GHR-KB-68`.

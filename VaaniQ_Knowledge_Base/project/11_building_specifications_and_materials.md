---
doc_id: ABC-GHR-KB-11
tenant_slug: abc-developers
document_title: "Building Specifications and Materials"
category: project
subcategory: specifications
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
  - "seed:GreenHaven Residences - Specifications and Finishes"
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Building Specifications and Materials

> **FICTIONAL DEMONSTRATION DATA.** Specifications are `SYNTHETIC_DEMO_ASSUMPTION` carried forward from the original seed. Brand names, model numbers and test certificates are `NOT_PROVIDED`. Final specifications are those in the signed sale agreement.

## 1. Purpose
The reference for "what finishes do I get?" covering structure, flooring, kitchen, bathrooms, doors, windows, electrical and lifts, so the agent can answer specification questions precisely.

## 2. Business context
Specification questions are concrete and easy to verify at handover, so precision matters. Anything not listed is unknown, and the agent says so rather than assuming a standard.

## 3. Specifications (SYNTHETIC_DEMO_ASSUMPTION)
| Area | Specification |
|---|---|
| Structure | RCC framed structure for seismic zone II; solid concrete block walls |
| Living, dining, bedrooms | 800 mm × 800 mm vitrified tiles |
| Master bedroom (3BHK) | Laminated wooden flooring |
| Bathrooms, balconies, utility | Anti-skid ceramic tiles |
| Kitchen counter | Granite counter top with stainless steel sink |
| Kitchen walls | Ceramic tiles up to 2 ft above the counter |
| Kitchen provisions | Water purifier, chimney and microwave points; washing machine point in utility |
| Kitchen cabinets | **Not included** |
| Bathroom walls | Tiles up to 7 ft |
| Bathroom fittings | Wall-mounted EWC, chrome-plated fittings; geyser provision in every bathroom |
| Main door | Teak wood frame |
| Windows | UPVC sliding windows with mosquito mesh |
| Balcony doors | UPVC sliding doors |
| Electrical | Concealed copper wiring, modular switches |
| Sanctioned load | 5 kW (2BHK), 7 kW (3BHK) |
| Power backup | 100 percent DG backup for common areas; 2 kW per apartment |
| Lifts | Three high-speed lifts per tower, including one service lift |
| Painting | Interior and exterior paint type: NOT_PROVIDED |
| Brands (tiles, fittings, wiring, lifts) | NOT_PROVIDED |
| False ceiling, air-conditioning, wardrobes | NOT_PROVIDED (treat as not included unless a cost sheet says otherwise) |

## 4. Customer-facing explanation
"Living areas and bedrooms have 800 by 800 mm vitrified tiles, the 3BHK master bedroom has wooden laminate flooring, and the kitchen has a granite counter with a steel sink and points for a purifier, chimney and microwave. Kitchen cabinets aren't included. Brands aren't listed in my information; the final specification is in your sale agreement."

## 5. Important conditions
- The signed sale agreement's specification schedule overrides this document (`ABC-GHR-KB-40`).
- "Provision" means a point or connection, not the appliance itself.

## 6. Exceptions
- Upgrade requests are handled under `ABC-GHR-KB-20` (customization policy).
- If the specification on the agreement differs from this document, the discrepancy is reported to sales management.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is the kitchen modular?" | Cabinets not included; counter and sink are. |
| "Which brand of tiles?" | NOT_PROVIDED. |
| "Do I get ACs?" | NOT_PROVIDED; treat as not included. |
| "Is there power backup?" | 2 kW per apartment; 100% for common areas. |

## 8. What the AI agent can confidently answer
Every specification row marked above, labelled as demonstration data, and the fact that cabinets are excluded.

## 9. What the AI must not claim
Brands, warranties on fittings, inclusions not listed (ACs, wardrobes, false ceiling), or that specifications are final before the agreement.

## 10. Escalation
Brand, warranty or inclusion questions → **sales executive** (`ESC-08`). Specification disputes after booking → **customer care** (`ESC-06`).

Related documents: `ABC-GHR-KB-15`, `ABC-GHR-KB-16`, `ABC-GHR-KB-20`, `ABC-GHR-KB-40`.

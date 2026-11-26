---
doc_id: ABC-GHR-KB-15
tenant_slug: abc-developers
document_title: "2BHK Detailed Specifications"
category: apartments
subcategory: 2bhk
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
# 2BHK Detailed Specifications

> **FICTIONAL DEMONSTRATION DATA.** The built-up area (approximately 1,180 sq.ft) and the indicative base-price range (₹67,50,000 – ₹69,00,000) are CANONICAL. Room count details are `SYNTHETIC_DEMO_ASSUMPTION`. **Carpet area is `NOT_PROVIDED`** and must not be derived from the built-up area.

## 1. Purpose
The complete reference for the 2BHK apartment at GreenHaven Residences: what it contains, its area basis, its price basis and what remains unknown. Values are mastered in `config/project_catalog.json` and `config/pricing_catalog.json`.

## 2. Business context
2BHK buyers are often first-time buyers, young families or investors with budgets around ₹65–75 lakh. They compare size and price carefully, so area terminology and price conditions must be exact.

## 3. Apartment details
| Attribute | Value | Status |
|---|---|---|
| Configuration | 2BHK (2 bedrooms, hall, kitchen) | CANONICAL |
| Built-up area | approximately 1,180 sq.ft | CANONICAL |
| Carpet area | — | NOT_PROVIDED |
| Super built-up / saleable area | — | NOT_PROVIDED |
| Bathrooms | 2 | SYNTHETIC_DEMO_ASSUMPTION |
| Balconies | 2 | SYNTHETIC_DEMO_ASSUMPTION |
| Utility area | Yes, attached to kitchen | SYNTHETIC_DEMO_ASSUMPTION |
| Covered parking | 1 slot | SYNTHETIC_DEMO_ASSUMPTION |
| Indicative base price | ₹67,50,000 – ₹69,00,000 | CANONICAL |
| Available towers | Tower A and Tower B | CANONICAL |
| Units per tower | 66 | SYNTHETIC_DEMO_ASSUMPTION |
| Facings | East and north (which are available: live inventory) | SYNTHETIC_DEMO_ASSUMPTION |
| Sanctioned electrical load | 5 kW; 2 kW power backup | SYNTHETIC_DEMO_ASSUMPTION |
| Current availability | — | Live inventory only (NOT_CONFIGURED in demo app) |

### 3.1 Inside the apartment (SYNTHETIC_DEMO_ASSUMPTION)
- Living and dining area opening to a balcony.
- Master bedroom with attached bathroom and a second balcony.
- Second bedroom; common bathroom.
- Kitchen with granite counter and steel sink; utility area with washing-machine point; kitchen cabinets not included (`ABC-GHR-KB-11`).
- Indicative room dimensions are in `ABC-GHR-KB-17`; they are illustrative and are not used to calculate any area.

### 3.2 Why the price is a range
The base price varies with floor, facing and unit position. The amount attributable to each factor is `NOT_PROVIDED`. The exact price of a specific unit appears only on an approved cost sheet (`ABC-GHR-KB-28`, `ABC-GHR-KB-32`).

## 4. Customer-facing explanation
"A 2BHK at GreenHaven Residences has a built-up area of about 1,180 sq.ft, with two bedrooms, two bathrooms and two balconies, and comes with one covered parking slot. The indicative base price is ₹67.5 lakh to ₹69 lakh, before additional charges and taxes. The carpet area isn't in my information, so our sales team will confirm it from the approved plan."

## 5. Important conditions
- Always label 1,180 sq.ft as **built-up** area and **approximate**.
- Always say the price is **indicative** and **excludes** additional charges and taxes.
- Never compute price per sq.ft as a quoted figure; it can mislead because the price basis and area basis are not formally linked in the records.

## 6. Exceptions
- If the customer's budget is below ₹67.5 lakh, the agent says so honestly and offers to have a sales executive discuss options; it never implies a discount (`ABC-GHR-KB-35`).
- Older materials quoting 1,150–1,290 sq.ft or ₹68–82 lakh are superseded (reconciliation items R-01, R-03).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What's the carpet area of the 2BHK?" | NOT_PROVIDED; escalate for approved plan. |
| "Is ₹65 lakh enough?" | Below the indicative range; offer a sales discussion, no promises. |
| "Price per square foot?" | Not quoted; give the range and cost-sheet process. |
| "How many 2BHKs are left?" | Live inventory; sales follow-up. |

## 8. What the AI agent can confidently answer
Configuration, built-up area, indicative price range, bathrooms, balconies, parking, towers.

## 9. What the AI must not claim
Carpet area, final price, price per sq.ft, availability, discounts, possession date.

## 10. Escalation
Carpet area or unit-specific questions → **sales executive** (`ESC-08`); final cost → `ESC-05`; negotiation → `ESC-04`.

Related documents: `ABC-GHR-KB-16`, `ABC-GHR-KB-17`, `ABC-GHR-KB-18`, `ABC-GHR-KB-28`.

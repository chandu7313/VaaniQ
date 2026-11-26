---
doc_id: ABC-GHR-KB-16
tenant_slug: abc-developers
document_title: "3BHK Detailed Specifications"
category: apartments
subcategory: 3bhk
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
# 3BHK Detailed Specifications

> **FICTIONAL DEMONSTRATION DATA.** The built-up area (approximately 1,560 sq.ft) and the indicative base-price range (₹89,50,000 – ₹92,00,000) are CANONICAL. Room details are `SYNTHETIC_DEMO_ASSUMPTION`. **Carpet area is `NOT_PROVIDED`** and must not be derived from the built-up area.

## 1. Purpose
The complete reference for the 3BHK apartment: contents, area basis, price basis and unknowns. Values are mastered in `config/project_catalog.json` and `config/pricing_catalog.json`.

## 2. Business context
3BHK buyers are typically growing families or upgraders, often with budgets around ₹85 lakh to ₹1 crore and a home loan. The assessment scenario customer ("3BHK in Gachibowli, around ₹90 lakh, buying within a month") is this segment.

## 3. Apartment details
| Attribute | Value | Status |
|---|---|---|
| Configuration | 3BHK (3 bedrooms, hall, kitchen) | CANONICAL |
| Built-up area | approximately 1,560 sq.ft | CANONICAL |
| Carpet area | — | NOT_PROVIDED |
| Super built-up / saleable area | — | NOT_PROVIDED |
| Bathrooms | 3 | SYNTHETIC_DEMO_ASSUMPTION |
| Balconies | 3 | SYNTHETIC_DEMO_ASSUMPTION |
| Pooja niche | Yes | SYNTHETIC_DEMO_ASSUMPTION |
| Utility area | Yes, attached to kitchen | SYNTHETIC_DEMO_ASSUMPTION |
| Covered parking | 2 slots | SYNTHETIC_DEMO_ASSUMPTION |
| Master bedroom flooring | Laminated wooden flooring | SYNTHETIC_DEMO_ASSUMPTION |
| EV-charger provision | At each parking slot | SYNTHETIC_DEMO_ASSUMPTION |
| Indicative base price | ₹89,50,000 – ₹92,00,000 | CANONICAL |
| Towers / units per tower | Tower A and Tower B / 66 each | CANONICAL / SYNTHETIC_DEMO_ASSUMPTION |
| Sanctioned electrical load | 7 kW; 2 kW power backup | SYNTHETIC_DEMO_ASSUMPTION |
| Current availability | — | Live inventory only |

### 3.1 Inside the apartment (SYNTHETIC_DEMO_ASSUMPTION)
- Living and dining area with balcony access.
- Master bedroom with attached bathroom, wooden-laminate floor and balcony.
- Two further bedrooms, one with an attached bathroom; one common bathroom.
- Kitchen with granite counter, steel sink and utility area; cabinets not included.
- Pooja niche in the living area.

## 4. Customer-facing explanation
"A 3BHK has a built-up area of about 1,560 sq.ft: three bedrooms, three bathrooms, three balconies and two covered parking slots. The indicative base price is ₹89.5 lakh to ₹92 lakh, before additional charges and taxes. For a budget of around ₹90 lakh, that falls within the indicative range, though the final price depends on the unit and is confirmed on a cost sheet."

## 5. Important conditions
- Label the area as **approximate built-up** area; never call it carpet area.
- A budget at the bottom of the range may still fall short once the unit, additional charges and taxes are known; the agent says this plainly.

## 6. Exceptions
- Budgets below ₹89.5 lakh: honest explanation and sales follow-up; never imply a discount.
- Seed materials quoting 1,620–1,840 sq.ft or ₹88–115 lakh are superseded (reconciliation items R-02, R-04).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Does ₹90 lakh fit a 3BHK?" | Within the indicative ₹89.5–92 lakh base range; final cost on cost sheet. |
| "Carpet area?" | NOT_PROVIDED. |
| "Two car parks?" | Yes, two covered slots (synthetic). |
| "Is a 3BHK on a high floor left?" | Live inventory; sales follow-up. |

## 8. What the AI agent can confidently answer
Configuration, built-up area, indicative range, rooms, parking, flooring, towers.

## 9. What the AI must not claim
Carpet area, final price, availability, discounts, view guarantees, possession date.

## 10. Escalation
Same routes as `ABC-GHR-KB-15`: unit questions `ESC-08`, final cost `ESC-05`, negotiation `ESC-04`.

Related documents: `ABC-GHR-KB-15`, `ABC-GHR-KB-17`, `ABC-GHR-KB-18`, `ABC-GHR-KB-29`.

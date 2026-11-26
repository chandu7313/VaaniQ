---
doc_id: ABC-GHR-KB-56
tenant_slug: abc-developers
document_title: "Apartment Configuration FAQ"
category: customer_support
subcategory: faq_configuration
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
# Apartment Configuration FAQ

> **FICTIONAL DEMONSTRATION DATA.** Built-up areas (2BHK ≈1,180 sq.ft; 3BHK ≈1,560 sq.ft) are CANONICAL. Room counts, balconies and parking are `SYNTHETIC_DEMO_ASSUMPTION`. Carpet area is `NOT_PROVIDED`.

## 1. Purpose
Answers questions about the layout and contents of each apartment type, and about choices such as tower, floor and facing.

## 2. Business context
After price, customers ask what they get: rooms, balconies, floors and views. Clear, consistent answers prevent disappointment at the site visit.

## 3. Questions and answers
| Question | Answer |
|---|---|
| Do you have 1BHK or 4BHK? | No; only 2BHK and 3BHK. |
| How many bathrooms in a 2BHK? | 2. |
| How many bathrooms in a 3BHK? | 3. |
| How many balconies? | 2 in a 2BHK, 3 in a 3BHK. |
| Is there a utility area? | Yes, attached to the kitchen. |
| Is there a pooja room? | A pooja niche in the 3BHK living area. |
| How many floors per tower? | 18 (synthetic plan figure). |
| How many towers? | Two: Tower A and Tower B. |
| How many apartments in total? | 264 as planned (synthetic): 66 2BHK and 66 3BHK per tower. |
| Can I choose a high floor or east facing? | Depends on live inventory; the sales team confirms what is available. |
| Is the 3BHK master bedroom big? | Indicatively about 13 × 14 ft; approved plan confirms. |
| Is it semi-furnished? | No; kitchen cabinets, wardrobes and appliances are not included. |
| What flooring? | Vitrified tiles; laminated wooden flooring in the 3BHK master bedroom. |
| Are there corner units? | REQUIRES_HUMAN_CONFIRMATION. |

## 4. Customer-facing explanation
"A 2BHK has two bedrooms, two bathrooms and two balconies in about 1,180 sq.ft built-up; a 3BHK has three of each, plus a pooja niche, in about 1,560 sq.ft built-up. Floor and facing depend on what's available, which our sales team checks live."

## 5. Important conditions
- Built-up area only; never carpet area.
- Never confirm a specific unit, floor or facing is available.

## 6. Exceptions
- Room sizes are indicative (`ABC-GHR-KB-17`).

## 7. Common customer questions
The table above.

## 8. What the AI agent can confidently answer
Configurations, rooms, balconies, towers, floors, flooring.

## 9. What the AI must not claim
Carpet area, availability, views, corner units.

## 10. Escalation
Unit-specific questions → `ESC-08`.

Related documents: `ABC-GHR-KB-11`, `ABC-GHR-KB-15`, `ABC-GHR-KB-16`, `ABC-GHR-KB-17`.

---
doc_id: ABC-GHR-KB-53
tenant_slug: abc-developers
document_title: "Master FAQ"
category: customer_support
subcategory: faq_master
version: 1.0.0
status: active_demo
authority_level: 3
data_classification: public
retrieval_scope: customer_facing
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: false
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: 
  - "seed:GreenHaven Residences - Frequently Asked Questions"
source_of_truth: "config/*.json (FAQ answers restate structured records)"
approval_status: PENDING_REVIEW
---
# Master FAQ

> **FICTIONAL DEMONSTRATION DATA.** Short answers to the most frequent questions, each pointing to the authoritative document. Where an answer is unknown, it says so. Topic-specific FAQs (`ABC-GHR-KB-54` to `ABC-GHR-KB-59`) go deeper.

## 1. Purpose
Gives retrieval one compact, high-precision source for the twenty questions customers ask most, with consistent wording across channels.

## 2. Business context
Most enquiries repeat the same questions. A master FAQ keeps answers short and consistent, and its pointers lead to fuller explanations.

## 3. Frequently asked questions
| # | Question | Answer | Source |
|---|---|---|---|
| 1 | What is GreenHaven Residences? | A gated residential community by ABC Developers in Gachibowli, Hyderabad, with 2BHK and 3BHK apartments in Tower A and Tower B (fictional). | KB-07 |
| 2 | What configurations are available? | 2BHK and 3BHK. | KB-15, KB-16 |
| 3 | How big is a 2BHK? | About 1,180 sq.ft built-up. | KB-15 |
| 4 | How big is a 3BHK? | About 1,560 sq.ft built-up. | KB-16 |
| 5 | What is the carpet area? | Not provided; the approved plan and agreement state it. | KB-18 |
| 6 | What is the 2BHK price? | Indicative base price ₹67.5 lakh – ₹69 lakh, before charges and taxes. | KB-28 |
| 7 | What is the 3BHK price? | Indicative base price ₹89.5 lakh – ₹92 lakh, before charges and taxes. | KB-29 |
| 8 | What is the final all-inclusive price? | Only on an approved cost sheet from the sales team. | KB-32 |
| 9 | Where exactly is it? | Gachibowli, Hyderabad; exact distances to landmarks are not provided. | KB-08 |
| 10 | What amenities are there? | Planned clubhouse (about 25,000 sq.ft), pool, gym, yoga deck, badminton, jogging track, gardens, children's play area, senior citizens' park. | KB-21 – KB-25 |
| 11 | What is the RERA number? | Not provided; legal and compliance team will share registration details. | KB-38 |
| 12 | When is possession? | Not provided; confirmed only in writing by the project team. | KB-67 |
| 13 | Are there any offers or discounts? | No offer is configured; the AI cannot negotiate. | KB-35, KB-36 |
| 14 | Which banks give loans? | Partner-bank information is not provided; any lender may be approached. | KB-34 |
| 15 | What is the payment plan? | Construction-linked, ten instalments of 10%. | KB-30 |
| 16 | How do I reserve a flat? | Token ₹1 lakh holds a unit for 7 days; booking amount 10%. | KB-31 |
| 17 | When can I visit? | Monday – Saturday, 10 am – 6 pm, subject to live availability. | KB-48 |
| 18 | How many parking slots? | 1 covered for 2BHK, 2 covered for 3BHK. | KB-19 |
| 19 | How many units are available? | Read from live inventory by the sales team; not stated in documents. | KB-09 |
| 20 | What is the maintenance charge? | Not provided; shown on the cost sheet. | KB-26 |

## 4. Customer-facing explanation
Answers above are written to be spoken as they are.

## 5. Important conditions
- Keep the qualifiers ("indicative", "built-up", "planned").
- If a detailed document is more specific, prefer it.

## 6. Exceptions
- If the structured configuration changes, these answers must be regenerated.

## 7. Common customer questions
The table above is the list.

## 8. What the AI agent can confidently answer
All twenty answers as written.

## 9. What the AI must not claim
More than the answers state.

## 10. Escalation
Unknowns → `ESC-02`, `ESC-03`, `ESC-05`, `ESC-08` as per each topic.

Related documents: `ABC-GHR-KB-07`, `ABC-GHR-KB-27`, `ABC-GHR-KB-48`, `ABC-GHR-KB-54`, `ABC-GHR-KB-56`.

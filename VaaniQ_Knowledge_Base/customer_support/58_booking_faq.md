---
doc_id: ABC-GHR-KB-58
tenant_slug: abc-developers
document_title: "Booking FAQ"
category: customer_support
subcategory: faq_booking
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
# Booking FAQ

> **FICTIONAL DEMONSTRATION DATA.** Covers both **site-visit booking** (the AI can schedule with explicit consent) and **apartment booking** (handled by the sales team). Token ₹1,00,000 / 7 days and 10% booking amount are `SYNTHETIC_DEMO_ASSUMPTION`.

## 1. Purpose
Removes the ambiguity in "booking" and answers the practical questions for each meaning.

## 2. Business context
Customers say "book" for both visits and flats. Mixing them up could lead the agent to imply a unit is reserved when only a visit was scheduled.

## 3. Questions and answers
### 3.1 Site visits
| Question | Answer |
|---|---|
| Can you book a site visit for me? | Yes; I check live availability and book only after you confirm the slot. |
| What are the visit timings? | Monday – Saturday, 10 am – 6 pm, 1-hour slots. |
| How early must I book? | At least 2 hours ahead, up to 7 days ahead. |
| Can I reschedule or cancel? | Yes, through me or the sales team. |
| Can I visit on Sunday? | Not in the default schedule; a callback can be arranged. |
| What should I bring? | A photo ID. |

### 3.2 Apartments
| Question | Answer |
|---|---|
| Can you book a flat for me? | No; the sales team handles apartment bookings. I can arrange a callback or a visit. |
| How much is the token? | ₹1 lakh, holding a unit for 7 days. |
| What is the booking amount? | 10% of the agreement value, with the token adjusted. |
| Is the token refundable? | Requires confirmation from the sales team. |
| Can I pay online? | Not configured; bank transfer or cheque, no cash. |
| What documents do I need? | Identity and address proof, PAN, photographs (`ABC-GHR-KB-65`). |

## 4. Customer-facing explanation
"I can book a site visit for you once you confirm a time. Booking an apartment is done with our sales team: a ₹1 lakh token holds a unit for seven days, and the booking amount is 10%."

## 5. Important conditions
- The agent never says a unit is reserved or held.
- Visit booking needs explicit confirmation of the exact slot.

## 6. Exceptions
- Apartment-booking intent → callback (`ESC-01`); refund → `ESC-10`.

## 7. Common customer questions
The tables above.

## 8. What the AI agent can confidently answer
Visit rules and booking steps.

## 9. What the AI must not claim
Unit reservation, refund terms, online payment.

## 10. Escalation
`ESC-01`, `ESC-10`.

Related documents: `ABC-GHR-KB-31`, `ABC-GHR-KB-48`, `ABC-GHR-KB-65`.

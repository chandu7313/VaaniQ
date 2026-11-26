---
doc_id: ABC-GHR-KB-31
tenant_slug: abc-developers
document_title: "Booking and Token Amount Policy"
category: commercial
subcategory: booking_policy
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
supersedes: 
  - "seed:ABC Developers - Sales and Booking Policies"
source_of_truth: "config/pricing_catalog.json + config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Booking and Token Amount Policy

> **FICTIONAL DEMONSTRATION DATA.** Token amount ₹1,00,000, 7-day hold and 10% booking amount are carried forward from VaaniQ seed data as `SYNTHETIC_DEMO_ASSUMPTION` (`config/sales_policy.json`). Token refund terms are `REQUIRES_HUMAN_CONFIRMATION`. Unit availability is read only from live inventory.

## 1. Purpose
Explains how a customer reserves and books an apartment, from token to booking to agreement, and separates **apartment booking** (a commercial transaction handled by people) from **site-visit booking** (which the AI agent can schedule with consent).

## 2. Business context
"Booking" is ambiguous: customers use it for both a site visit and buying a flat. The AI agent may book only site visits (`ABC-GHR-KB-48`). Apartment booking involves payment, documents and an approved cost sheet, so it always involves the sales team.

## 3. Policy (SYNTHETIC_DEMO_ASSUMPTION)
| Step | Detail |
|---|---|
| 1. Unit selection | With a sales executive, using live inventory |
| 2. Cost sheet | Approved cost sheet issued for the selected unit |
| 3. Token | ₹1,00,000 blocks the unit for 7 days |
| 4. Booking amount | 10% of the agreement value, with the token adjusted against it |
| 5. Booking form and KYC | Signed application form and identity documents (`ABC-GHR-KB-65`) |
| 6. Allotment letter | Issued by the CRM team after booking (`ABC-GHR-KB-64`) |
| 7. Sale agreement | Executed as per applicable law (`ABC-GHR-KB-40`) |

| Field | Status |
|---|---|
| Token refundability if the customer withdraws within 7 days | REQUIRES_HUMAN_CONFIRMATION |
| Token extension beyond 7 days | REQUIRES_HUMAN_CONFIRMATION |
| Online token payment | NOT_CONFIGURED |

## 4. Customer-facing explanation
"To reserve a flat, you'd choose a unit with our sales executive and get a cost sheet. A token of ₹1 lakh holds the unit for seven days, and the booking amount is 10% of the agreement value, with the token adjusted against it. I can't book a flat myself, but I can schedule a site visit or a call with our sales team."

## 5. Important conditions
- The agent never takes payment, never reserves a unit and never says a unit is held.
- The agent never states token refund terms.
- Payments only by bank transfer or cheque; never cash.

## 6. Exceptions
- If a customer says "I want to book now", the agent offers a site visit or sales callback and records the intent; it does not start a payment.
- If a customer has already paid a token and wants it back → `ESC-10`.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "How much to block a flat?" | ₹1 lakh token for 7 days (synthetic). |
| "Is the token refundable?" | REQUIRES_HUMAN_CONFIRMATION. |
| "Can I book on this call?" | Site visit or sales callback; no flat booking by AI. |
| "Book a visit for Saturday 11 am" | Site-visit flow with explicit confirmation. |

## 8. What the AI agent can confidently answer
The booking steps, token amount and hold period, booking percentage.

## 9. What the AI must not claim
That a unit is reserved, refund terms, extensions, or online payment.

## 10. Escalation
Apartment-booking intent → **sales executive** (`ESC-01`); token refunds → `ESC-10`.

Related documents: `ABC-GHR-KB-30`, `ABC-GHR-KB-37`, `ABC-GHR-KB-48`, `ABC-GHR-KB-64`.

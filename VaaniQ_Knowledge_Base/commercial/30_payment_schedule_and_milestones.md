---
doc_id: ABC-GHR-KB-30
tenant_slug: abc-developers
document_title: "Payment Schedule and Milestones"
category: commercial
subcategory: payment_schedule
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
  - "seed:GreenHaven Residences - Construction-Linked Payment Schedule"
source_of_truth: "config/pricing_catalog.json + config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Payment Schedule and Milestones

> **FICTIONAL DEMONSTRATION DATA.** The construction-linked plan of ten 10% instalments is carried forward from VaaniQ seed data as `SYNTHETIC_DEMO_ASSUMPTION`. Milestone dates, the current construction stage and any alternative plans are `NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`. The signed sale agreement governs.

## 1. Purpose
Explains how payments for an apartment are planned to fall due as construction progresses, so customers and the agent understand the structure without quoting dates or amounts.

## 2. Business context
A construction-linked plan spreads payments over the build period and links them to visible progress. Customers with home loans need to know that lenders disburse against the same milestones (`ABC-GHR-KB-33`).

## 3. Construction-linked payment schedule and instalments (SYNTHETIC_DEMO_ASSUMPTION)
Payments are made in instalments (also spelled installments) linked to construction milestones.

| # | Milestone | Share of agreement value |
|---|---|---|
| 1 | Booking | 10% |
| 2 | Completion of foundation | 10% |
| 3 | Completion of 2nd slab | 10% |
| 4 | Completion of 5th slab | 10% |
| 5 | Completion of 8th slab | 10% |
| 6 | Completion of 11th slab | 10% |
| 7 | Completion of 14th slab | 10% |
| 8 | Completion of top (18th) slab | 10% |
| 9 | Completion of flooring and finishing | 10% |
| 10 | Possession | 10% |

### 3.1 How demands are raised (SYNTHETIC_DEMO_ASSUMPTION)
- When a milestone is reached, the CRM team sends a written demand letter with the amount and due date.
- Taxes applicable at the time of each payment are shown separately on the demand.
- Payment modes: bank transfer or cheque to the account named on the demand letter; no cash (`config/sales_policy.json`).

| Field | Status |
|---|---|
| Expected date of each milestone | NOT_PROVIDED |
| Current milestone reached | REQUIRES_HUMAN_CONFIRMATION (`ABC-GHR-KB-10`) |
| Interest on delayed payment | REQUIRES_HUMAN_CONFIRMATION (sale agreement) |
| Down-payment or subvention plans | NOT_CONFIGURED |

## 4. Customer-facing explanation
"Payments are construction-linked, in ten instalments of 10% each: at booking, at the foundation, at several slab stages, at finishing and at possession. You get a written demand letter at each stage, and taxes are shown separately. The exact schedule and terms are in the sale agreement."

## 5. Important conditions
- Never state when a milestone will be reached or which stage has been reached.
- Never compute instalment amounts for a specific unit; the demand letter does that.
- The sale agreement overrides this document.

## 6. Exceptions
- Requests for a different plan (for example down-payment) → sales manager; none is configured.
- NRI customers pay through permitted banking channels (`ABC-GHR-KB-65`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What's the payment plan?" | Ten 10% construction-linked instalments. |
| "How much is due at booking?" | 10% (the token is adjusted against it; `ABC-GHR-KB-31`). |
| "When is the next instalment?" | Not known; CRM team. |
| "How do installments work?" | Each instalment falls due when a milestone is reached; a demand letter states the amount. |
| "Do you have a subvention scheme?" | NOT_CONFIGURED. |

## 8. What the AI agent can confidently answer
The milestone structure, the percentage per stage and the demand-letter process.

## 9. What the AI must not claim
Dates, current stage, unit-specific amounts, penalty rates, special plans.

## 10. Escalation
Schedule disputes or stage questions → **CRM and accounts** (`ESC-10` / `ESC-03`); alternative plans → `ESC-04`.

Related documents: `ABC-GHR-KB-10`, `ABC-GHR-KB-31`, `ABC-GHR-KB-33`, `ABC-GHR-KB-40`.

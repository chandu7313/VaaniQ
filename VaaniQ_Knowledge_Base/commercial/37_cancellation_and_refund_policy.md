---
doc_id: ABC-GHR-KB-37
tenant_slug: abc-developers
document_title: "Cancellation and Refund Policy"
category: commercial
subcategory: cancellation
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
source_of_truth: "config/pricing_catalog.json + config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Cancellation and Refund Policy

> **FICTIONAL DEMONSTRATION DATA.** Cancellation charges and refund timelines are `REQUIRES_HUMAN_CONFIRMATION`. The seed's "2% cancellation charge after agreement" is not confirmed (reconciliation item R-14). **Terms follow the signed sale agreement and applicable law.**

## 1. Purpose
Explains how a cancellation request is handled and fixes the rule that the agent never states charges, refund amounts or timelines.

## 2. Business context
Cancellation is legally and financially sensitive. Under RERA, the rights and obligations of buyer and developer on cancellation are set by the registered agreement and the law; a wrong statement can harm the customer and the company.

## 3. Process (SYNTHETIC_DEMO_ASSUMPTION)
| Step | Detail |
|---|---|
| 1. Request | Customer submits a written cancellation request to the CRM team |
| 2. Acknowledgement | CRM acknowledges and records the request |
| 3. Review | CRM and accounts calculate any refund under the signed agreement |
| 4. Communication | Customer receives a written statement of the refund and any deductions |
| 5. Refund | Paid by bank transfer to the customer's account after documentation |

| Field | Status |
|---|---|
| Cancellation charge before agreement | REQUIRES_HUMAN_CONFIRMATION |
| Cancellation charge after agreement | REQUIRES_HUMAN_CONFIRMATION (seed 2% unconfirmed) |
| Token refund rules | REQUIRES_HUMAN_CONFIRMATION (`ABC-GHR-KB-31`) |
| Refund timeline | REQUIRES_HUMAN_CONFIRMATION |
| Treatment of taxes paid | REQUIRES_HUMAN_CONFIRMATION |
| Loan account closure steps | Lender-specific |

## 4. Customer-facing explanation
"I'm sorry to hear you're considering cancelling. Cancellation and refunds follow the terms in your signed agreement and the applicable law, so I can't quote charges or timelines. I'll record your request and our CRM and accounts team will contact you with the details in writing."

## 5. Important conditions
- Never state a percentage, amount or number of days.
- Never discourage or pressure a customer who wants to cancel.
- Treat as high priority; capture the request accurately.

## 6. Exceptions
- If the customer alleges a breach by the developer (delay, specification change), also route to **legal and compliance** (`ESC-02`).
- Site-visit cancellations are different: the agent can cancel a visit through the appointment tool (`ABC-GHR-KB-48`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "If I cancel, how much will I lose?" | Agreement terms; `ESC-10`. |
| "Is it 2%?" | Not confirmed; `ESC-10`. |
| "How long for the refund?" | REQUIRES_HUMAN_CONFIRMATION. |
| "Cancel my visit tomorrow" | Appointment cancellation flow. |

## 8. What the AI agent can confidently answer
The cancellation request process and who handles it.

## 9. What the AI must not claim
Charges, refund amounts, timelines, legal rights interpretation.

## 10. Escalation
All apartment cancellations and refunds → **CRM and accounts** (`ESC-10`); alleged breach → `ESC-02`; distress → `ESC-06`.

Related documents: `ABC-GHR-KB-31`, `ABC-GHR-KB-40`, `ABC-GHR-KB-41`, `ABC-GHR-KB-69`.

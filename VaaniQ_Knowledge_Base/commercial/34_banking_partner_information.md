---
doc_id: ABC-GHR-KB-34
tenant_slug: abc-developers
document_title: "Banking Partner Information"
category: commercial
subcategory: banking_partners
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
# Banking Partner Information

> **FICTIONAL DEMONSTRATION DATA.** **No banking partner, tie-up or project pre-approval is provided.** All fields in this document are `NOT_PROVIDED` or `NOT_CONFIGURED`. Earlier seed text naming three fictional lenders (Deccan Housing Bank, Charminar Finance, Godavari Home Loans) and claiming project pre-approval is superseded (reconciliation item R-12) and must never be repeated.

## 1. Purpose
Exists so that retrieval for "which banks?" finds an explicit, authoritative answer: there is no verified partner-bank information. It prevents the agent from naming lenders from memory or from superseded seed data.

## 2. Business context
Claims of bank tie-ups or pre-approval influence buying decisions and imply that lenders have checked the project's legal status. Such claims must come only from signed, verified records, which do not exist in this knowledge base.

## 3. Status of banking information
| Field | Value | Status |
|---|---|---|
| Partner banks | — | NOT_PROVIDED |
| Lenders that have approved the project | — | NOT_PROVIDED |
| Approved project finance (APF) numbers | — | NOT_PROVIDED |
| Preferential interest rates | — | NOT_CONFIGURED |
| On-site bank loan desk | — | NOT_CONFIGURED |
| Customer may use any lender | Yes, subject to that lender's own assessment | SYNTHETIC_DEMO_ASSUMPTION |

### 3.1 How this document is maintained
If ABC Developers signs a lender arrangement, the details must be entered first in a structured configuration record with the lender's written confirmation, reviewed by legal and compliance, and only then reflected here. Until then, this document's answer remains "not provided".

## 4. Customer-facing explanation
"I don't have verified information about partner banks or lender approvals for this project. You can approach the lender of your choice, and our sales team can help with the documents a bank usually asks for."

## 5. Important conditions
- Never name a bank as a partner, even a well-known one.
- Never say the project is "approved by all major banks".
- Never repeat the superseded seed lender names.

## 6. Exceptions
- If a customer says "bank X told me your project is approved", the agent notes that it cannot confirm and refers to the sales executive; it does not deny or agree.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Which banks are tied up?" | NOT_PROVIDED. |
| "Is SBI loan available?" | Customer may approach any lender; no tie-up claim. |
| "Any special interest rate?" | NOT_CONFIGURED. |

## 8. What the AI agent can confidently answer
That partner-bank information is not provided and customers can use any lender.

## 9. What the AI must not claim
Any tie-up, approval, APF number or special rate.

## 10. Escalation
Lender-specific questions → **sales executive** (`ESC-07`); claims of approval needing verification → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-33`, `ABC-GHR-KB-59`.

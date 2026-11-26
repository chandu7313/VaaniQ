---
doc_id: ABC-GHR-KB-59
tenant_slug: abc-developers
document_title: "Financing FAQ"
category: customer_support
subcategory: faq_financing
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
supersedes: []
source_of_truth: "config/*.json (FAQ answers restate structured records)"
approval_status: PENDING_REVIEW
---
# Financing FAQ

> **FICTIONAL DEMONSTRATION DATA.** Partner banks and pre-approvals are `NOT_PROVIDED`. **Loan approval is decided only by the lender.** EMI figures are illustrations only.

## 1. Purpose
Answers short financing questions consistently and points to the full process document.

## 2. Business context
Financing questions often hide anxiety about affordability. The agent can explain how loans work; it must never predict approval or recommend a lender.

## 3. Questions and answers
| Question | Answer |
|---|---|
| Can I get a home loan for this project? | You can apply to any lender; approval is the lender's decision. |
| Which banks are partners? | Not provided. |
| Is the project pre-approved by banks? | Not provided. |
| How much loan can I get? | Depends on the lender's assessment of your income and credit, within RBI loan-to-value norms. |
| What would my EMI be on ₹70 lakh? | Illustration only: about ₹60,748 a month at 8.5% for 20 years; your lender's rate decides. |
| Is stamp duty covered by the loan? | Generally not; confirm with your lender. |
| How is the loan paid to the builder? | In stages, as construction milestones are reached. |
| Do you have a no-EMI-till-possession scheme? | Not configured. |
| Can NRIs get loans? | Many lenders offer NRI loans with extra documents (`ABC-GHR-KB-65`). |
| Will my loan be approved? | Only the lender can decide. |

## 4. Customer-facing explanation
"You can take a home loan from the lender of your choice; whether it's approved and at what rate is the bank's decision. The bank pays in stages as construction progresses. Our sales team can help with the paperwork."

## 5. Important conditions
- Every EMI figure carries its assumed rate and tenure and the word "illustration".
- No financial advice.

## 6. Exceptions
- Questions about tax benefits → customer's tax adviser.

## 7. Common customer questions
The table above.

## 8. What the AI agent can confidently answer
Process, EMI illustration, stage-wise disbursement.

## 9. What the AI must not claim
Approval, partner banks, rates, tax benefits.

## 10. Escalation
`ESC-07`.

Related documents: `ABC-GHR-KB-30`, `ABC-GHR-KB-33`, `ABC-GHR-KB-34`.

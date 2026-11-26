---
doc_id: ABC-GHR-KB-33
tenant_slug: abc-developers
document_title: "Home Loan and Financing Process"
category: commercial
subcategory: financing
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
supersedes: 
  - "seed:ABC Developers - Home Loans and EMI Guide"
source_of_truth: "config/pricing_catalog.json + config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Home Loan and Financing Process

> **FICTIONAL DEMONSTRATION DATA.** This document explains the general home-loan process. Partner banks, pre-approvals, interest rates and project tie-ups are `NOT_PROVIDED` (seed claims of named partner banks are superseded, R-12). **Loan approval is decided only by the lender.**

## 1. Purpose
Explains how buyers typically finance an apartment with a home loan, what documents and steps are involved, and what the agent must never say about eligibility or approval.

## 2. Business context
Most buyers in the ₹65 lakh – ₹1 crore range use a home loan. Customers ask "will I get a loan?" and "what will my EMI be?". The agent may explain the process and the EMI formula; it may not predict approval or quote lender rates.

## 3. The general process
| Step | What happens |
|---|---|
| 1. Eligibility check | The lender assesses income, credit score, existing obligations and age |
| 2. Sanction | The lender issues a sanction letter stating the amount, rate and tenure |
| 3. Property verification | The lender evaluates the project's legal and technical documents |
| 4. Agreement and disbursement request | After the sale agreement, the buyer requests disbursement |
| 5. Stage-wise disbursement | The lender pays against construction milestones (`ABC-GHR-KB-30`) |
| 6. Own contribution | The buyer pays the portion not financed by the lender |

### 3.1 General guidance (verify with the lender)
- Indian lenders usually finance a portion of the property value, not all of it, subject to Reserve Bank of India loan-to-value norms and their own assessment; the buyer funds the rest.
- Stamp duty and registration are generally not financed by the loan.
- Tenure, rate and amount are set by the lender at sanction.

### 3.2 EMI formula
EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r the monthly interest rate and n the number of months. Illustration only (SYNTHETIC_DEMO_ASSUMPTION): a loan of ₹70 lakh at 8.5% a year for 20 years gives an EMI of about ₹60,748. Real EMIs depend on the lender's rate at sanction.

| Field | Status |
|---|---|
| Partner banks / tie-ups | NOT_PROVIDED (`ABC-GHR-KB-34`) |
| Project pre-approval by lenders | NOT_PROVIDED |
| Interest rates | Lender-specific; not quoted as fact |
| Subvention or interest-free schemes | NOT_CONFIGURED |

## 4. Customer-facing explanation
"Most buyers use a home loan. The bank checks your income and credit, issues a sanction letter, and then pays the builder in stages as construction progresses, while you pay your own contribution. Whether a loan is approved, and at what rate, is decided only by the bank. Our sales team can guide you through the paperwork."

## 5. Important conditions
- Never say a loan "will be approved", never assess eligibility, never recommend a lender.
- Present any EMI figure only as an illustration with its assumed rate and tenure.
- This is not financial advice.

## 6. Exceptions
- NRI loans have additional lender requirements (`ABC-GHR-KB-65`).
- Customers asking which bank is "best" → no recommendation; sales executive can share process help.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Will I get a loan for ₹70 lakh?" | Lender decides; `ESC-07`. |
| "Which banks have approved the project?" | NOT_PROVIDED. |
| "What would my EMI be?" | Formula + labelled illustration. |
| "How much down payment?" | Depends on the lender's sanction; general guidance only. |

## 8. What the AI agent can confidently answer
The process, the stage-wise disbursement link, the EMI formula with a labelled illustration.

## 9. What the AI must not claim
Approval, eligibility, partner banks, pre-approval, lender rates, financial advice.

## 10. Escalation
Approval or eligibility → `ESC-07`; documentation help → **sales executive**.

Related documents: `ABC-GHR-KB-30`, `ABC-GHR-KB-34`, `ABC-GHR-KB-59`, `ABC-GHR-KB-65`.

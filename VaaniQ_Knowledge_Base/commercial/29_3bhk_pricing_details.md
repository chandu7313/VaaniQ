---
doc_id: ABC-GHR-KB-29
tenant_slug: abc-developers
document_title: "3BHK Pricing Details"
category: commercial
subcategory: pricing_3bhk
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
# 3BHK Pricing Details

> **FICTIONAL DEMONSTRATION DATA.** Indicative base price **₹89,50,000 – ₹92,00,000** (CANONICAL) for a 3BHK of approximately **1,560 sq.ft built-up** (CANONICAL). Additional charges, taxes and the final amount are `NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`.

## 1. Purpose
Unit-type pricing reference for the 3BHK: base range, inclusions and exclusions, and the route to a final figure.

## 2. Business context
The primary assessment scenario is a 3BHK buyer with a budget of about ₹90 lakh. That budget sits **inside** the indicative base range, but the final payable amount will be higher once charges and taxes are added. The agent must be honest about both facts.

## 3. Pricing details
| Item | Value | Status |
|---|---|---|
| Indicative base price, lowest | ₹89,50,000 | CANONICAL |
| Indicative base price, highest | ₹92,00,000 | CANONICAL |
| Spoken form | "₹89.5 lakh to ₹92 lakh" | CANONICAL |
| Built-up area | ≈1,560 sq.ft | CANONICAL |
| Included in base price | The apartment with standard specifications | SYNTHETIC_DEMO_ASSUMPTION |
| Covered car parking (2 slots) | Charge NOT_PROVIDED | NOT_PROVIDED |
| Floor-rise / preferred-location charges | — | NOT_PROVIDED |
| Clubhouse membership, maintenance deposit, corpus | — | NOT_PROVIDED |
| GST, stamp duty, registration | As per applicable law; amounts not quoted | NOT_PROVIDED |
| Final payable amount | Approved cost sheet only | REQUIRES_HUMAN_CONFIRMATION |

### 3.1 Budget fit guidance for the agent
| Customer budget | Honest response |
|---|---|
| Below ₹89.5 lakh | Below the indicative base range; offer a sales discussion; consider 2BHK only if the customer is open to it. |
| ₹89.5 – ₹92 lakh | Within the base range; final cost with charges and taxes on the cost sheet. |
| Above ₹92 lakh | Base range fits; charges and taxes still confirmed on the cost sheet. |

## 4. Customer-facing explanation
"For a 3BHK, the indicative base price is ₹89.5 lakh to ₹92 lakh, so a budget of around ₹90 lakh is within the base range. Charges like parking and maintenance deposit, plus GST, stamp duty and registration, are additional, so the final amount will be on a cost sheet from our sales team."

## 5. Important conditions
- Never say "₹90 lakh is enough" without the charges-and-taxes qualifier.
- No totals, no per-sq.ft rate, no tax estimates.

## 6. Exceptions
- Seed and UI figures of ₹88–115 lakh are superseded (R-04); if a customer cites ₹88 lakh, give the current range and offer clarification by sales.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "I have ₹90 lakh; can I buy a 3BHK?" | Within base range; final cost by cost sheet. |
| "Price of a high-floor 3BHK?" | Within range; exact by cost sheet; floor-rise NOT_PROVIDED. |
| "What's the all-in cost?" | `ESC-05`. |

## 8. What the AI agent can confidently answer
The 3BHK range, its basis, exclusions, and budget-fit guidance.

## 9. What the AI must not claim
Final amounts, tax figures, parking charges, discounts.

## 10. Escalation
Cost sheet → `ESC-05`; negotiation → `ESC-04`; loan questions → `ABC-GHR-KB-33`.

Related documents: `ABC-GHR-KB-16`, `ABC-GHR-KB-27`, `ABC-GHR-KB-32`, `ABC-GHR-KB-33`.

---
doc_id: ABC-GHR-KB-28
tenant_slug: abc-developers
document_title: "2BHK Pricing Details"
category: commercial
subcategory: pricing_2bhk
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
# 2BHK Pricing Details

> **FICTIONAL DEMONSTRATION DATA.** Indicative base price **₹67,50,000 – ₹69,00,000** (CANONICAL) for a 2BHK of approximately **1,180 sq.ft built-up** (CANONICAL). Additional charges, taxes and the final amount are `NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`.

## 1. Purpose
Unit-type pricing reference for the 2BHK: the base range, what it includes and excludes, and how a customer moves from the range to a final figure.

## 2. Business context
2BHK buyers are price-sensitive and often compare several projects at ₹65–75 lakh. The range is narrow (₹1.5 lakh between lowest and highest), which helps clear communication.

## 3. Pricing details
| Item | Value | Status |
|---|---|---|
| Indicative base price, lowest | ₹67,50,000 | CANONICAL |
| Indicative base price, highest | ₹69,00,000 | CANONICAL |
| Spoken form | "₹67.5 lakh to ₹69 lakh" | CANONICAL |
| Built-up area | ≈1,180 sq.ft | CANONICAL |
| Included in base price | The apartment with standard specifications (`ABC-GHR-KB-11`) | SYNTHETIC_DEMO_ASSUMPTION |
| Covered car parking (1 slot) | Charge NOT_PROVIDED | NOT_PROVIDED |
| Floor-rise / preferred-location charges | — | NOT_PROVIDED |
| Clubhouse membership, maintenance deposit, corpus | — | NOT_PROVIDED |
| GST, stamp duty, registration | As per applicable law; amounts not quoted | NOT_PROVIDED |
| Final payable amount | Approved cost sheet only | REQUIRES_HUMAN_CONFIRMATION |

### 3.1 From range to final price
1. Customer shortlists a unit with the sales executive (live inventory).
2. The sales executive generates an approved cost sheet for that unit.
3. The cost sheet itemises base price, charges and applicable taxes.
4. Booking proceeds only on the cost sheet's figures (`ABC-GHR-KB-31`).

## 4. Customer-facing explanation
"A 2BHK has an indicative base price of ₹67.5 lakh to ₹69 lakh for about 1,180 sq.ft built-up. Charges such as parking and maintenance deposit, and taxes like GST, stamp duty and registration, are additional. Once you choose a unit, our sales team gives you a cost sheet with the exact amount."

## 5. Important conditions
- Always state the range together with "base price" and "additional charges and taxes extra".
- Never add up a "total cost" for the customer.

## 6. Exceptions
- **Budget ₹65 lakh:** below the indicative range; say so honestly; offer a sales discussion; never hint at a discount.
- **Budget ₹70–75 lakh:** within reach of the base range, but the final amount with charges and taxes is unknown until the cost sheet.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Cheapest 2BHK?" | Lowest indicative base price ₹67.5 lakh; unit availability live. |
| "Is GST included?" | No; taxes extra as per law. |
| "Can I get it for ₹65 lakh?" | Below range; no discount promise; `ESC-04`. |

## 8. What the AI agent can confidently answer
The 2BHK range, its basis, and what is excluded.

## 9. What the AI must not claim
Final prices, totals, tax amounts, parking charges, discounts.

## 10. Escalation
Cost sheet → `ESC-05`; negotiation → `ESC-04`.

Related documents: `ABC-GHR-KB-15`, `ABC-GHR-KB-27`, `ABC-GHR-KB-32`.

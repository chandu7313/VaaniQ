---
doc_id: ABC-GHR-KB-55
tenant_slug: abc-developers
document_title: "Pricing FAQ"
category: customer_support
subcategory: faq_pricing
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
# Pricing FAQ

> **FICTIONAL DEMONSTRATION DATA.** Indicative base prices are CANONICAL: **2BHK ₹67,50,000 – ₹69,00,000; 3BHK ₹89,50,000 – ₹92,00,000**. Charges, taxes and final amounts are `NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`. `config/pricing_catalog.json` is authoritative.

## 1. Purpose
Answers the many ways customers ask about price, so retrieval finds a qualified answer for each paraphrase.

## 2. Business context
Price questions come in many forms: "rate", "cost", "how much", "budget", "lakh", "crore". Each needs the same qualified answer.

## 3. Questions and answers
| Question | Answer |
|---|---|
| How much is a 2BHK? | Indicative base price ₹67.5 lakh to ₹69 lakh. |
| How much is a 3BHK? | Indicative base price ₹89.5 lakh to ₹92 lakh. |
| What's the starting price? | ₹67.5 lakh (2BHK, indicative base price). |
| Is anything under ₹60 lakh? | No; the lowest indicative base price is ₹67.5 lakh. |
| Is there anything near ₹1 crore? | The highest indicative base price is ₹92 lakh (3BHK); final cost on the cost sheet. |
| Why is it a range? | Floor, facing and unit position affect price. |
| What's the rate per square foot? | Not quoted. |
| Does the price include GST? | No; taxes are extra as per law. |
| Does it include parking? | Parking charge not provided; cost sheet shows it. |
| What else do I pay apart from the flat price? | Charges such as parking, maintenance deposit and clubhouse membership, plus GST, stamp duty and registration; amounts on the cost sheet. |
| What's the total cost? | Only an approved cost sheet states it. |
| Can you reduce the price? | The AI cannot negotiate; sales-manager callback. |
| Will the price increase? | No forecast. |

## 4. Customer-facing explanation
"The indicative base price is ₹67.5 lakh to ₹69 lakh for a 2BHK and ₹89.5 lakh to ₹92 lakh for a 3BHK, before additional charges and taxes. Our sales team gives the exact figure on a cost sheet."

## 5. Important conditions
- Always include "indicative", "base price" and "charges and taxes extra".
- Never compute totals or rates.

## 6. Exceptions
- Older quoted figures (₹68–82 lakh, ₹88–115 lakh) are superseded.

## 7. Common customer questions
The table above.

## 8. What the AI agent can confidently answer
The ranges with qualifiers.

## 9. What the AI must not claim
Totals, rates, taxes, discounts, forecasts.

## 10. Escalation
`ESC-05` (cost sheet), `ESC-04` (negotiation).

Related documents: `ABC-GHR-KB-27`, `ABC-GHR-KB-28`, `ABC-GHR-KB-29`, `ABC-GHR-KB-32`.

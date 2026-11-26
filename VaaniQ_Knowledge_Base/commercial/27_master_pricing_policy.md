---
doc_id: ABC-GHR-KB-27
tenant_slug: abc-developers
document_title: "Master Pricing Policy"
category: commercial
subcategory: pricing_policy
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
  - "seed:GreenHaven Residences - Pricing and Payment Plans"
source_of_truth: "config/pricing_catalog.json + config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Master Pricing Policy

> **FICTIONAL DEMONSTRATION DATA.** The indicative base-price ranges are CANONICAL: **2BHK ₹67,50,000 – ₹69,00,000** and **3BHK ₹89,50,000 – ₹92,00,000**. All additional charges, taxes and the final payable amount are `NOT_PROVIDED` or `REQUIRES_HUMAN_CONFIRMATION`. Values are mastered in `config/pricing_catalog.json`, which overrides this text.

## 1. Purpose
Sets the rules for how prices at GreenHaven Residences are communicated by every channel, including the AI agent: which figures may be quoted, how they must be qualified, and who issues a final price.

## 2. Business context
Price is the most asked and most sensitive topic. Earlier materials and the live demo catalog used wider ranges (₹68–82 lakh for 2BHK, ₹88–115 lakh for 3BHK); those are superseded (reconciliation items R-03, R-04). One consistent, qualified price message protects customers and the company.

## 3. Pricing rules
### 3.1 The only prices that may be quoted
| Configuration | Indicative base price | Basis |
|---|---|---|
| 2BHK (≈1,180 sq.ft built-up) | ₹67,50,000 – ₹69,00,000 | Base price before additional charges and taxes |
| 3BHK (≈1,560 sq.ft built-up) | ₹89,50,000 – ₹92,00,000 | Base price before additional charges and taxes |

### 3.2 Mandatory qualifiers
Every price statement must include three ideas, in plain words:
1. **Indicative** — the range is a guide, not an offer.
2. **Base price** — excludes additional charges and taxes.
3. **Final price by cost sheet** — only an approved cost sheet from the sales team states the payable amount for a specific unit.

### 3.3 Why prices vary within a range
Floor, facing and unit position affect the base price (SYNTHETIC_DEMO_ASSUMPTION). The amount for each factor, including any floor-rise or preferred-location charge, is `NOT_PROVIDED`.

### 3.4 Price authority
| Who | Authority |
|---|---|
| AI agent | Quote the indicative ranges with qualifiers only |
| Sales executive | Issue an approved cost sheet generated from the pricing system |
| Sales manager | Approve exceptions in writing (`ABC-GHR-KB-35`) |
| Head of Sales | Set and revise price lists |

## 4. Customer-facing explanation
"The indicative base price is ₹67.5 lakh to ₹69 lakh for a 2BHK and ₹89.5 lakh to ₹92 lakh for a 3BHK. These are base prices; additional charges and taxes are extra. The exact price depends on the unit's floor and facing, and our sales team will give you an approved cost sheet for any unit you like."

## 5. Important conditions
- No price per sq.ft is published or quoted.
- No arithmetic on prices: no totals with taxes, no EMI on the final amount, no discounts.
- If the structured pricing catalog changes, the catalog wins and this document must be revised.
- Prices are indicative as of the document's effective date; price validity is `REQUIRES_HUMAN_CONFIRMATION`.

## 6. Exceptions
- A customer quoting an older price ("your brochure said ₹68 lakh") is told the current indicative range and that the sales team will clarify; never argue, never honour or reject the old figure.
- Bulk or investor purchases: route to the sales manager (`ESC-04`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What's the price of a 3BHK?" | ₹89.5–92 lakh indicative base price + qualifiers. |
| "All-inclusive price?" | Final payable needs a cost sheet (`ESC-05`). |
| "Will prices go up?" | Not known; no speculation. |
| "Rate per square foot?" | Not quoted. |

## 8. What the AI agent can confidently answer
The two indicative base-price ranges with qualifiers, and the cost-sheet process.

## 9. What the AI must not claim
Final prices, all-inclusive figures, per-sq.ft rates, discounts, future price changes, price validity.

## 10. Escalation
Final cost → `ESC-05`; negotiation → `ESC-04`; price disputes → **sales manager**.

Related documents: `ABC-GHR-KB-28`, `ABC-GHR-KB-29`, `ABC-GHR-KB-32`, `ABC-GHR-KB-35`, `ABC-GHR-KB-55`.

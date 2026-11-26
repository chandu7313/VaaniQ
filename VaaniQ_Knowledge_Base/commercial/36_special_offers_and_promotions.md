---
doc_id: ABC-GHR-KB-36
tenant_slug: abc-developers
document_title: "Special Offers and Promotions"
category: commercial
subcategory: offers
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
# Special Offers and Promotions

> **FICTIONAL DEMONSTRATION DATA.** **No offer or promotion is currently configured** (`config/sales_policy.json` → `active_offers`: `NOT_CONFIGURED`). The seed's ₹2 lakh festive discount is superseded (R-10) and must not be quoted.

## 1. Purpose
Gives retrieval an authoritative answer to "any offers?" and defines how an offer must be configured before the agent may mention it.

## 2. Business context
Offers are time-bound and conditional. Quoting an expired or invented offer is a common source of complaints. Offers therefore live in structured configuration with start and end dates, not in static prose.

## 3. Offer status and governance
| Field | Status |
|---|---|
| Active offers | NOT_CONFIGURED |
| Festive schemes | NOT_CONFIGURED |
| Referral rewards | NOT_CONFIGURED |
| Early-bird pricing | NOT_CONFIGURED |
| Payment-plan offers (for example subvention) | NOT_CONFIGURED |

### 3.1 Requirements before any offer may be communicated (SYNTHETIC_DEMO_ASSUMPTION)
1. Approved in writing by the Head of Sales.
2. Entered in structured configuration with: offer ID, description, eligibility, start date, end date, applicable configurations, and terms.
3. Reviewed by legal and compliance for wording.
4. Only then may this document reference it, and the agent must state the end date and "subject to terms".

## 4. Customer-facing explanation
"There's no special offer configured at the moment. If one becomes available, our sales team will share the details and terms. I can arrange a call with them if you'd like."

## 5. Important conditions
- Absence of an offer is stated plainly; never imply one is coming.
- Never frame the indicative range as a "special price".

## 6. Exceptions
- If a customer mentions an offer seen in an advertisement, the agent says it cannot verify it and routes to the sales executive.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Any Diwali offer?" | None configured. |
| "Do you give referral bonuses?" | NOT_CONFIGURED. |
| "Is ₹2 lakh off still valid?" | No offer configured; sales can clarify. |

## 8. What the AI agent can confidently answer
That no offer is configured and how offers are governed.

## 9. What the AI must not claim
Any offer, scheme, reward or future promotion.

## 10. Escalation
Offer verification → **sales executive** (`ESC-08`); negotiation → `ESC-04`.

Related documents: `ABC-GHR-KB-27`, `ABC-GHR-KB-35`.

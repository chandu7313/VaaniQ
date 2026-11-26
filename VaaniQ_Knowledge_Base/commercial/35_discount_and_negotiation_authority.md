---
doc_id: ABC-GHR-KB-35
tenant_slug: abc-developers
document_title: "Discount and Negotiation Authority"
category: commercial
subcategory: discount_authority
version: 1.0.0
status: active_demo
authority_level: 2
data_classification: internal
retrieval_scope: agent_internal
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
# Discount and Negotiation Authority

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** The authority structure is `SYNTHETIC_DEMO_ASSUMPTION` mirrored from `config/sales_policy.json` (`discount_authority`). **No discount is configured or approved.** The AI agent has **no** discount or negotiation authority.

## 1. Purpose
Defines who may negotiate price or approve a concession, and fixes the rule that the AI agent never offers, promises, hints at or estimates a discount.

## 2. Business context
Customers routinely ask for "the best price". An unauthorised hint ("we can probably do something") creates an expectation the company may not meet and can amount to a commitment. Seed content offered a ₹2 lakh festive discount; that offer is superseded (reconciliation item R-10).

## 3. Authority matrix (SYNTHETIC_DEMO_ASSUMPTION)
| Role | Authority |
|---|---|
| AI agent | None. Explain the process and offer a sales-manager callback. |
| Sales executive | None. Records the request and the customer's reasons. |
| Sales manager | Case-by-case concession with written approval, within limits set by the Head of Sales. |
| Head of Sales | Final authority over price lists, concessions and offers. |

### 3.1 Negotiation request handling
1. The agent acknowledges the request politely and states it cannot negotiate.
2. The agent offers a callback from the sales manager (`ESC-04`) and, with consent, records budget and reasons in the CRM.
3. The sales manager responds within the escalation target.
4. Any concession is valid only if written on an approved cost sheet.

| Field | Status |
|---|---|
| Concession limits per role | NOT_PROVIDED |
| Current approved concessions | NOT_CONFIGURED |

## 4. Customer-facing explanation
"I'm not able to negotiate prices or offer discounts. I can arrange for our sales manager to call you and discuss your requirements; any price they confirm will be on an approved cost sheet."

## 5. Important conditions
- Forbidden phrases: "I'll get you a discount", "there's room to negotiate", "prices are flexible", "I can try for ₹X off".
- Never compare the customer's budget gap with a possible concession.
- Lead scoring is not affected by discount requests beyond normal intent signals (`ABC-GHR-KB-45`).

## 6. Exceptions
- If a customer cites a competitor's lower price, the agent does not disparage the competitor and still routes to `ESC-04`.
- Repeated aggressive negotiation with negative sentiment → also consider `ESC-06`.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What's your best price?" | Indicative range + no negotiation + manager callback. |
| "Give me ₹2 lakh off and I'll book today." | No authority; `ESC-04`. |
| "Is there a festive discount?" | No offer configured (`ABC-GHR-KB-36`). |

## 8. What the AI agent can confidently answer
That it cannot negotiate, who can, and how to request a callback.

## 9. What the AI must not claim
Any discount, likelihood of a discount, or negotiable margin.

## 10. Escalation
All negotiation → **sales manager** (`ESC-04`).

Related documents: `ABC-GHR-KB-27`, `ABC-GHR-KB-36`, `ABC-GHR-KB-49`, `ABC-GHR-KB-60`.

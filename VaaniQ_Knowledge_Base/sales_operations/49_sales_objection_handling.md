---
doc_id: ABC-GHR-KB-49
tenant_slug: abc-developers
document_title: "Sales Objection Handling"
category: sales_operations
subcategory: objections
version: 1.0.0
status: active_demo
authority_level: 4
data_classification: internal
retrieval_scope: agent_internal
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: false
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "config/sales_policy.json + config/escalation_matrix.json"
approval_status: PENDING_REVIEW
---
# Sales Objection Handling

> **FICTIONAL DEMONSTRATION DATA — INTERNAL GUIDANCE (authority level 4).** These are recommended response patterns. They never override facts or policies in authority-level 1–3 sources. Every factual claim must come from the referenced documents.

## 1. Purpose
Gives the agent and sales team honest, consistent ways to respond to the most common objections, without pressure tactics or invented facts.

## 2. Business context
Objections are information: they reveal what matters to the customer. Good handling acknowledges the concern, provides verified facts, and offers a next step. Bad handling argues, exaggerates or promises.

## 3. Objection patterns
| Objection | Acknowledge | Verified facts to use | Next step |
|---|---|---|---|
| "Too expensive" | "I understand budget matters." | Indicative ranges; what the base price includes (`ABC-GHR-KB-27`) | Sales-manager callback (`ESC-04`); never hint at discount |
| "Is the builder reliable?" | "That's a fair question." | Company profile as stated (`ABC-GHR-KB-01`, synthetic history) | Site visit; documents via sales |
| "Possession will be delayed" | "Timelines matter a lot." | Possession date NOT_PROVIDED; confirmed only in writing | `ESC-03` |
| "Is it legal / RERA?" | "Important to check." | Registration NOT_PROVIDED; verify on RERA portal | `ESC-02` |
| "Traffic in Gachibowli" | "Commute is a real concern." | Location strengths without distances (`ABC-GHR-KB-08`) | Suggest visiting at commute hours |
| "Carpet area is small" | "Usable space matters." | Built-up only; carpet NOT_PROVIDED | Approved plan via sales |
| "I'll wait for prices to drop" | "Timing is your choice." | No price forecast | Offer to keep them updated (consent) |
| "Competitor is cheaper" | "Comparing is sensible." | Own facts only; never disparage | `ESC-04` |

### 3.1 Principles
1. Acknowledge before answering.
2. Use only verified facts; say "I don't know" when needed.
3. Never create false urgency or scarcity.
4. Always offer a concrete, optional next step.

## 4. Customer-facing explanation
Applied through the patterns above.

## 5. Important conditions
- No competitor comparisons on price, quality or reputation.
- No claims about appreciation, rental yield or investment returns.

## 6. Exceptions
- Strong negative sentiment → prioritise empathy and `ESC-06` over persuasion.

## 7. Common questions
See the table in section 3.

## 8. What the AI agent can confidently answer
Responses built from referenced documents.

## 9. What the AI must not claim
Investment returns, price forecasts, competitor facts, scarcity not in live inventory.

## 10. Escalation
Per pattern: `ESC-02`, `ESC-03`, `ESC-04`, `ESC-06`.

Related documents: `ABC-GHR-KB-35`, `ABC-GHR-KB-51`, `ABC-GHR-KB-60`.

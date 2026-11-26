---
doc_id: ABC-GHR-KB-69
tenant_slug: abc-developers
document_title: "Customer Complaint Resolution"
category: post_sales
subcategory: complaints
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
source_of_truth: "config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Customer Complaint Resolution

> **FICTIONAL DEMONSTRATION DATA.** The complaint process is `SYNTHETIC_DEMO_ASSUMPTION`, `PENDING_REVIEW`. Routing mirrors `config/escalation_matrix.json` (`ESC-06`). Named contacts are `NOT_CONFIGURED`.

## 1. Purpose
Defines how complaints from prospects and buyers are received, acknowledged, investigated and closed, and how the agent responds when a customer is unhappy.

## 2. Business context
Complaints handled well can restore trust; complaints ignored become public reviews or legal disputes. VaaniQ detects negative sentiment from text and escalates; people resolve.

## 3. Process (SYNTHETIC_DEMO_ASSUMPTION)
| Stage | Target | Owner |
|---|---|---|
| 1. Receive and log | Immediate | VaaniQ / any staff |
| 2. Acknowledge with reference | Within 4 business hours | Customer-care lead |
| 3. Investigate | Depends on category | Responsible team |
| 4. Respond with resolution or plan | Within 5 business days | Customer-care lead |
| 5. Close with customer agreement | — | Customer-care lead |
| 6. Escalate unresolved | After 10 business days | Head of CRM |

### 3.1 Categories
Sales conduct, missed callbacks, pricing or cost-sheet disputes, documentation, construction quality, handover, maintenance, data privacy.

### 3.2 Agent response pattern
1. Acknowledge feelings: "I'm sorry about this experience."
2. Do not argue, blame or defend.
3. Log the complaint verbatim (with consent for contact).
4. State the next step and the acknowledgement target as an aim.
5. If legal, privacy or refund issues are present, add the relevant escalation.

### 3.3 External avenues (general)
Customers may approach consumer forums or the RERA authority where applicable; the agent mentions this only if asked and does not advise.

## 4. Customer-facing explanation
"I'm sorry this happened. I've recorded your complaint, and our customer-care lead aims to contact you within four business hours with a reference number. What's the best way to reach you?"

## 5. Important conditions
- Never promise compensation or a particular outcome.
- Never discourage a customer from external avenues.

## 6. Exceptions
- Threats or abusive language: the agent stays polite, may end the conversation, and logs it.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "I want to complain." | Log; ESC-06. |
| "Will I get compensation?" | No promise; ESC-06/ESC-02. |
| "Where else can I complain?" | General avenues if asked. |

## 8. What the AI agent can confidently answer
The complaint process and targets as aims.

## 9. What the AI must not claim
Outcomes, compensation, blame.

## 10. Escalation
`ESC-06`; plus `ESC-02` (legal), `ESC-09` (privacy), `ESC-10` (refund).

Related documents: `ABC-GHR-KB-05`, `ABC-GHR-KB-50`, `ABC-GHR-KB-68`.

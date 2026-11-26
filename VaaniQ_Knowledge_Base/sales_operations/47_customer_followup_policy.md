---
doc_id: ABC-GHR-KB-47
tenant_slug: abc-developers
document_title: "Customer Follow-up Policy"
category: sales_operations
subcategory: followup
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
source_of_truth: "config/sales_policy.json + config/escalation_matrix.json"
approval_status: PENDING_REVIEW
---
# Customer Follow-up Policy

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** Follow-up cadence and limits are `SYNTHETIC_DEMO_ASSUMPTION`, `PENDING_REVIEW`. Contact only with consent; opt-outs are honoured immediately.

## 1. Purpose
Defines when and how often the sales team follows up with leads, through which channels, and when to stop.

## 2. Business context
Timely follow-up converts interest into visits; excessive follow-up annoys customers and breaches consent. A clear cadence balances both and respects privacy law (`ABC-GHR-KB-42`).

## 3. Policy (SYNTHETIC_DEMO_ASSUMPTION)
### 3.1 Cadence by temperature
| Temperature | First follow-up | Subsequent | Maximum attempts without response |
|---|---|---|---|
| Hot (≥ 75) | Within 1 business hour | Day 2, day 4 | 4 |
| Warm (50–74) | Within 1 business day | Day 3, day 7, day 14 | 4 |
| Cold (< 50) | Within 3 business days | Monthly update | 3 |
| Nurture | Monthly project update | Monthly | Until opt-out |

### 3.2 Channels
- Phone call during 10:00 – 19:00 IST, Monday to Saturday.
- WhatsApp / SMS only if the customer consented to that channel (integration `NOT_CONFIGURED` in VaaniQ).
- Email for documents and summaries.

### 3.3 Each follow-up must
1. Start from the VaaniQ call summary and lead record — never ask the customer to repeat captured facts.
2. Address the open questions recorded in the summary (for example carpet area, cost sheet).
3. Update the CRM status and next action.

### 3.4 Stop rules
- Customer says "not interested", "stop calling" or asks for deletion → stop and record (`ESC-09` for deletion).
- Maximum attempts reached → mark `lost` with reason "unreachable".

## 4. Customer-facing explanation
"Our sales executive will call you back at a time that suits you. If you'd prefer not to be contacted, just say so and we'll stop."

## 5. Important conditions
- No follow-up without consent to be contacted.
- No pressure tactics or false urgency ("only one unit left" unless live inventory confirms it).

## 6. Exceptions
- Customers who request a specific callback time override the cadence.
- Complaint cases follow `ABC-GHR-KB-69`, not sales cadence.

## 7. Common questions
| Question | Answer |
|---|---|
| "When will I hear back?" | Per escalation target for the request type. |
| "Stop calling me." | Record opt-out immediately. |

## 8. What the AI agent can confidently answer
That a callback will be arranged and opt-out is honoured.

## 9. What the AI must not claim
Specific executive names or exact callback times not recorded.

## 10. Escalation
Opt-out or deletion → `ESC-09`; missed follow-up complaints → `ESC-06`.

Related documents: `ABC-GHR-KB-42`, `ABC-GHR-KB-45`, `ABC-GHR-KB-52`.

---
doc_id: ABC-GHR-KB-46
tenant_slug: abc-developers
document_title: "Sales Pipeline and Lead Stages"
category: sales_operations
subcategory: pipeline
version: 1.0.0
status: active_demo
authority_level: 3
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
source_of_truth: "config/lead_scoring_rules.json"
approval_status: PENDING_REVIEW
---
# Sales Pipeline and Lead Stages

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** Lead statuses are CANONICAL as implemented in the VaaniQ database (`new`, `contacted`, `qualified`, `visit_scheduled`, `nurture`, `lost`). Stages after a site visit are `SYNTHETIC_DEMO_ASSUMPTION` and live outside VaaniQ.

## 1. Purpose
Defines each pipeline stage, its entry criteria and its owner, so CRM records mean the same thing to everyone.

## 2. Business context
A consistent pipeline lets managers see where leads stall. VaaniQ manages the early stages; booking and later stages involve the sales and CRM teams.

## 3. Stages
| Status (VaaniQ) | Entry criteria | Owner |
|---|---|---|
| `new` | Lead created from a conversation or manually | VaaniQ / sales executive |
| `contacted` | Two-way conversation has taken place | VaaniQ / sales executive |
| `qualified` | Key facts captured (configuration, budget, timeline) | VaaniQ (score) / sales executive |
| `visit_scheduled` | Site visit confirmed in the appointment system | VaaniQ (after explicit consent) |
| `nurture` | Interested but not ready (for example timeline > 6 months) | Sales executive |
| `lost` | Customer declines, unreachable after follow-up policy, or bought elsewhere | Sales executive |

### 3.1 Appointment statuses (CANONICAL)
`confirmed`, `cancelled`, `completed`, `no_show`. Only one confirmed appointment may occupy a slot (enforced by the database).

### 3.2 Downstream stages (SYNTHETIC_DEMO_ASSUMPTION, outside VaaniQ)
Visit done → negotiation (sales manager) → token → booking → agreement → post-sales (`ABC-GHR-KB-64`).

## 4. Customer-facing explanation
Not customer-facing.

## 5. Important conditions
- Status changes made by the agent are audited.
- A lead's temperature (hot/warm/cold) is separate from its status (`ABC-GHR-KB-45`).

## 6. Exceptions
- Duplicate leads for the same customer are merged by the sales team, not the agent.

## 7. Common questions (from sales staff)
| Question | Answer |
|---|---|
| "When does a lead move to qualified?" | When configuration, budget and timeline are captured. |
| "Who marks a lead lost?" | Sales executive, with a reason. |

## 8. What the AI agent can confidently answer
Internal use only.

## 9. What the AI must not claim
Downstream stage information to customers.

## 10. Escalation
Pipeline data issues → **sales manager**.

Related documents: `ABC-GHR-KB-44`, `ABC-GHR-KB-45`, `ABC-GHR-KB-47`.

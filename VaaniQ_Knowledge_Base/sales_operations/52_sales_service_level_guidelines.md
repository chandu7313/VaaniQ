---
doc_id: ABC-GHR-KB-52
tenant_slug: abc-developers
document_title: "Sales Service Level Guidelines"
category: sales_operations
subcategory: sla
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
# Sales Service Level Guidelines

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** Service levels are `SYNTHETIC_DEMO_ASSUMPTION`, `PENDING_REVIEW`. Escalation targets mirror `config/escalation_matrix.json`, which is authoritative.

## 1. Purpose
Sets measurable service levels for responding to enquiries, callbacks, escalations and visit confirmations, so performance can be tracked.

## 2. Business context
Speed of response strongly influences conversion in real estate. VaaniQ answers instantly; the human team needs equally clear targets for what follows.

## 3. Service levels (SYNTHETIC_DEMO_ASSUMPTION)
| Activity | Target | Measured from |
|---|---|---|
| AI first response | Immediate (seconds) | Customer message |
| Hot-lead callback | Within 1 business hour | Lead becoming hot |
| Warm-lead callback | Within 1 business day | Lead becoming warm |
| Customer-requested human (ESC-01) | Within 1 business hour | Escalation |
| Complaint (ESC-06) | Within 4 business hours | Escalation |
| Legal question (ESC-02) | Within 1 business day | Escalation |
| Cost-sheet request (ESC-05) | Within 1 business day | Escalation |
| Privacy request (ESC-09) | Acknowledged within 2 business days | Escalation |
| Visit reminder | Day before the visit | Appointment |
| Post-visit follow-up | Within 1 business day | Visit completed |

### 3.1 Business hours
Monday to Saturday, 10:00 – 18:00 IST for the sales office (`config/company_facts.json`). Targets outside these hours start at the next business-hour window.

### 3.2 Monitoring
- Dashboards in VaaniQ show leads by temperature, appointments and conversations from live data.
- Sales managers review overdue escalations daily.
- No performance figures are claimed in this knowledge base.

## 4. Customer-facing explanation
"Our team usually calls back within the business day; for urgent requests sooner."

## 5. Important conditions
- The agent states targets as "usually" or "aims to", never as guarantees.

## 6. Exceptions
- Public holidays: targets pause (holiday list NOT_CONFIGURED).

## 7. Common questions
| Question | Answer |
|---|---|
| "When will someone call?" | Target for the request type, stated as an aim. |

## 8. What the AI agent can confidently answer
Approximate response targets as aims.

## 9. What the AI must not claim
Guaranteed response times or performance statistics.

## 10. Escalation
Missed targets → **sales manager**; customer complaints about delays → `ESC-06`.

Related documents: `ABC-GHR-KB-47`, `ABC-GHR-KB-50`.

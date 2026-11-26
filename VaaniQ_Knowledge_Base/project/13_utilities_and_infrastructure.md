---
doc_id: ABC-GHR-KB-13
tenant_slug: abc-developers
document_title: "Utilities and Infrastructure"
category: project
subcategory: utilities
version: 1.0.0
status: active_demo
authority_level: 3
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
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Utilities and Infrastructure

> **FICTIONAL DEMONSTRATION DATA.** Utility arrangements are `SYNTHETIC_DEMO_ASSUMPTION`; connection approvals and supply guarantees are `NOT_PROVIDED`.

## 1. Purpose
Answers questions about water, electricity, sewage, gas, internet and lifts, and makes clear which utilities are defined and which are unknown.

## 2. Business context
Daily-life questions ("will there be water shortages?") need careful answers. The agent may describe the planned arrangements but must not guarantee supply, which depends on public utilities and approvals.

## 3. Utilities (SYNTHETIC_DEMO_ASSUMPTION unless marked)
| Utility | Arrangement | Status |
|---|---|---|
| Water | Municipal supply supplemented by borewells and rainwater harvesting; treated STP water for flushing | Planned |
| Water storage | Underground sump and overhead tanks | Planned (capacities NOT_PROVIDED) |
| Electricity | Individual meters; sanctioned load 5 kW (2BHK) / 7 kW (3BHK) | Planned |
| Power backup | DG backup: 100 percent for common areas, 2 kW per apartment | Planned |
| Sewage | On-site sewage treatment plant | Planned |
| Piped gas | — | NOT_PROVIDED |
| Internet / fibre | — | NOT_PROVIDED |
| Lifts | Three per tower including one service lift | Planned |
| Electricity / water connection charges | — | NOT_PROVIDED (see `ABC-GHR-KB-32`) |
| Utility approvals | — | NOT_PROVIDED |

## 4. Customer-facing explanation
"Water is planned from the municipal supply with borewells and rainwater harvesting as support, and treated water is reused for flushing. Each apartment gets its own electricity meter, with 2 kW power backup. Piped gas and internet arrangements aren't in my information yet."

## 5. Important conditions
- Never guarantee 24-hour water or electricity supply.
- Connection charges and deposits are NOT_PROVIDED; they appear only on an approved cost sheet.

## 6. Exceptions
- Questions about the borewell's legal permissions or groundwater approvals → legal (`ESC-02`).
- Questions about running costs (DG fuel, water tankers) relate to maintenance (`ABC-GHR-KB-26`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is there 24×7 water?" | Planned sources described; no guarantee. |
| "Is piped gas available?" | NOT_PROVIDED. |
| "How much power backup?" | 2 kW per apartment; 100% common areas. |
| "Separate meters?" | Yes, individual electricity meters (planned). |

## 8. What the AI agent can confidently answer
The planned arrangements listed, labelled as demonstration data.

## 9. What the AI must not claim
Supply guarantees, approvals, connection charges, gas or internet availability.

## 10. Escalation
Unknown utilities → **sales executive** (`ESC-08`); approvals → **legal** (`ESC-02`).

Related documents: `ABC-GHR-KB-12`, `ABC-GHR-KB-26`, `ABC-GHR-KB-32`.

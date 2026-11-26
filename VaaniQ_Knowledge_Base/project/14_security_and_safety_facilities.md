---
doc_id: ABC-GHR-KB-14
tenant_slug: abc-developers
document_title: "Security and Safety Facilities"
category: project
subcategory: security
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
# Security and Safety Facilities

> **FICTIONAL DEMONSTRATION DATA.** Security and safety provisions are `SYNTHETIC_DEMO_ASSUMPTION`. Fire NOC and other safety approvals are `NOT_PROVIDED`.

## 1. Purpose
Describes planned security and life-safety features so the agent can reassure customers accurately, without claiming approvals or guaranteeing safety.

## 2. Business context
Families, senior citizens and NRI buyers often ask about security. Fire safety is also a statutory area: the agent can describe planned systems but never claim compliance certificates.

## 3. Provisions (SYNTHETIC_DEMO_ASSUMPTION)
| Area | Provision |
|---|---|
| Perimeter | Compound wall with a single gated entry |
| Manned security | Three-tier security: main gate, tower lobbies, patrols |
| CCTV | Cameras in common areas, lobbies, lifts and parking |
| Access | Intercom from every apartment to the security desk; visitor entry logged at the gate |
| Fire detection | Smoke detectors in common areas |
| Fire suppression | Automatic sprinklers in common areas; fire hydrants on every floor |
| Evacuation | Two staircases per tower; illuminated exit signage |
| Lifts | Automatic rescue device (ARD) in lifts |
| Fire NOC / safety approvals | NOT_PROVIDED |
| Security agency, staffing numbers | NOT_PROVIDED |

### 3.1 Construction-site safety during visits
Visitors to the construction area must wear the helmets provided, stay with the sales executive and follow site signage (`ABC-GHR-KB-48`). Children under 12 may not enter active construction zones (SYNTHETIC_DEMO_ASSUMPTION).

## 4. Customer-facing explanation
"The community is planned with a gated entry, three-tier security, CCTV in common areas and an intercom from every home to the security desk. For fire safety there are sprinklers and smoke detectors in common areas and hydrants on every floor. Safety approvals aren't part of my information, so our team will confirm those."

## 5. Important conditions
- Never say the building "is fire-safe", "has a fire NOC" or "is 100% secure".
- CCTV covers common areas only, never inside apartments.

## 6. Exceptions
- Questions about specific incidents, crime rates or neighbourhood safety statistics → not provided; do not speculate.
- Requests for CCTV footage → customer care (`ESC-06`) after possession; not applicable before handover.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is it safe for seniors living alone?" | Describe planned security; no guarantees. |
| "Is there a fire NOC?" | NOT_PROVIDED; escalate (ESC-02). |
| "Are there CCTV cameras?" | Yes, common areas (planned). |
| "Can kids come on the site visit?" | Yes, but not into active construction zones. |

## 8. What the AI agent can confidently answer
The listed provisions and site-visit safety rules.

## 9. What the AI must not claim
Approvals, certificates, guarantees, crime statistics or security staffing levels.

## 10. Escalation
Approval questions → **legal and compliance** (`ESC-02`). Security concerns after possession → **customer care** (`ESC-06`).

Related documents: `ABC-GHR-KB-09`, `ABC-GHR-KB-39`, `ABC-GHR-KB-48`.

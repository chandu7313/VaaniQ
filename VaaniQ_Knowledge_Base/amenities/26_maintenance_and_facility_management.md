---
doc_id: ABC-GHR-KB-26
tenant_slug: abc-developers
document_title: "Maintenance and Facility Management"
category: amenities
subcategory: facility_management
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
source_of_truth: "config/amenity_catalog.json"
approval_status: PENDING_REVIEW
---
# Maintenance and Facility Management

> **FICTIONAL DEMONSTRATION DATA.** Maintenance charges, the maintenance deposit and the corpus fund are `NOT_PROVIDED`. The seed figures of ₹3 per sq.ft per month and ₹50 per sq.ft corpus are **superseded** (reconciliation item R-15) and must not be quoted. The facility-management model is `SYNTHETIC_DEMO_ASSUMPTION`.

## 1. Purpose
Explains how common areas and amenities are planned to be maintained before and after the residents' association takes over, and what the agent may say about maintenance costs.

## 2. Business context
Maintenance cost is a recurring expense that buyers include in their budget. Quoting a figure that is not approved can lead to disputes. This document therefore explains the model and leaves all amounts to the approved cost sheet.

## 3. Facility management model (SYNTHETIC_DEMO_ASSUMPTION)
| Phase | Responsibility |
|---|---|
| Construction to handover | ABC Developers' project team |
| From handover for an initial period | A facility-management agency appointed by ABC Developers |
| After the residents' association is formed and takes over | The association, which may continue or replace the agency |

### 3.1 Services covered
- Housekeeping of common areas, lobbies, staircases and basements.
- Security staffing and CCTV monitoring (`ABC-GHR-KB-14`).
- Operation of lifts, pumps, sewage treatment plant and power backup (`ABC-GHR-KB-13`).
- Garden and landscape upkeep (`ABC-GHR-KB-23`).
- Clubhouse and amenity operation (`ABC-GHR-KB-21`, `ABC-GHR-KB-22`).
- Help-desk for resident service requests.

### 3.2 Charges
| Item | Status |
|---|---|
| Monthly maintenance charge | NOT_PROVIDED |
| Advance maintenance (months collected at handover) | NOT_PROVIDED |
| Corpus / sinking fund | NOT_PROVIDED |
| Facility-management agency | NOT_PROVIDED |
| Initial maintenance period | REQUIRES_HUMAN_CONFIRMATION |

## 4. Customer-facing explanation
"After handover, common areas, security, lifts and amenities are planned to be managed by a professional facility-management agency at first, and later by the residents' association. The maintenance charge, any advance maintenance and the corpus fund aren't in my information; they'll be shown on the approved cost sheet from our sales team."

## 5. Important conditions
- Never quote a per-sq.ft maintenance rate or a corpus amount.
- Maintenance amounts belong on the cost sheet (`ABC-GHR-KB-32`) and the sale agreement.
- Service levels after handover are set by the association.

## 6. Exceptions
- Defects in construction reported after handover are handled under the defect-liability process, not routine maintenance (`ABC-GHR-KB-68`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What's the monthly maintenance?" | NOT_PROVIDED; cost sheet. |
| "Is it ₹3 per sq.ft?" | Superseded figure; not confirmed; cost sheet. |
| "Who manages the society?" | Agency first, then association. |
| "Is there a corpus fund?" | Amount NOT_PROVIDED. |

## 8. What the AI agent can confidently answer
The facility-management model and the services covered.

## 9. What the AI must not claim
Maintenance rates, corpus amounts, agency names, or service-level guarantees.

## 10. Escalation
Maintenance cost questions → **sales executive / cost sheet** (`ESC-05`); service complaints after handover → **customer care** (`ESC-06`).

Related documents: `ABC-GHR-KB-13`, `ABC-GHR-KB-32`, `ABC-GHR-KB-68`.

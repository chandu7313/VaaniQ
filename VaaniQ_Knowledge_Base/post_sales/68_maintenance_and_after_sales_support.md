---
doc_id: ABC-GHR-KB-68
tenant_slug: abc-developers
document_title: "Maintenance and After-Sales Support"
category: post_sales
subcategory: after_sales
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
supersedes: 
  - "seed:ABC Developers - Maintenance, Society and After-Sales"
source_of_truth: "config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Maintenance and After-Sales Support

> **FICTIONAL DEMONSTRATION DATA.** After-sales processes are `SYNTHETIC_DEMO_ASSUMPTION`. Maintenance charges and corpus are `NOT_PROVIDED` (seed figures superseded, R-15). The statutory defect-liability period under RERA is stated as general law; its application to this fictional project is `REQUIRES_HUMAN_CONFIRMATION`.

## 1. Purpose
Explains the support available after handover: defect reporting, the help-desk, warranties of fittings and the transition to the residents' association.

## 2. Business context
Customer satisfaction after handover drives referrals. Owners need to know how to report defects and who is responsible for what.

## 3. Support model
### 3.1 Defect liability (general law)
Under RERA, for registered projects, structural defects and defects in workmanship, quality or services reported within five years of possession must be rectified by the promoter as per the law. Whether and how this applies is `REQUIRES_HUMAN_CONFIRMATION` for this fictional project.

### 3.2 Help-desk and service requests (SYNTHETIC_DEMO_ASSUMPTION)
| Item | Detail |
|---|---|
| Channel | Facility help-desk in the clubhouse; email; phone (contacts NOT_CONFIGURED) |
| Ticket | Each request gets a reference number |
| Categories | Defect (developer), common-area service (facility management), billing (accounts) |
| Target response | Defects acknowledged within 2 business days |

### 3.3 Warranties of fittings
Manufacturer warranties for items such as sanitary fittings and lifts are handed over at possession; claims follow manufacturer terms.

### 3.4 Residents' association
- Formed by owners after handover as per applicable law.
- Common areas and facility management transfer to the association (`ABC-GHR-KB-26`).

### 3.5 Owner-led interior work
Permitted only without structural changes and with prior notice to facility management (`ABC-GHR-KB-20`).

## 4. Customer-facing explanation
"After handover, you can report any defect or service request at the facility help-desk and get a reference number. Developer-related defects are handled under the defect-liability provisions, and fittings carry manufacturer warranties. Later, the residents' association takes over the running of the community."

## 5. Important conditions
- Never state maintenance amounts.
- Never promise repair timelines beyond acknowledgement targets.

## 6. Exceptions
- Damage caused by owner's interior work is not covered by defect liability (SYNTHETIC_DEMO_ASSUMPTION).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Who fixes a leak after I move in?" | Help-desk; defect-liability process. |
| "Is there a warranty?" | Defect liability (general law) + manufacturer warranties. |
| "What's the maintenance charge?" | NOT_PROVIDED; cost sheet. |

## 8. What the AI agent can confidently answer
Support channels, categories, general defect-liability law.

## 9. What the AI must not claim
Maintenance amounts, legal applicability to this project, repair guarantees.

## 10. Escalation
Defect complaints → **customer care** (`ESC-06`); legal applicability → `ESC-02`.

Related documents: `ABC-GHR-KB-20`, `ABC-GHR-KB-26`, `ABC-GHR-KB-67`, `ABC-GHR-KB-69`.

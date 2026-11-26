---
doc_id: ABC-GHR-KB-67
tenant_slug: abc-developers
document_title: "Property Handover Procedure"
category: post_sales
subcategory: handover
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
# Property Handover Procedure

> **FICTIONAL DEMONSTRATION DATA.** **Possession and handover dates are `NOT_PROVIDED`.** The seed's dates (December 2027 for Tower A, June 2028 for Tower B) are superseded (reconciliation item R-07) and must never be quoted. The occupancy certificate status is `NOT_PROVIDED`. The procedure is `SYNTHETIC_DEMO_ASSUMPTION`.

## 1. Purpose
Explains the steps from completion to the buyer receiving the keys, and fixes the rule that possession timing comes only from the project team in writing.

## 2. Business context
"When will I get possession?" is among the most asked and most sensitive questions. A date stated by an AI could be treated as a commitment. The handover process itself, however, can be explained.

## 3. Procedure (SYNTHETIC_DEMO_ASSUMPTION)
| Step | Detail |
|---|---|
| 1. Completion notice | CRM sends written intimation that the unit is ready for possession, subject to statutory requirements |
| 2. Final demand | Final instalment and applicable charges as per the agreement |
| 3. Pre-handover inspection | Buyer inspects the apartment with a CRM representative and records a snag list |
| 4. Snag rectification | Project team fixes listed items; buyer re-checks |
| 5. Documentation | Possession letter, handover checklist, warranties of fittings, owner's manual |
| 6. Key handover | Keys, access cards and vehicle tags issued |
| 7. Facility onboarding | Introduction to facility management and help-desk (`ABC-GHR-KB-68`) |
| 8. Conveyance | Sale deed registration as per law (`ABC-GHR-KB-40`) |

| Field | Status |
|---|---|
| Possession date, Tower A | NOT_PROVIDED |
| Possession date, Tower B | NOT_PROVIDED |
| Occupancy certificate | NOT_PROVIDED |
| Grace period / delay terms | NOT_PROVIDED (agreement) |

## 4. Customer-facing explanation
"Possession dates are confirmed only in writing by our project team, so I can't give one. At handover, you'd get a written notice, inspect the apartment with our CRM team, have any snags fixed, and then receive the keys, possession letter and owner's documents."

## 5. Important conditions
- Never state or estimate a possession date, year or quarter.
- Never say the occupancy certificate is received or expected.

## 6. Exceptions
- Buyers asking about delay compensation → `ESC-02`.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "When is possession?" | NOT_PROVIDED; `ESC-03`. |
| "Is it December 2027?" | Cannot confirm; `ESC-03`. |
| "Can I inspect before taking keys?" | Yes, pre-handover inspection. |

## 8. What the AI agent can confidently answer
The handover steps.

## 9. What the AI must not claim
Dates, OC status, delay terms.

## 10. Escalation
Possession timing → **project team** (`ESC-03`); delay disputes → `ESC-02`.

Related documents: `ABC-GHR-KB-40`, `ABC-GHR-KB-66`, `ABC-GHR-KB-68`.

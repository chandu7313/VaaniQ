---
doc_id: ABC-GHR-KB-66
tenant_slug: abc-developers
document_title: "Construction Update Communication"
category: post_sales
subcategory: construction_updates
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
# Construction Update Communication

> **FICTIONAL DEMONSTRATION DATA.** The communication policy is `SYNTHETIC_DEMO_ASSUMPTION`. **Actual construction progress, photographs and stage reached are `REQUIRES_HUMAN_CONFIRMATION`** (reconciliation item R-11) and are never stated by the AI agent.

## 1. Purpose
Explains how and how often buyers receive construction updates, and why the agent never describes current progress itself.

## 2. Business context
Buyers paying construction-linked instalments want to see progress. Regular, verified updates build trust; unverified claims ("the 10th slab is done") can mislead and may trigger payment disputes.

## 3. Policy (SYNTHETIC_DEMO_ASSUMPTION)
| Channel | Frequency | Content |
|---|---|---|
| Email update | Monthly | Progress summary and photographs approved by the project team |
| Milestone demand letter | At each milestone | Milestone reached, amount due (`ABC-GHR-KB-30`) |
| Site visits for buyers | By appointment | Guided visit from safe areas |
| Statutory project updates | As required by applicable law | Through the regulator's portal, where applicable |

### 3.1 Approval of updates
- Prepared by the project team; checked by the CRM team; approved by the project head.
- Photographs are dated.
- No forecasts of completion dates unless approved in writing.

| Field | Status |
|---|---|
| Current construction stage | REQUIRES_HUMAN_CONFIRMATION |
| Latest update date | NOT_PROVIDED |
| Buyer portal | NOT_CONFIGURED |

## 4. Customer-facing explanation
"Buyers receive a monthly construction update by email with approved photographs, and a demand letter whenever a milestone is reached. I don't have current progress details, but our CRM team can share the latest update."

## 5. Important conditions
- Never state the current stage, percentage complete or expected completion.

## 6. Exceptions
- If a buyer reports that a demand letter does not match visible progress → `ESC-06`.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "How much is completed?" | REQUIRES_HUMAN_CONFIRMATION. |
| "Can I see photos?" | Monthly update; CRM shares. |
| "When will it finish?" | `ESC-03`. |

## 8. What the AI agent can confidently answer
How updates are communicated.

## 9. What the AI must not claim
Progress, stage, completion dates.

## 10. Escalation
Progress questions → **project team** (`ESC-03`); disputes → `ESC-06`.

Related documents: `ABC-GHR-KB-10`, `ABC-GHR-KB-30`, `ABC-GHR-KB-67`.

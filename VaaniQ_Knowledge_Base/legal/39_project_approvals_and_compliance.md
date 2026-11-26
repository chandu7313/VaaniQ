---
doc_id: ABC-GHR-KB-39
tenant_slug: abc-developers
document_title: "Project Approvals and Compliance"
category: legal
subcategory: approvals
version: 1.0.0
status: active_demo
authority_level: 2
data_classification: public
retrieval_scope: customer_facing
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: false
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "authorised legal representative (facts NOT_PROVIDED in this knowledge base)"
approval_status: PENDING_REVIEW
---
# Project Approvals and Compliance

> **FICTIONAL DEMONSTRATION DATA.** **No government approval, sanction, certificate or no-objection certificate (NOC) is provided for GreenHaven Residences.** Land title status is `NOT_PROVIDED`. Every field below is `NOT_PROVIDED` unless stated otherwise.

## 1. Purpose
Lists the kinds of approvals a residential project typically needs and records, for each, that this knowledge base holds no verified information. Ensures the agent never claims approval, compliance or clear title.

## 2. Business context
Approval and title questions are among the most consequential a buyer asks. A statement that a project is "fully approved" or has "clear title" can influence a purchase worth tens of lakhs. Only signed documents reviewed by legal and compliance can support such statements.

## 3. Approval register
| Approval / document (general category) | Typical issuer | GreenHaven status |
|---|---|---|
| Land title and title report | Legal due diligence | NOT_PROVIDED |
| Land-use / conversion permission | State revenue / planning authority | NOT_PROVIDED |
| Building permission / sanctioned plan | Local development authority | NOT_PROVIDED |
| Environmental clearance (if applicable) | State environment authority | NOT_PROVIDED |
| Fire NOC | State fire services | NOT_PROVIDED |
| Airport height clearance (if applicable) | Aviation authority | NOT_PROVIDED |
| Water and sewerage connection approvals | Local utility | NOT_PROVIDED |
| Electricity supply approval | State distribution company | NOT_PROVIDED |
| Occupancy certificate | Local development authority, after completion | NOT_PROVIDED |
| Encumbrance status | Sub-registrar records | NOT_PROVIDED |
| Litigation status | Legal | NOT_PROVIDED |

### 3.1 How customers can verify
- Ask the sales team for copies of approvals; legal and compliance provides them when available.
- Engage an independent lawyer for title verification.
- Lenders conduct their own legal and technical checks before sanction (`ABC-GHR-KB-33`).

## 4. Customer-facing explanation
"I don't have verified information about the project's approvals, title or certificates, so I can't confirm them. Our legal and compliance team can share the official documents, and many buyers also have an independent lawyer review them."

## 5. Important conditions
- Never say "all approvals are in place", "clear title", "no litigation", "OC received" or similar.
- Never imply that a lender's interest means approvals exist.
- Never interpret law for the customer.

## 6. Exceptions
- If a customer states a concern about legality or litigation, record it (with consent) and escalate immediately (`ESC-02`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is the land title clear?" | NOT_PROVIDED; `ESC-02`. |
| "Do you have an occupancy certificate?" | NOT_PROVIDED. |
| "Is the plan HMDA/GHMC approved?" | NOT_PROVIDED; do not name or confirm an authority's approval. |
| "Any court cases?" | NOT_PROVIDED; `ESC-02`. |

## 8. What the AI agent can confidently answer
General categories of approvals and how a buyer can verify them.

## 9. What the AI must not claim
Any approval, certificate, title or litigation status.

## 10. Escalation
All approval, title and litigation questions → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-38`, `ABC-GHR-KB-40`, `ABC-GHR-KB-43`.

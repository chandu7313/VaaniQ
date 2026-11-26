---
doc_id: ABC-GHR-KB-38
tenant_slug: abc-developers
document_title: "Project Registration and RERA Information"
category: legal
subcategory: rera
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
supersedes: 
  - "seed:GreenHaven Residences - Possession, RERA and Legal"
source_of_truth: "authorised legal representative (facts NOT_PROVIDED in this knowledge base)"
approval_status: PENDING_REVIEW
---
# Project Registration and RERA Information

> **FICTIONAL DEMONSTRATION DATA.** **The RERA registration number, registration status and registration validity of GreenHaven Residences are `NOT_PROVIDED`.** The seed's placeholder number (P00000000000) is superseded (reconciliation item R-06) and must never be quoted. General statements about RERA describe the law, not this project's status.

## 1. Purpose
Gives the agent a single authoritative answer for RERA questions about this project, which is that no registration information is provided, and explains RERA in general so customers understand why it matters.

## 2. Business context
The Real Estate (Regulation and Development) Act, 2016 (RERA), and the Telangana State RERA authority (TG-RERA) regulate residential projects in Telangana. Buyers rightly ask for the registration number. A fictional project cannot have one, and inventing one would be a regulatory misrepresentation.

## 3. Registration status
| Field | Value | Status |
|---|---|---|
| RERA registration number | — | NOT_PROVIDED |
| Registration status | — | NOT_PROVIDED |
| Registration validity / completion date declared to RERA | — | NOT_PROVIDED |
| Promoter registration | — | NOT_PROVIDED |
| Agent (broker) registration | — | NOT_PROVIDED |

### 3.1 RERA in general (law, not project status)
- Registered projects are listed on the state RERA website with their details.
- RERA defines carpet area and requires sale on carpet-area basis (`ABC-GHR-KB-18`).
- RERA sets out rights of allottees, including information about the project and a statutory defect-liability period after possession.
- Customers can verify any project's registration directly on the state RERA portal.

## 4. Customer-facing explanation
"The RERA registration details for this project aren't part of my verified information, so I can't quote a number or a status. Our legal and compliance team can share the official registration details, and you can always verify any project yourself on the Telangana RERA website."

## 5. Important conditions
- Never quote, guess or format a RERA number.
- Never say "the project is RERA registered" or "RERA approved".
- Never state possession dates declared to RERA.

## 6. Exceptions
- If a customer reads out a number they found elsewhere, the agent says it cannot confirm it and refers to legal and compliance.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What is the RERA number?" | NOT_PROVIDED; `ESC-02`. |
| "Is it RERA approved?" | Cannot confirm; `ESC-02`. |
| "What is RERA?" | General explanation. |
| "Where can I check registration?" | State RERA website. |

## 8. What the AI agent can confidently answer
General explanation of RERA and how to verify registration.

## 9. What the AI must not claim
Any registration number, status, validity or declared date.

## 10. Escalation
All registration questions → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-39`, `ABC-GHR-KB-40`, `ABC-GHR-KB-41`, `ABC-GHR-KB-43`.

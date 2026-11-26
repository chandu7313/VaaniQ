---
doc_id: ABC-GHR-KB-40
tenant_slug: abc-developers
document_title: "Sale Agreement and Documentation"
category: legal
subcategory: agreements
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
source_of_truth: "authorised legal representative (facts NOT_PROVIDED in this knowledge base)"
approval_status: PENDING_REVIEW
---
# Sale Agreement and Documentation

> **FICTIONAL DEMONSTRATION DATA.** Document sequence is `SYNTHETIC_DEMO_ASSUMPTION`. The agreement template, its clauses, penalty and interest terms, and registration charges are `NOT_PROVIDED`. **The signed sale agreement is the highest-authority customer document and overrides every statement in this knowledge base.**

## 1. Purpose
Explains the documents a buyer receives and signs, in order, and establishes that contractual terms come only from the signed agreement.

## 2. Business context
Customers ask "what will I sign?" and "what does the agreement say about delay?". The agent can describe the sequence of documents; it must not summarise or interpret contractual clauses that it does not have.

## 3. Document sequence (SYNTHETIC_DEMO_ASSUMPTION)
| Stage | Document | Issued by |
|---|---|---|
| Unit selection | Approved cost sheet | Sales executive |
| Booking | Application / booking form, payment receipt | Sales and accounts |
| After booking | Allotment letter (unit, parking, payment plan) | CRM team |
| Agreement | Agreement for sale, executed and registered as per applicable law | Legal / CRM |
| Each milestone | Demand letter and receipt | CRM and accounts |
| Completion | Possession letter, handover checklist | CRM / project team |
| Conveyance | Sale deed, registered | Legal |

| Field | Status |
|---|---|
| Agreement template / clauses | NOT_PROVIDED |
| Delay compensation terms | NOT_PROVIDED |
| Interest on delayed payment | NOT_PROVIDED |
| Registration charges and stamp duty | NOT_PROVIDED (statutory) |
| Draft agreement sharing before booking | REQUIRES_HUMAN_CONFIRMATION |

### 3.1 Authority of documents
Signed agreement → allotment letter → approved cost sheet → structured configuration → this knowledge base. If any of these conflict, the higher document governs and the conflict is reported (`config/data_authority_registry.json`).

## 4. Customer-facing explanation
"After booking you'd receive an allotment letter, then sign an agreement for sale that's registered as per law. Demand letters follow at each construction stage, and at completion you receive a possession letter and later the sale deed. The agreement's terms are what count, and our team can share a draft for you or your lawyer to review."

## 5. Important conditions
- Never paraphrase clauses on delay, penalties, compensation or termination.
- Never estimate registration or stamp-duty amounts.
- Encourage independent legal review; never discourage it.

## 6. Exceptions
- Power-of-attorney arrangements for NRIs → `ABC-GHR-KB-65` and legal team.
- Joint ownership questions → legal team.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Can I see the agreement before paying?" | REQUIRES_HUMAN_CONFIRMATION; sales executive. |
| "What does the agreement say about delay?" | NOT_PROVIDED; `ESC-02`. |
| "When is the sale deed registered?" | At conveyance after completion (general). |

## 8. What the AI agent can confidently answer
The sequence of documents and the authority order.

## 9. What the AI must not claim
Contract terms, compensation, penalties, registration costs.

## 10. Escalation
Clause questions → **legal and compliance** (`ESC-02`); document requests → **sales executive**.

Related documents: `ABC-GHR-KB-31`, `ABC-GHR-KB-41`, `ABC-GHR-KB-64`, `ABC-GHR-KB-65`.

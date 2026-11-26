---
doc_id: ABC-GHR-KB-43
tenant_slug: abc-developers
document_title: "Legal Escalation Policy"
category: legal
subcategory: legal_escalation
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
source_of_truth: "authorised legal representative (facts NOT_PROVIDED in this knowledge base)"
approval_status: PENDING_REVIEW
---
# Legal Escalation Policy

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** Routing mirrors `config/escalation_matrix.json` (`ESC-02`), which is authoritative. Named legal contacts are `NOT_CONFIGURED`.

## 1. Purpose
Defines which questions are legal or regulatory, how the agent responds, and how such questions reach the legal and compliance team.

## 2. Business context
Legal questions carry the highest risk of harm from a wrong answer. The agent's job is to recognise them, decline to speculate politely and route them fast, while keeping the customer's goodwill.

## 3. Policy
### 3.1 Triggers (any of)
- RERA number, registration, validity or complaints.
- Approvals, NOCs, occupancy certificate, sanctioned plan.
- Land title, encumbrance, litigation, disputes.
- Contract clauses: delay compensation, penalties, termination.
- Allegations of misrepresentation or breach.
- Requests for legal advice.

### 3.2 Agent response pattern
1. Acknowledge the question as important.
2. State that verified information must come from an authorised representative.
3. Do not speculate, reassure about legality, or interpret law.
4. Offer a callback from legal and compliance and record the question verbatim (with consent for contact).

### 3.3 Routing (from `config/escalation_matrix.json`)
| Field | Value |
|---|---|
| Rule | ESC-02 legal_or_regulatory_question |
| Route to | legal_and_compliance_team |
| Priority | high |
| Response target | within 1 business day (SYNTHETIC_DEMO_ASSUMPTION) |

## 4. Customer-facing explanation
"That's an important question, and it needs an answer from an authorised person, not from me. I'll pass it to our legal and compliance team, who'll get back to you. May I have the best number to reach you?"

## 5. Important conditions
- The trigger applies even if the customer insists ("just tell me yes or no").
- If the question also signals distress or a complaint, apply `ESC-06` as well.

## 6. Exceptions
- General explanations of terms (what RERA is, what carpet area means) are allowed from `ABC-GHR-KB-18` and `ABC-GHR-KB-38`.

## 7. Common customer questions
| Question | Response |
|---|---|
| "Is the title clear, yes or no?" | Decline to speculate; `ESC-02`. |
| "Will I get compensation for delay?" | Agreement terms; `ESC-02`. |
| "What is RERA?" | General explanation allowed. |

## 8. What the AI agent can confidently answer
Whether a question is legal and how it will be handled.

## 9. What the AI must not claim
Any legal status, interpretation or assurance.

## 10. Escalation
Legal → `ESC-02`; distress → `ESC-06`; privacy → `ESC-09`.

Related documents: `ABC-GHR-KB-38`, `ABC-GHR-KB-39`, `ABC-GHR-KB-40`, `ABC-GHR-KB-50`.

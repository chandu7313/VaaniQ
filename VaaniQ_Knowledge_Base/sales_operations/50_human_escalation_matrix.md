---
doc_id: ABC-GHR-KB-50
tenant_slug: abc-developers
document_title: "Human Escalation Matrix"
category: sales_operations
subcategory: escalation
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
source_of_truth: "config/escalation_matrix.json"
approval_status: PENDING_REVIEW
---
# Human Escalation Matrix

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** This is a readable mirror of `config/escalation_matrix.json` (authority level 1), which is authoritative and is applied by the application. Response targets are `SYNTHETIC_DEMO_ASSUMPTION`.

## 1. Purpose
Lists every situation in which the agent must hand over to a person, who receives it, how urgently, and what the agent says.

## 2. Business context
An AI sales agent is safe only if it knows its limits. Escalation turns "I can't answer that" into a committed human follow-up instead of a dead end.

## 3. Matrix
| ID | Trigger | Route to | Priority | Target | Agent says |
|---|---|---|---|---|---|
| ESC-01 | Customer asks for a human | Sales executive | High | 1 business hour | A colleague will call; asks preferred time |
| ESC-02 | Legal or regulatory question | Legal and compliance | High | 1 business day | Must come from an authorised representative |
| ESC-03 | Possession or handover date | Project team | Normal | 1 business day | Confirmed only in writing by the project team |
| ESC-04 | Discount or negotiation | Sales manager | Normal | 1 business day | Cannot negotiate; offers manager callback |
| ESC-05 | Final cost or taxes | Sales executive | Normal | 1 business day | Offers an approved cost sheet |
| ESC-06 | Complaint or negative sentiment | Customer-care lead | High | 4 business hours | Acknowledges, apologises, logs, escalates |
| ESC-07 | Loan approval or eligibility | Sales executive | Normal | 1 business day | Approval is decided only by the lender |
| ESC-08 | Information not in the knowledge base | Sales executive | Low | 1 business day | Verified information not available; follow-up |
| ESC-09 | Data-privacy request | Data-protection contact | High | 2 business days | Request recorded; marketing contact stops |
| ESC-10 | Booking cancellation or refund | CRM and accounts | High | 1 business day | Terms follow the signed agreement |

### 3.1 Escalation record
Each escalation records: trigger ID, the customer's question (verbatim), language, consent to contact, and the conversation ID, so the receiving person has full context.

## 4. Customer-facing explanation
"I'll pass this to the right person in our team, and they'll get back to you. Could you confirm the best number and time to reach you?"

## 5. Important conditions
- Multiple triggers can apply; use the highest priority for urgency.
- Escalation never replaces a safe answer: the agent still states what it does know.

## 6. Exceptions
- Outside business hours, targets start from the next business-hour window.

## 7. Common questions
| Situation | Rule |
|---|---|
| "Angry about RERA number" | ESC-02 + ESC-06 |
| "Best price and GST?" | ESC-04 + ESC-05 |

## 8. What the AI agent can confidently answer
That a handover will happen and to which team.

## 9. What the AI must not claim
Named individuals or faster targets than configured.

## 10. Escalation
This document is the escalation reference.

Related documents: `ABC-GHR-KB-43`, `ABC-GHR-KB-52`, `ABC-GHR-KB-69`.

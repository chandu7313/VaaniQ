---
doc_id: ABC-GHR-KB-03
tenant_slug: abc-developers
document_title: "Management and Department Structure"
category: company
subcategory: organisation
version: 1.0.0
status: active_demo
authority_level: 3
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
source_of_truth: "config/company_facts.json"
approval_status: PENDING_REVIEW
---
# Management and Department Structure

> **FICTIONAL DEMONSTRATION DATA.** The organisation described here is a `SYNTHETIC_DEMO_ASSUMPTION` designed to make escalation routing concrete. No real people are named; individual names, phone numbers and e-mail addresses are `NOT_PROVIDED`.

## 1. Purpose
The AI agent needs to know *which team* owns a topic so it can route escalations correctly. This internal document defines departments, their responsibilities and the decisions only they may make. It complements the machine-readable routing in `config/escalation_matrix.json`.

## 2. Business context
A residential sale touches many teams: sales, legal, finance, construction, customer care and facility management. When a customer asks something outside the AI's authority, routing to the right team quickly is what keeps the experience good.

## 3. Department structure (SYNTHETIC_DEMO_ASSUMPTION)
| Department | Role in the customer journey | Decisions it owns | Escalation code |
|---|---|---|---|
| Sales | Enquiries, site visits, unit selection, cost sheets | Unit allocation, approved cost sheets, booking acceptance | ESC-01, ESC-05, ESC-07, ESC-08 |
| Sales management | Pricing exceptions, negotiation | Any discount or price exception (written) | ESC-04 |
| Legal and compliance | Registration, approvals, agreements, title | All legal and regulatory statements | ESC-02 |
| Project / construction | Construction progress, possession timelines | Construction updates, possession communication | ESC-03 |
| CRM and accounts | Receipts, payment schedule, cancellations, refunds | Payment records, refund processing | ESC-10 |
| Customer care | Complaints, service quality | Complaint resolution and closure | ESC-06 |
| Facility management | Post-handover maintenance and amenities | Maintenance operations | via customer care |
| Data protection contact | Privacy requests | Consent withdrawal, data deletion | ESC-09 |

### 3.1 Leadership roles (titles only)
- **Managing Director** – overall accountability (name NOT_PROVIDED).
- **Head of Sales** – final authority on pricing exceptions.
- **Head of Projects** – construction schedule and quality.
- **Legal and Compliance Lead** – all regulatory communication.
- **Customer Care Lead** – complaint ownership and service standards.

No organisation chart, headcount or reporting line beyond the table above is defined.

## 4. Customer-facing explanation
Customers do not need the internal structure. The agent uses it to say things like: "That's a question for our legal team. I've asked them to get back to you," or "Our project team confirms construction updates; I'll request one for you."

## 5. Important conditions
- The agent names a **team**, never an individual, because names are NOT_PROVIDED.
- The agent never states response times beyond the targets in `ABC-GHR-KB-52` and `config/escalation_matrix.json`.
- Only the teams listed may make the decisions listed; the AI makes none of them.

## 6. Exceptions
- If a customer insists on speaking to "the MD" or "the owner", the agent records the request and escalates to a sales executive (`ESC-01`); it does not promise a meeting.
- Media, vendor or job enquiries are outside the sales flow and are routed to a sales executive for redirection.

## 7. Common questions (internal)
| Situation | Route |
|---|---|
| Customer wants a better price | Sales management (ESC-04) |
| Customer asks for the RERA number | Legal and compliance (ESC-02) |
| Customer asks when possession happens | Project team (ESC-03) |
| Customer wants to cancel a booking | CRM and accounts (ESC-10) |
| Customer complains about a call | Customer care (ESC-06) |

## 8. What the AI agent can confidently answer
- Which team handles a topic, and that a follow-up will come from that team.

## 9. What the AI must not claim
- Names, direct numbers or personal e-mail addresses of staff.
- That a specific person has approved anything.
- Internal headcount, salaries or organisational changes.

## 10. Escalation
This document *is* the routing reference. When in doubt about the owning team, escalate to a **sales executive** (`ESC-08`), who redirects internally.

Related documents: `ABC-GHR-KB-04`, `ABC-GHR-KB-50` (human escalation matrix), `ABC-GHR-KB-43` (legal escalation).

---
doc_id: ABC-GHR-KB-04
tenant_slug: abc-developers
document_title: "Sales Team Roles and Responsibilities"
category: company
subcategory: sales_team
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
# Sales Team Roles and Responsibilities

> **FICTIONAL DEMONSTRATION DATA.** Roles and responsibilities are a `SYNTHETIC_DEMO_ASSUMPTION` describing a typical residential sales team. No real people are named.

## 1. Purpose
Defines who does what between a customer's first message and a confirmed booking, and exactly where the VaaniQ AI agent's responsibilities stop. The AI uses this to set correct expectations ("a sales executive will prepare your cost sheet") and to avoid acting outside its role.

## 2. Business context
The AI agent handles first contact around the clock in English, Hindi and Telugu. Human staff own every commitment: prices for a specific unit, discounts, allotment, legal statements and payments. Clear boundaries prevent the AI from promising something only a human may approve.

## 3. Roles (SYNTHETIC_DEMO_ASSUMPTION)
### 3.1 VaaniQ AI sales agent
- Answers questions from approved documents and structured records, citing sources.
- Qualifies leads using the deterministic scoring rules (`ABC-GHR-KB-45`).
- Offers site-visit slots from the live appointment service and books **only after the customer explicitly confirms** the exact slot.
- Records requirements, contact details and a call summary in the CRM.
- Escalates per `ABC-GHR-KB-50`.
- **Does not:** quote final prices, allocate units, negotiate, discuss legal status, promise loans or dates.

### 3.2 Sales executive
- Calls back escalated and hot leads; conducts site visits.
- Presents available units from the live inventory (inventory system: NOT_CONFIGURED in the demo app).
- Prepares and shares the **approved cost sheet** (`ABC-GHR-KB-32`).
- Collects the token and booking documents (`ABC-GHR-KB-31`, `ABC-GHR-KB-65`).

### 3.3 Sales manager
- Reviews negotiation and discount requests; may approve exceptions **in writing** within limits set by the Head of Sales (`ABC-GHR-KB-35`).
- Coaches executives and reviews AI escalations weekly.

### 3.4 Head of Sales
- Final authority on pricing policy, offers and exceptions.
- Approves changes to `config/pricing_catalog.json` and `config/sales_policy.json`.

### 3.5 CRM coordinator
- Maintains lead records, issues receipts, tracks follow-ups and SLA compliance (`ABC-GHR-KB-52`).

## 4. Responsibility matrix (RACI, SYNTHETIC_DEMO_ASSUMPTION)
| Activity | AI agent | Sales executive | Sales manager | Head of Sales |
|---|---|---|---|---|
| Answer product questions | R | R | C | I |
| Lead qualification score | R (deterministic) | C | I | I |
| Book site visit | R (after consent) | R | I | I |
| Conduct site visit | – | R | C | I |
| Issue cost sheet | – | R | A | I |
| Discount approval | – | – | R (limits) | A |
| Accept token / booking | – | R | A | I |

R = responsible, A = accountable, C = consulted, I = informed.

## 5. Customer-facing explanation
"I'm VaaniQ, ABC Developers' virtual assistant. I can answer questions about GreenHaven Residences and arrange a site visit. For a unit-specific price, your cost sheet and booking, one of our sales executives will take over personally."

## 6. Important conditions
- A human must own every lead marked hot (score ≥ 75) within the SLA in `ABC-GHR-KB-52`.
- The AI's booked site visits are real appointments in the database; executives must honour or reschedule them with the customer's agreement.
- Discount approvals are valid only in writing (`ABC-GHR-KB-35`).

## 7. Exceptions
- Outside office hours, the AI continues to answer and book visits, but callbacks happen on the next working day.
- If no sales executive is available for a booked slot, the CRM coordinator reschedules and informs the customer before the slot.

## 8. Common customer questions
| Question | Answer approach |
|---|---|
| "Are you a real person?" | No, I'm a virtual assistant; a human executive will follow up. |
| "Can you give me the final price?" | A sales executive prepares an approved cost sheet. |
| "Who will meet me at the site?" | A sales executive (name assigned later). |

## 9. What the AI agent can confidently answer / must not claim
**Can answer:** its own role, what a sales executive will do next, that site visits are free (`ABC-GHR-KB-48`).
**Must not claim:** that it can allocate units, hold a unit, give discounts, waive charges, or that a named person will call at a specific minute.

## 10. Escalation
Requests requiring human authority route through `config/escalation_matrix.json`: negotiation → sales manager (`ESC-04`); final costs → sales executive (`ESC-05`); human request → sales executive (`ESC-01`).

Related documents: `ABC-GHR-KB-03`, `ABC-GHR-KB-35`, `ABC-GHR-KB-46`, `ABC-GHR-KB-50`.

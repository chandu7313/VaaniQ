---
doc_id: ABC-GHR-KB-05
tenant_slug: abc-developers
document_title: "Customer Service Standards"
category: company
subcategory: service_standards
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
source_of_truth: "config/company_facts.json"
approval_status: PENDING_REVIEW
---
# Customer Service Standards

> **FICTIONAL DEMONSTRATION DATA.** These standards are an approved-policy template for the demonstration tenant. Specific numbers are `SYNTHETIC_DEMO_ASSUMPTION` unless stated otherwise.

## 1. Purpose
Defines how every customer (by phone, voice agent, chat, e-mail or in person) should be treated, so that the AI agent and human staff behave consistently. The AI follows these standards in tone, honesty and escalation.

## 2. Business context
Buying a home is a large, emotional decision. Customers compare developers on trust as much as on price. Service standards protect trust by making honesty, responsiveness and respect non-negotiable.

## 3. The standards
### 3.1 Honesty
- Share only verified information from approved sources. If something is unknown, say so plainly: "I don't have verified information on that."
- Never present an assumption, estimate or example as a fact.
- Clearly separate *indicative* prices from *final* amounts (`ABC-GHR-KB-27`).

### 3.2 Respect
- Address customers politely in their chosen language (English, Hindi or Telugu).
- Do not pressure. Never invent urgency ("only two units left", "price rises tomorrow") unless an authorised, current record states it. Live inventory is NOT_CONFIGURED in the demo app, so scarcity claims are never made.
- Accept "no" and "not now" without argument.

### 3.3 Responsiveness (SYNTHETIC_DEMO_ASSUMPTION; mastered in `ABC-GHR-KB-52`)
| Situation | Target |
|---|---|
| AI agent response to a message | immediate |
| Human callback when requested | within 1 business hour (office hours) |
| Complaint acknowledgement | within 4 business hours |
| Legal or regulatory query | first response within 1 business day |

### 3.4 Consistency
- The same question gets the same answer across channels; answers come from this knowledge base and the structured config.
- When two sources disagree, staff do not choose one; they flag it (`config/data_authority_registry.json`).

### 3.5 Privacy
- Collect only the information needed (name, phone, requirements) and only with the customer's knowledge (`ABC-GHR-KB-42`).
- Never read back a full phone number in public channels.

### 3.6 Accessibility
- Offer text input when voice does not work, and voice when typing is hard.
- Speak in short, clear sentences; repeat key details (date, time, reference) on request.

## 4. Customer-facing explanation
"We aim to give you accurate information, answer quickly and never pressure you. If I don't know something, I'll tell you and get the right person to help."

## 5. Important conditions
- Response targets apply during office hours (Monday–Saturday, 10:00–18:00 IST, SYNTHETIC_DEMO_ASSUMPTION); out-of-hours requests are handled on the next working day.
- Targets are service goals, not contractual guarantees.

## 6. Exceptions
- Abusive or threatening behaviour: the agent stays polite, ends the sales flow and escalates to customer care (`ESC-06`).
- Emergencies (for example a safety issue on site) are outside the AI's scope; the customer is told to contact local emergency services, and the matter is escalated.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Will someone actually call me back?" | Yes, a sales executive; state the target window. |
| "Can I complain about a salesperson?" | Yes; log the complaint and escalate to customer care. |
| "Do I have to decide today?" | No. There is no obligation. |

## 8. What the AI agent can confidently answer
- The service commitments above and the escalation path for complaints.

## 9. What the AI must not claim
- Guaranteed outcomes, compensation, penalties or response times shorter than the targets.
- Any scarcity or deadline that is not in an authorised current record.

## 10. Escalation
Service failures and complaints → **customer care lead** (`ESC-06`). Repeated unanswered callbacks → **sales manager**.

Related documents: `ABC-GHR-KB-52` (service levels), `ABC-GHR-KB-69` (complaint resolution), `ABC-GHR-KB-42` (privacy).

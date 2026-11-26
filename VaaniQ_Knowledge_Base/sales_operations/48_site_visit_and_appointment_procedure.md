---
doc_id: ABC-GHR-KB-48
tenant_slug: abc-developers
document_title: "Site Visit and Appointment Procedure"
category: sales_operations
subcategory: site_visits
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
supersedes: 
  - "seed:ABC Developers - Site Visit Policy and FAQs"
source_of_truth: "live appointment service + config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Site Visit and Appointment Procedure

> **FICTIONAL DEMONSTRATION DATA.** Visit hours (Monday – Saturday, 10:00 – 18:00 IST, 60-minute slots, at least 2 hours' notice, up to 7 days ahead) are `SYNTHETIC_DEMO_ASSUMPTION` mirrored from `config/sales_policy.json` and tenant booking settings. **Available slots are read only from the live appointment system**, never from this document. Booking requires the customer's explicit confirmation (CANONICAL).

## 1. Purpose
Explains how site visits are scheduled, confirmed, rescheduled and cancelled, and what a visitor should expect on the day.

## 2. Business context
A site visit is the strongest buying signal and the main action the AI agent can complete itself. Because a booking commits staff time and the customer's time, it must be consented, conflict-free and auditable.

## 3. Procedure
### 3.1 Scheduling (CANONICAL behaviour)
1. The customer asks for a visit or accepts the agent's offer.
2. The agent checks live availability for the requested day or time.
3. The agent proposes a specific slot (date, time, place).
4. The customer explicitly confirms that exact slot ("yes, book it").
5. The agent creates the appointment; the database prevents double booking of a slot or of the same lead.
6. The agent reads back the confirmed slot and records it in the CRM and the call summary.

### 3.2 Visit rules (SYNTHETIC_DEMO_ASSUMPTION)
| Rule | Value |
|---|---|
| Days | Monday to Saturday |
| Hours | 10:00 – 18:00 IST |
| Slot length | 60 minutes |
| Minimum notice | 2 hours |
| Booking window | Up to 7 days ahead |
| Location | Sales office at the project site, Gachibowli |
| Sunday visits | Not available in the default configuration |

### 3.3 On the day
- A sales executive meets the visitor at the sales office.
- The visit covers the project model, a sample-flat or show-area walkthrough where available, and a tour of the site from safe areas.
- Visitors wear the helmets provided in construction areas; children under 12 do not enter active construction zones (`ABC-GHR-KB-14`).
- Carry a photo ID for gate entry.

### 3.4 Rescheduling and cancellation
Customers may reschedule or cancel through the agent or the sales team; the slot is released immediately.

## 4. Customer-facing explanation
"Site visits are available Monday to Saturday between 10 am and 6 pm. I'll check what's free and suggest a time; I'll only book once you confirm. You'll meet our sales executive at the sales office on site, and please bring a photo ID."

## 5. Important conditions
- Never book on an ambiguous reply ("maybe", "let me see").
- Never state a slot is free without a live check.
- The agent books visits only — never an apartment.

## 6. Exceptions
- Requested slot taken → offer the nearest alternatives.
- Sunday or after-hours requests → explain the hours; record a callback request for special arrangements (REQUIRES_HUMAN_CONFIRMATION).
- Virtual tours: NOT_CONFIGURED.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Can I come Sunday?" | Not in default hours; callback for special request. |
| "Is a sample flat ready?" | REQUIRES_HUMAN_CONFIRMATION. |
| "Book Saturday 11 am" | Check live; propose; wait for explicit yes. |

## 8. What the AI agent can confidently answer
Visit hours, the booking steps, what to bring, cancellation.

## 9. What the AI must not claim
Slot availability without a live check, sample-flat readiness, Sunday visits.

## 10. Escalation
Special arrangements → **sales executive** (`ESC-01`); booking errors → **sales manager**.

Related documents: `ABC-GHR-KB-31`, `ABC-GHR-KB-44`, `ABC-GHR-KB-58`, `config/sales_policy.json`.

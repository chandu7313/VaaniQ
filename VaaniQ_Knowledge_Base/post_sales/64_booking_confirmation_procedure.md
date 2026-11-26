---
doc_id: ABC-GHR-KB-64
tenant_slug: abc-developers
document_title: "Booking Confirmation Procedure"
category: post_sales
subcategory: booking_confirmation
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
source_of_truth: "config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Booking Confirmation Procedure

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** Procedure is `SYNTHETIC_DEMO_ASSUMPTION`, `PENDING_REVIEW`. Apartment bookings are recorded in sales/CRM systems outside VaaniQ; VaaniQ records site-visit appointments only.

## 1. Purpose
Defines the internal steps between a customer's decision to buy and the issue of the allotment letter, so each booking is verified, documented and communicated consistently.

## 2. Business context
The booking is the moment the customer commits money. Errors here — wrong unit, wrong name, unclear receipt — cause long-lasting distrust. A checklist-driven procedure prevents them.

## 3. Procedure (SYNTHETIC_DEMO_ASSUMPTION)
| Step | Owner | Output |
|---|---|---|
| 1. Confirm unit is available in live inventory | Sales executive | Inventory hold for the unit |
| 2. Issue approved cost sheet for that unit | Sales executive | Signed cost sheet |
| 3. Receive token (₹1,00,000) by bank transfer or cheque | Accounts | Receipt |
| 4. Collect booking form and KYC (`ABC-GHR-KB-65`) | Sales executive | Completed application |
| 5. Verify documents and payment realisation | CRM and accounts | Verification note |
| 6. Receive booking amount (10%, token adjusted) | Accounts | Receipt |
| 7. Issue allotment letter (unit, parking, payment plan) | CRM team | Allotment letter |
| 8. Welcome communication and CRM relationship manager assigned | CRM team | Welcome email |
| 9. Schedule agreement execution | Legal / CRM | Agreement date |

### 3.1 Controls
- Name, unit number and amounts are checked by two people before the allotment letter is issued.
- No booking is confirmed until payment is realised.
- The 7-day token hold is tracked; expiry triggers a call before release.

| Field | Status |
|---|---|
| Allotment letter template | NOT_PROVIDED |
| Relationship manager assignment rules | NOT_CONFIGURED |

## 4. Customer-facing explanation
"Once your booking amount is received and your documents are verified, our CRM team issues an allotment letter with your unit, parking and payment plan, and introduces your relationship manager."

## 5. Important conditions
- The AI agent never confirms an apartment booking; it can only say the CRM team will confirm.
- Receipts are issued only by accounts.

## 6. Exceptions
- Payment dishonoured → booking not confirmed; CRM contacts customer.
- Discrepancy in KYC → booking paused until resolved.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is my flat booked?" | The CRM team confirms; AI does not. |
| "When do I get the allotment letter?" | After verification; timeline REQUIRES_HUMAN_CONFIRMATION. |

## 8. What the AI agent can confidently answer
The steps of booking confirmation.

## 9. What the AI must not claim
That a specific booking is confirmed, or timelines.

## 10. Escalation
Booking status → **CRM team** (`ESC-08`); payment disputes → `ESC-10`.

Related documents: `ABC-GHR-KB-31`, `ABC-GHR-KB-40`, `ABC-GHR-KB-65`.

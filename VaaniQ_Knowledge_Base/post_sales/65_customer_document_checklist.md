---
doc_id: ABC-GHR-KB-65
tenant_slug: abc-developers
document_title: "Customer Document Checklist"
category: post_sales
subcategory: documents
version: 1.0.0
status: active_demo
authority_level: 3
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
  - "seed:ABC Developers - NRI Buyer Guide"
source_of_truth: "config/sales_policy.json"
approval_status: PENDING_REVIEW
---
# Customer Document Checklist

> **FICTIONAL DEMONSTRATION DATA.** The checklist reflects documents commonly requested in Indian residential purchases (`SYNTHETIC_DEMO_ASSUMPTION` for this project). Lenders and the sub-registrar may require more. NRI-specific requirements follow applicable foreign-exchange rules and are confirmed by the legal team.

## 1. Purpose
Lists the documents a buyer should keep ready for booking, home-loan application and registration, including additional items for NRI buyers.

## 2. Business context
Missing documents are the most common cause of booking and loan delays. A clear checklist shared early speeds everything up.

## 3. Checklist
### 3.1 Booking (all buyers)
- Completed booking/application form.
- Passport-size photographs of each applicant.
- PAN card of each applicant.
- Identity proof (Aadhaar, passport, voter ID or driving licence).
- Address proof.
- Payment instrument details (bank transfer reference or cheque).

### 3.2 Home loan (typical lender requests)
- Income proof: salary slips and bank statements (salaried) or income-tax returns and financial statements (self-employed).
- Employment proof or business proof.
- Allotment letter and approved cost sheet.
- Lender's own application form.

### 3.3 Additional for NRI buyers
- Valid passport and visa / OCI card, as applicable.
- Overseas address proof.
- Payments through permitted banking channels (NRE/NRO accounts) as per applicable rules.
- Power of attorney for a resident representative, if the buyer will not be present (format confirmed by legal).

### 3.4 Registration
- Original identity documents of all parties.
- Witnesses as required by the sub-registrar.
- Stamp duty and registration fee as per law (amounts not quoted).

| Field | Status |
|---|---|
| NRI tax deduction requirements | REQUIRES_HUMAN_CONFIRMATION (tax adviser) |
| Joint-owner rules | REQUIRES_HUMAN_CONFIRMATION |

## 4. Customer-facing explanation
"For booking, keep your PAN, an ID and address proof, and photographs ready. If you're taking a loan, the bank will also ask for income documents. NRI buyers need their passport and payments through NRE or NRO accounts. Our sales team will share the full list."

## 5. Important conditions
- Never ask a customer to send identity documents through the AI chat.
- Never give tax advice.

## 6. Exceptions
- Company or trust purchases need additional documents (legal team).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "What documents for booking?" | Section 3.1. |
| "Can I send my Aadhaar here?" | No; share with the sales team through official channels. |
| "I'm an NRI; can I buy?" | Generally yes; section 3.3; legal confirms. |

## 8. What the AI agent can confidently answer
The checklist categories.

## 9. What the AI must not claim
Tax treatment, legal eligibility, or that the list is exhaustive.

## 10. Escalation
NRI legal questions → `ESC-02`; document help → **sales executive**.

Related documents: `ABC-GHR-KB-31`, `ABC-GHR-KB-33`, `ABC-GHR-KB-40`, `ABC-GHR-KB-64`.

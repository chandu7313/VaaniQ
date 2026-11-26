---
doc_id: ABC-GHR-KB-02
tenant_slug: abc-developers
document_title: "Company History and Business Model"
category: company
subcategory: history
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
supersedes: []
source_of_truth: "config/company_facts.json"
approval_status: PENDING_REVIEW
---
# Company History and Business Model

> **FICTIONAL DEMONSTRATION DATA.** ABC Developers is synthetic. History and business-model details below are `SYNTHETIC_DEMO_ASSUMPTION` unless marked CANONICAL; they illustrate how a developer of this kind typically operates and are not facts about any real organisation.

## 1. Purpose
This document explains how ABC Developers is described to have grown and how it makes money, so the agent can answer background questions ("how do you sell?", "do you sell through brokers?") consistently and without overstating anything.

## 2. Business context
Customers often judge a developer by its history before engaging. Because ABC Developers is fictional, the agent must keep historical answers short, clearly labelled as demonstration data, and free of claims that sound verifiable (awards, completion dates, litigation-free records).

## 3. Detailed information
### 3.1 Illustrative timeline (SYNTHETIC_DEMO_ASSUMPTION)
| Period | Milestone |
|---|---|
| 2009 | Company founded in Hyderabad. |
| 2009–2024 | Six earlier residential projects described as delivered (about 1,800 homes in total); project names, locations and completion dates are NOT_PROVIDED. |
| Current | GreenHaven Residences, Gachibowli (2BHK and 3BHK, Towers A and B). Possession date: NOT_PROVIDED. |

### 3.2 Business model
- **Product:** residential apartments sold before and during construction (CANONICAL business: residential apartment sales).
- **Revenue:** apartment sale consideration paid by buyers according to the payment plan in `ABC-GHR-KB-30`. Other income (for example clubhouse charges) is `NOT_PROVIDED`.
- **Sales model (SYNTHETIC_DEMO_ASSUMPTION):** direct sales through an in-house team, supported by the VaaniQ AI agent for first-level enquiries. Channel-partner or broker programmes are `NOT_CONFIGURED`.
- **Customer journey:** enquiry → qualification → site visit → unit selection → cost sheet → token → booking → agreement → construction updates → handover. Each step has its own document (see section 10).
- **Financing:** buyers arrange their own home loans; the company provides documentation support only (`ABC-GHR-KB-33`). No lender partnership is configured (`ABC-GHR-KB-34`).

### 3.3 Operating principles (SYNTHETIC_DEMO_ASSUMPTION)
1. Prices are communicated as indicative ranges until an approved cost sheet is issued.
2. Commitments (discounts, dates, legal statements) come only from authorised humans.
3. Customer data is used only for the purpose the customer agreed to (`ABC-GHR-KB-42`).

## 4. Customer-facing explanation
"ABC Developers was founded in 2009 in Hyderabad and sells homes directly to buyers through its own sales team; I'm the company's virtual assistant for first enquiries. This is a demonstration company, so I can share only the general background in our records. For anything more specific, a member of our sales team can help."

## 5. Important conditions
- Every historical statement must carry the demonstration-data caveat when spoken to a customer.
- The agent never describes the company's financial position, funding sources, land bank or partnerships, because none are provided.

## 6. Exceptions
- If the customer is a journalist, investor or researcher asking about corporate matters, the agent does not continue the sales script; it escalates to a sales executive for routing.
- If the customer cites a real-world news item about a company with a similar name, the agent states that ABC Developers here is fictional and it cannot comment.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Do you sell through brokers?" | Channel-partner programme NOT_CONFIGURED; sales are direct. |
| "Can I see your earlier projects?" | Names NOT_PROVIDED; offer escalation. |
| "Is the company financially stable?" | Not answerable; escalate (ESC-08). |
| "Why should I trust a builder I don't know?" | Explain the transparent process (indicative prices, written cost sheet, agreement) and offer a site visit; never claim guarantees. |

## 8. What the AI agent can confidently answer
- The illustrative founding year and track-record numbers, labelled as demonstration data.
- That the company sells directly and uses an AI assistant for first contact.
- The customer journey steps and where each is documented.

## 9. What the AI must not claim
- Awards, credit ratings, "zero litigation", "on-time delivery" records, funding or bank tie-ups.
- Completion dates of earlier projects, or that they are available to visit.

## 10. Escalation
Background questions that go beyond this document escalate to a **sales executive** (`ESC-08`). Corporate, financial or legal questions escalate to the **legal and compliance team** (`ESC-02`).

Related documents: `ABC-GHR-KB-01`, `ABC-GHR-KB-03`, `ABC-GHR-KB-44` (enquiry workflow).

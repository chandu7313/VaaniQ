---
doc_id: ABC-GHR-KB-01
tenant_slug: abc-developers
document_title: "Company Identity and Profile"
category: company
subcategory: identity
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
  - "seed:ABC Developers - Company Profile"
source_of_truth: "config/company_facts.json"
approval_status: PENDING_REVIEW
---
# Company Identity and Profile

> **FICTIONAL DEMONSTRATION DATA.** ABC Developers and GreenHaven Residences are synthetic entities created for a technical assessment of the VaaniQ AI sales agent. Nothing in this document describes a real company, project, person, address or regulatory record. Details marked `SYNTHETIC_DEMO_ASSUMPTION` are illustrative and were not verified; values marked `NOT_PROVIDED`, `NOT_CONFIGURED` or `REQUIRES_HUMAN_CONFIRMATION` are deliberately unknown.

## 1. Purpose
This document is the reference for "who is ABC Developers?" questions. It gives the AI sales agent and human staff one consistent description of the company's identity, current project and contact model, so that every customer hears the same answer. Structured values are mastered in `config/company_facts.json`; this text explains them.

## 2. Business context
ABC Developers is a residential real-estate developer that sells apartments directly to home buyers and investors. Its current (and only active) project in this knowledge base is **GreenHaven Residences** in **Gachibowli, Hyderabad, Telangana**, offering **2BHK and 3BHK** apartments in two fictional sample towers, **Tower A and Tower B**. Customers usually reach the company through enquiries handled first by the VaaniQ AI agent and then by human sales executives.

## 3. Company identity
| Attribute | Value | Status |
|---|---|---|
| Display name | ABC Developers | CANONICAL |
| Business | Residential apartment sales | CANONICAL |
| Current project | GreenHaven Residences, Gachibowli, Hyderabad | CANONICAL |
| Headquarters city | Hyderabad, Telangana | SYNTHETIC_DEMO_ASSUMPTION |
| Year founded | 2009 | SYNTHETIC_DEMO_ASSUMPTION |
| Projects delivered | 6 (illustrative) | SYNTHETIC_DEMO_ASSUMPTION |
| Homes delivered | about 1,800 (illustrative) | SYNTHETIC_DEMO_ASSUMPTION |
| Sales office | At the project site, Gachibowli | SYNTHETIC_DEMO_ASSUMPTION |
| Sales office hours | Monday–Saturday, 10:00–18:00 IST | SYNTHETIC_DEMO_ASSUMPTION |
| Registered legal name, CIN, GSTIN | — | NOT_PROVIDED |
| Phone number, e-mail, website | — | NOT_CONFIGURED |

The previously delivered projects are not named anywhere in this knowledge base; their names, locations and completion records are `NOT_PROVIDED`.

**Brand promise (positioning statement, SYNTHETIC_DEMO_ASSUMPTION):** "Well-planned homes, transparent information and a respectful buying experience." The promise describes intended behaviour; it is not a guarantee of any outcome.

## 4. Customer-facing explanation
"ABC Developers is a Hyderabad-based residential developer. Our current project is GreenHaven Residences in Gachibowli, with 2BHK and 3BHK apartments across Tower A and Tower B. Our sales office at the project site is open Monday to Saturday, 10 AM to 6 PM. Please note this is a demonstration company created for a technology assessment."

When speaking to a customer, the agent may mention the illustrative track record ("we have delivered six earlier projects") only together with the caveat that this is demonstration data, and it should not elaborate further because no details exist.

## 5. Important conditions
- The fictional-data disclaimer must not be removed from any customer-facing summary of the company.
- Contact channels (phone, e-mail, website) are `NOT_CONFIGURED`; the agent offers a callback or a site-office visit instead of inventing contact details.
- Corporate registration identifiers are `NOT_PROVIDED` and are never fabricated.

## 6. Exceptions
- If a customer asks about a different ABC-branded company, the agent explains it can only speak about ABC Developers and GreenHaven Residences.
- If a customer refers to a project other than GreenHaven Residences, the agent states that no information about other projects is available and offers escalation.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Who is the builder?" | ABC Developers, a Hyderabad-based residential developer (fictional demo). |
| "How old is the company?" | Founded 2009 (SYNTHETIC_DEMO_ASSUMPTION); state it is illustrative. |
| "Which projects have you completed?" | Names are NOT_PROVIDED; offer a call from the sales team. |
| "What is your company registration number?" | NOT_PROVIDED; escalate to an authorised representative. |
| "Where is your office?" | At the GreenHaven Residences site in Gachibowli; hours as above. |

## 8. What the AI agent can confidently answer
- The company name, its business, its current project, the locality and the configurations offered.
- Sales office hours and the fact that site visits can be arranged (see `ABC-GHR-KB-48`).
- That the company is fictional demonstration data.

## 9. What the AI must not claim
- Awards, rankings, ratings, delivery track records, legal names, registration numbers or financial strength.
- That previously delivered projects exist in any verifiable form.
- Any phone number, e-mail address or website.

## 10. Escalation
Escalate to a **sales executive** (escalation rule `ESC-08`, information not in the knowledge base) when a customer asks for corporate credentials, past-project references or contact details beyond the site office. Escalate legal-identity questions (CIN, GSTIN, registration) to the **legal and compliance team** under `ESC-02`. The agent tells the customer that a colleague will follow up, and does not guess.

Related documents: `ABC-GHR-KB-02` (history and business model), `ABC-GHR-KB-07` (project overview), `ABC-GHR-KB-06` (sales channels).

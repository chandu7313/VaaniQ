---
doc_id: ABC-GHR-KB-57
tenant_slug: abc-developers
document_title: "Amenities FAQ"
category: customer_support
subcategory: faq_amenities
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
source_of_truth: "config/*.json (FAQ answers restate structured records)"
approval_status: PENDING_REVIEW
---
# Amenities FAQ

> **FICTIONAL DEMONSTRATION DATA.** Amenities and hours are `SYNTHETIC_DEMO_ASSUMPTION` (`config/amenity_catalog.json`). Operational dates are `NOT_PROVIDED`; usage charges are `NOT_CONFIGURED`.

## 1. Purpose
Answers short amenity questions quickly and consistently, pointing to the detailed amenity documents.

## 2. Business context
Amenity questions are frequent and usually simple ("is there a pool?"). Short answers with the "planned" qualifier are enough.

## 3. Questions and answers
| Question | Answer |
|---|---|
| Is there a swimming pool? | Yes, planned, with a children's section; 6 am – 9 pm. |
| स्विमिंग पूल है क्या? / స్విమ్మింగ్ పూల్ ఉందా? (swimming pool, Hindi / Telugu) | Yes, a swimming pool is planned in the clubhouse, with a children's section; 6 am – 9 pm. |
| Is there a gym? | Yes, planned; 5:30 am – 10 pm. |
| Is there a clubhouse? | Yes, planned, about 25,000 sq.ft. |
| Is there a jogging track? | Yes, around the landscaped periphery; 5 am – 10 pm. |
| Is there a play area for kids? | Yes; children under 10 with an adult; 7 am – 8 pm. |
| Is there something for senior citizens? | A senior citizens' park with level walkways and benches. |
| Is there a badminton court? | Yes, indoor, bookable at the facility desk. |
| Is there a party hall? | A multipurpose hall bookable through the facility desk. |
| Is there a shop inside? | A third-party convenience store is planned. |
| Are amenities free? | Usage charges are not configured; any membership charge is on the cost sheet. |
| When will amenities be ready? | Not provided; the project team confirms in writing. |
| Is there a tennis court or theatre? | Not part of the current amenity list. |
| Power backup for amenities? | Yes, for common areas (`ABC-GHR-KB-13`). |

## 4. Customer-facing explanation
"The community is planned with a clubhouse of about 25,000 sq.ft, a pool with a kids' section, a gym, yoga deck, indoor badminton, a jogging track, a children's play area and a senior citizens' park. Opening dates and any charges will be confirmed by our team."

## 5. Important conditions
- "Planned" for every amenity; never "ready" or "free".

## 6. Exceptions
- Amenities not in the catalog are answered as "not part of the current list".

## 7. Common customer questions
The table above.

## 8. What the AI agent can confidently answer
The catalog list with hours and rules.

## 9. What the AI must not claim
Readiness, free use, unlisted amenities.

## 10. Escalation
Opening dates → `ESC-03`; charges → `ESC-05`.

Related documents: `ABC-GHR-KB-21`, `ABC-GHR-KB-22`, `ABC-GHR-KB-23`, `ABC-GHR-KB-24`.

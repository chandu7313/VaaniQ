---
doc_id: ABC-GHR-KB-61
tenant_slug: abc-developers
document_title: "Multilingual Sales Glossary"
category: customer_support
subcategory: glossary
version: 1.0.0
status: active_demo
authority_level: 3
data_classification: public
retrieval_scope: customer_facing
language: "en,hi,te"
fictional_demo_data: true
contains_synthetic_assumptions: false
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "config/*.json (FAQ answers restate structured records)"
approval_status: PENDING_REVIEW
---
# Multilingual Sales Glossary

> **FICTIONAL DEMONSTRATION DATA.** A trilingual glossary (English, Hindi, Telugu) of terms customers use, including common romanised forms. It improves understanding and retrieval for Hindi and Telugu queries. Translations are standard usage; project facts are not restated here.

## 1. Purpose
Maps how customers say real-estate terms in Hindi and Telugu (in script and in Roman letters) to the English terms used in the knowledge base.

## 2. Business context
Customers in Hyderabad mix languages freely ("3BHK flat ki price entha?"). Knowledge-base documents are in English. A shared glossary helps the agent recognise terms and answer in the customer's language with correct terminology.

## 3. Glossary
| English | Hindi (Devanagari / romanised) | Telugu (script / romanised) |
|---|---|---|
| apartment / flat | फ्लैट / flat | ఫ్లాట్ / flat; ఇల్లు / illu (home) |
| bedroom | बेडरूम, शयनकक्ष / bedroom | పడకగది / padakagadi |
| 2BHK / 3BHK | टू बीएचके / do BHK, teen BHK | రెండు / మూడు BHK / rendu, moodu BHK |
| built-up area | बिल्ट-अप एरिया / built-up area | బిల్ట్-అప్ విస్తీర్ణం / built-up vistheernam |
| carpet area | कार्पेट एरिया / carpet area | కార్పెట్ ఏరియా / carpet area |
| square feet | वर्ग फुट / sq ft | చదరపు అడుగులు / chadarapu adugulu |
| price | कीमत, दाम / keemat, daam | ధర / dhara |
| how much | कितना / kitna | ఎంత / entha |
| budget | बजट / budget | బడ్జెట్ / budget |
| lakh / crore | लाख / करोड़ — lakh / crore | లక్ష / కోటి — laksha / koti |
| discount | छूट, डिस्काउंट / chhoot | డిస్కౌంట్, తగ్గింపు / thaggimpu |
| site visit | साइट विज़िट / site visit | సైట్ విజిట్ / site visit |
| booking | बुकिंग / booking | బుకింగ్ / booking |
| token amount | टोकन राशि / token amount | టోకెన్ మొత్తం / token mottham |
| possession | पज़ेशन, कब्ज़ा / possession | పొజెషన్, స్వాధీనం / swaadheenam |
| home loan | होम लोन, गृह ऋण / home loan | గృహ రుణం / gruha runam |
| EMI | ईएमआई / EMI | ఈఎంఐ / EMI |
| amenities | सुविधाएँ / suvidhaayein | సౌకర్యాలు / soukaryalu |
| swimming pool | स्विमिंग पूल / swimming pool | ఈత కొలను / eetha kolanu |
| parking | पार्किंग / parking | పార్కింగ్ / parking |
| floor (storey) | मंज़िल / manzil | అంతస్తు / anthasthu |
| east-facing | पूर्वमुखी / east facing | తూర్పు ముఖం / thoorpu mukham |
| registration | पंजीकरण, रजिस्ट्री / registry | రిజిస్ట్రేషన్ / registration |
| maintenance | रखरखाव, मेंटेनेंस / maintenance | నిర్వహణ / nirvahana |
| cancellation / refund | रद्द / रिफ़ंड — radd / refund | రద్దు / వాపసు — raddu / vaapasu |
| appointment | अपॉइंटमेंट / appointment | అపాయింట్‌మెంట్ / appointment |
| tomorrow / Saturday | कल / शनिवार — kal / shanivaar | రేపు / శనివారం — repu / shanivaaram |
| yes / no | हाँ / नहीं — haan / nahi | అవును / కాదు — avunu / kaadu |
| Gachibowli, Hyderabad | गाचीबोवली, हैदराबाद | గచ్చిబౌలి, హైదరాబాద్ |

### 3.1 Notes
- Hindi "kal" can mean yesterday or tomorrow; in booking context the agent confirms the date explicitly.
- Numbers are often spoken in English ("ninety lakh") even in Hindi or Telugu sentences.

## 4. Customer-facing explanation
Used internally to interpret and phrase answers; the agent replies in the customer's language.

## 5. Important conditions
- Translation must not change meaning: "built-up" is never translated as carpet or usable area.
- Qualifiers ("indicative", "base price") are translated, not dropped.

## 6. Exceptions
- Regional variants exist; when unsure, the agent asks a clarifying question.

## 7. Common customer questions
"3BHK ki price kitni hai?", "ఫ్లాట్ ధర ఎంత?", "साइट विज़िट कब कर सकते हैं?"

## 8. What the AI agent can confidently answer
Term mapping.

## 9. What the AI must not claim
Facts that are not in the referenced documents.

## 10. Escalation
Language not supported → offer English, Hindi or Telugu; else `ESC-01`.

Related documents: `ABC-GHR-KB-62`, `ABC-GHR-KB-63`, `ABC-GHR-KB-60`.

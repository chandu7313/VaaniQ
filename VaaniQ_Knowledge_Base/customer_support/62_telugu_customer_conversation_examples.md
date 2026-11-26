---
doc_id: ABC-GHR-KB-62
tenant_slug: abc-developers
document_title: "Telugu Customer Conversation Examples"
category: customer_support
subcategory: examples_te
version: 1.0.0
status: active_demo
authority_level: 4
data_classification: internal
retrieval_scope: agent_internal
language: "te,en"
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
# Telugu Customer Conversation Examples

> **FICTIONAL DEMONSTRATION DATA — INTERNAL GUIDANCE (authority level 4).** Example Telugu conversations with English glosses. Facts used: 3BHK ≈1,560 sq.ft built-up at ₹89.5–92 lakh and 2BHK ≈1,180 sq.ft built-up at ₹67.5–69 lakh (CANONICAL, indicative base prices). Slot times are illustrative; real slots come from live availability.

## 1. Purpose
Shows how the agent should answer in natural Telugu while keeping every qualifier, unknown and escalation rule intact.

## 2. Business context
Many Hyderabad customers prefer Telugu, often mixed with English words (flat, budget, site visit). Answers should sound natural, not like literal translations, and must not lose "built-up", "indicative" or "taxes extra".

## 3. Example conversations
### 3.1 3BHK enquiry and site visit
**కస్టమర్:** నమస్కారం, నేను గచ్చిబౌలిలో 3BHK ఫ్లాట్ కోసం చూస్తున్నాను. నా బడ్జెట్ సుమారు 90 లక్షలు.
*(Hello, I'm looking for a 3BHK flat in Gachibowli. My budget is about 90 lakh.)*

**ఏజెంట్:** నమస్కారం! గ్రీన్‌హేవెన్ రెసిడెన్సెస్‌లో 3BHK బిల్ట్-అప్ విస్తీర్ణం సుమారు 1,560 చదరపు అడుగులు. సూచనాత్మక బేస్ ధర ₹89.5 లక్షల నుండి ₹92 లక్షల వరకు. అదనపు ఛార్జీలు, పన్నులు వేరుగా ఉంటాయి. మీ బడ్జెట్ బేస్ ధర పరిధిలో ఉంది. సైట్ విజిట్ ఏర్పాటు చేయమంటారా?
*(The 3BHK is about 1,560 sq.ft built-up; indicative base price ₹89.5–92 lakh; additional charges and taxes extra; your budget is within the base range. Shall I arrange a site visit?)*

**కస్టమర్:** శనివారం ఉదయం వీలవుతుందా?
**ఏజెంట్:** శనివారం ఉదయం 11 గంటలకు స్లాట్ ఖాళీగా ఉంది. బుక్ చేయమంటారా?
**కస్టమర్:** అవును, బుక్ చేయండి.
**ఏజెంట్:** బుక్ అయింది: శనివారం ఉదయం 11 గంటలకు, గచ్చిబౌలిలోని సేల్స్ ఆఫీస్‌లో. దయచేసి ఫోటో ఐడీ తీసుకురండి.
*(Booked only after the explicit "అవును, బుక్ చేయండి".)*

### 3.2 Carpet area (unknown)
**కస్టమర్:** కార్పెట్ ఏరియా ఎంత?
**ఏజెంట్:** కార్పెట్ ఏరియా వివరాలు నా దగ్గర లేవు. 1,560 చదరపు అడుగులు బిల్ట్-అప్ విస్తీర్ణం. ఆమోదించిన ప్లాన్ ప్రకారం మా సేల్స్ టీమ్ కార్పెట్ ఏరియాను ధృవీకరిస్తుంది.
*(I don't have the carpet area; 1,560 is built-up; the sales team confirms from the approved plan.)*

### 3.3 2BHK price
**కస్టమర్:** 2BHK ధర ఎంత?
**ఏజెంట్:** 2BHK సూచనాత్మక బేస్ ధర ₹67.5 లక్షల నుండి ₹69 లక్షల వరకు, బిల్ట్-అప్ విస్తీర్ణం సుమారు 1,180 చదరపు అడుగులు. అదనపు ఛార్జీలు, పన్నులు వేరు.

### 3.4 Discount
**కస్టమర్:** ఏదైనా డిస్కౌంట్ ఉందా?
**ఏజెంట్:** ధరపై చర్చించడం లేదా డిస్కౌంట్ ఇవ్వడం నేను చేయలేను. మా సేల్స్ మేనేజర్ మీకు కాల్ చేసేలా ఏర్పాటు చేయగలను.

### 3.5 RERA, possession, loan
**కస్టమర్:** RERA నంబర్ ఏమిటి? పొజెషన్ ఎప్పుడు?
**ఏజెంట్:** RERA రిజిస్ట్రేషన్ వివరాలు నా ధృవీకరించిన సమాచారంలో లేవు; మా లీగల్ అండ్ కంప్లయన్స్ టీమ్ అధికారిక వివరాలు ఇస్తుంది. పొజెషన్ తేదీని ప్రాజెక్ట్ టీమ్ మాత్రమే లిఖితపూర్వకంగా ధృవీకరిస్తుంది.

**కస్టమర్:** నాకు లోన్ వస్తుందా?
**ఏజెంట్:** లోన్ ఆమోదం బ్యాంక్ మాత్రమే నిర్ణయిస్తుంది. పత్రాల విషయంలో మా సేల్స్ టీమ్ సహాయం చేస్తుంది.

## 4. Customer-facing explanation
The agent replies in Telugu when the customer writes or speaks Telugu.

## 5. Important conditions
- Keep "బిల్ట్-అప్", "సూచనాత్మక బేస్ ధర" and "పన్నులు వేరు" in every relevant answer.
- Book only after an explicit "అవును" to a specific slot.

## 6. Exceptions
- Mixed Telugu-English input is normal; reply in the dominant language.

## 7. Common customer questions
"ధర ఎంత?", "కార్పెట్ ఏరియా?", "సైట్ విజిట్ ఎప్పుడు?", "డిస్కౌంట్ ఉందా?", "లోన్ వస్తుందా?"

## 8. What the AI agent can confidently answer
The same facts as English documents, in Telugu.

## 9. What the AI must not claim
Anything the English sources do not support.

## 10. Escalation
Same routes as English: `ESC-02`, `ESC-03`, `ESC-04`, `ESC-07`, `ESC-08`.

Related documents: `ABC-GHR-KB-51`, `ABC-GHR-KB-61`, `ABC-GHR-KB-63`.

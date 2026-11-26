---
doc_id: ABC-GHR-KB-63
tenant_slug: abc-developers
document_title: "Hindi Customer Conversation Examples"
category: customer_support
subcategory: examples_hi
version: 1.0.0
status: active_demo
authority_level: 4
data_classification: internal
retrieval_scope: agent_internal
language: "hi,en"
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
# Hindi Customer Conversation Examples

> **FICTIONAL DEMONSTRATION DATA — INTERNAL GUIDANCE (authority level 4).** Example Hindi conversations with English glosses. Facts used: 3BHK ≈1,560 sq.ft built-up at ₹89.5–92 lakh and 2BHK ≈1,180 sq.ft built-up at ₹67.5–69 lakh (CANONICAL, indicative base prices). Slot times are illustrative.

## 1. Purpose
Shows natural Hindi answers that preserve every qualifier, unknown and escalation rule.

## 2. Business context
Hindi-speaking customers, including many professionals who have moved to Hyderabad, often mix Hindi and English ("3BHK ka budget 90 lakh hai"). The agent's Hindi must be polite (आप form) and gender-neutral about itself.

## 3. Example conversations
### 3.1 3BHK enquiry and site visit
**ग्राहक:** नमस्ते, मुझे गाचीबोवली में 3BHK फ्लैट चाहिए, बजट लगभग 90 लाख है।
*(Hello, I want a 3BHK flat in Gachibowli; budget about 90 lakh.)*

**एजेंट:** नमस्ते! ग्रीनहेवन रेज़िडेंसेज़ में 3BHK का बिल्ट-अप एरिया लगभग 1,560 वर्ग फुट है। सांकेतिक बेस प्राइस ₹89.5 लाख से ₹92 लाख है; अतिरिक्त शुल्क और टैक्स अलग से हैं। आपका बजट बेस प्राइस रेंज में है। क्या साइट विज़िट तय करें?

**ग्राहक:** शनिवार सुबह हो सकता है?
**एजेंट:** शनिवार सुबह 11 बजे का स्लॉट उपलब्ध है। क्या इसे बुक कर दिया जाए?
**ग्राहक:** हाँ, बुक कर दीजिए।
**एजेंट:** बुक हो गया: शनिवार सुबह 11 बजे, गाचीबोवली स्थित सेल्स ऑफ़िस में। कृपया फ़ोटो आईडी साथ लाएँ।
*(Booked only after the explicit "हाँ, बुक कर दीजिए".)*

### 3.2 Carpet area (unknown)
**ग्राहक:** कार्पेट एरिया कितना है?
**एजेंट:** कार्पेट एरिया की जानकारी मेरे पास नहीं है। 1,560 वर्ग फुट बिल्ट-अप एरिया है। स्वीकृत प्लान से हमारी सेल्स टीम कार्पेट एरिया की पुष्टि करेगी।

### 3.3 2BHK price
**ग्राहक:** 2BHK की कीमत क्या है?
**एजेंट:** 2BHK का सांकेतिक बेस प्राइस ₹67.5 लाख से ₹69 लाख है, बिल्ट-अप एरिया लगभग 1,180 वर्ग फुट। अतिरिक्त शुल्क और टैक्स अलग से।

### 3.4 Discount
**ग्राहक:** कोई डिस्काउंट मिलेगा?
**एजेंट:** कीमत पर मोलभाव या डिस्काउंट देना मेरे अधिकार में नहीं है। हमारे सेल्स मैनेजर आपसे बात कर सकते हैं; क्या कॉल तय करें?

### 3.5 RERA, possession, loan
**ग्राहक:** RERA नंबर क्या है? पज़ेशन कब मिलेगा?
**एजेंट:** RERA पंजीकरण की जानकारी मेरी सत्यापित जानकारी में नहीं है; हमारी लीगल और कंप्लायंस टीम आधिकारिक विवरण देगी। पज़ेशन की तारीख़ केवल प्रोजेक्ट टीम लिखित रूप में बताती है।

**ग्राहक:** क्या मेरा लोन मंज़ूर होगा?
**एजेंट:** लोन की मंज़ूरी केवल बैंक तय करता है। दस्तावेज़ों में हमारी सेल्स टीम मदद कर सकती है।

## 4. Customer-facing explanation
The agent replies in Hindi when the customer uses Hindi.

## 5. Important conditions
- Keep "बिल्ट-अप", "सांकेतिक बेस प्राइस" and "टैक्स अलग" in every relevant answer.
- Confirm dates explicitly: "कल" may be ambiguous.

## 6. Exceptions
- Hinglish input is normal; reply in Hindi unless the customer prefers English.

## 7. Common customer questions
"कीमत क्या है?", "कार्पेट एरिया?", "साइट विज़िट कब?", "डिस्काउंट मिलेगा?", "लोन मिलेगा?"

## 8. What the AI agent can confidently answer
The same facts as English documents, in Hindi.

## 9. What the AI must not claim
Anything the English sources do not support.

## 10. Escalation
Same routes as English: `ESC-02`, `ESC-03`, `ESC-04`, `ESC-07`, `ESC-08`.

Related documents: `ABC-GHR-KB-51`, `ABC-GHR-KB-61`, `ABC-GHR-KB-62`.

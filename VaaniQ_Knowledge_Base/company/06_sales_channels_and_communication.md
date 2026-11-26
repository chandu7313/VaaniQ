---
doc_id: ABC-GHR-KB-06
tenant_slug: abc-developers
document_title: "Sales Channels and Communication"
category: company
subcategory: channels
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
# Sales Channels and Communication

> **FICTIONAL DEMONSTRATION DATA.** Channel availability below reflects what the demonstration application actually provides. Unconfigured channels are marked `NOT_CONFIGURED`; illustrative practices are `SYNTHETIC_DEMO_ASSUMPTION`.

## 1. Purpose
Lists the channels customers can use to reach ABC Developers, what each channel can do, and the communication rules that apply. It stops the AI from promising a channel that does not exist (for example WhatsApp confirmations).

## 2. Business context
VaaniQ is the first point of contact. The demonstration application supports voice and text conversations in the browser, an admin console for staff and a public customer page. Telephony and messaging integrations are planned but not built.

## 3. Channel catalogue
| Channel | Status | What it supports |
|---|---|---|
| Public customer page (browser) | Available | Voice or text conversation with the AI agent, project highlights, site-visit booking |
| Browser voice (speech-to-text / text-to-speech) | Available, browser-dependent | English, Hindi, Telugu; server transcription fallback when the browser cannot recognise speech |
| Admin console | Available (staff only) | Leads, appointments, knowledge base, conversations, analytics |
| Site office visit | Available (SYNTHETIC_DEMO_ASSUMPTION) | Monday–Saturday, 10:00–18:00 IST |
| Phone callback by a sales executive | Process defined (SYNTHETIC_DEMO_ASSUMPTION) | Escalated and hot leads |
| Phone number, e-mail address, website | NOT_CONFIGURED | — |
| WhatsApp / SMS confirmations | NOT_CONFIGURED | Planned; never promise them |
| Telephony (inbound calls to the AI) | NOT_CONFIGURED | Planned |
| Channel partners / brokers | NOT_CONFIGURED | — |

## 4. Communication rules
1. **Language:** reply in the customer's chosen language. Proper names (GreenHaven Residences, ABC Developers, Tower A, Tower B), unit types (2BHK, 3BHK) and numbers keep their original form (see `ABC-GHR-KB-61`).
2. **Confirmation:** a booked site visit is confirmed on screen with its date, time and reference code. No message is sent to the customer's phone, because messaging is NOT_CONFIGURED.
3. **Contact consent:** a sales executive calls only customers who shared a number and agreed to a callback (`ABC-GHR-KB-42`).
4. **Calling hours (SYNTHETIC_DEMO_ASSUMPTION):** human callbacks between 10:00 and 19:00 IST, Monday–Saturday.
5. **Records:** every AI conversation is stored with its transcript, sentiment and decision trace; staff conversations are logged in the CRM.
6. **No audio storage:** VaaniQ never stores voice recordings. In the server-transcription fallback a short clip is transcribed in memory and discarded.

## 5. Customer-facing explanation
"You can talk to me here by voice or text in English, Hindi or Telugu. I can arrange a site visit, and a sales executive can call you back if you share your number. Our office at the project site is open Monday to Saturday, 10 AM to 6 PM."

## 6. Important conditions
- Voice quality depends on the customer's browser and installed voices; typing is always available.
- Hindi and Telugu replies are spoken only if the customer's device has those voices installed.

## 7. Exceptions
- If a customer asks for a WhatsApp or SMS confirmation, the agent explains the confirmation is shown on screen (with a reference) and that a sales executive can confirm by phone.
- Customers who ask not to be contacted are flagged and excluded from callbacks (`ESC-09`).

## 8. Common customer questions
| Question | Answer approach |
|---|---|
| "Can you WhatsApp me the details?" | Not available; offer on-screen summary and a callback. |
| "What is your phone number?" | NOT_CONFIGURED; offer a callback instead. |
| "Can I talk to you in Telugu?" | Yes. |

## 9. What the AI agent can confidently answer / must not claim
**Can answer:** available channels, languages, office hours, how confirmations work.
**Must not claim:** any phone number, e-mail, website, WhatsApp/SMS message, or that a message "has been sent".

## 10. Escalation
Requests for unavailable channels → **sales executive** callback (`ESC-01`). Requests to stop contact → **data protection contact** (`ESC-09`).

Related documents: `ABC-GHR-KB-05`, `ABC-GHR-KB-42`, `ABC-GHR-KB-48`, `ABC-GHR-KB-61`.

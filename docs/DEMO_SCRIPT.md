# VaaniQ Live Demo Script (about 7 minutes)

## Before the demo (5 min)
```bash
cd backend && npm run db:reset -- --yes
```
```bash
cd backend && npm run dev
```
```bash
cd frontend && npm run dev
```
Open http://localhost:5173 in **Chrome or Edge** (best Web Speech support) and allow the microphone. Sign in as `admin@abcdevelopers.demo`. Optional: open DevTools → Network to show real API calls.

Have a backup ready: if the mic misbehaves, type, or click the "Try the demo scenario" box. Voice is an input method, not a dependency.

## 1. Frame it (30 s)
"VaaniQ is an AI sales employee. The company, ABC Developers, and all data are fictional: see the banner. The badge says **DEMO_MODE**: no LLM key is configured, so understanding is rule-based and answers are quoted from documents. With a key, the same pipeline uses Groq or Gemini, and business actions stay identical."

## 2. Knowledge base (45 s)
Knowledge Base → open *Pricing and Payment Plans* → show the chunks and sections.
Retrieval tester: `What is the price of a 3BHK?` → the Pricing document ranks first with BM25 and relevance scores.
"The agent may only answer from here. Anything below 0.20 relevance is ignored."

## 3. The scenario call (3 min)
AI Voice Agent → English → **Start call** (the greeting is spoken). Click the mic and say, or click the sample:
> I am looking for a 3BHK apartment in Gachibowli. My budget is around ₹90 lakhs. I am planning to purchase within the next month. Can you tell me about the project and arrange a site visit?

Point at:
- **Lead record:** 3BHK, Gachibowli, ₹90 lakh, 1 month; Decision and Purpose show "not stated" (nothing invented).
- **Score 74/100 (warm)** with reasons: budget 25/25 because ₹90L fits ₹88–115L; authority 0/15, listed under missing information.
- **Citations** under the reply. **Real slots** read from the calendar.
- **Decision trace:** intent `request_visit` + secondary intents, entities, BM25 hits, three validated tool calls (`updateLead`, `searchKnowledge`, `checkAvailability`).

Click slot 1 (or say "the first one"). The agent asks for name and number. Say: *"My name is Kiran Rao, number 98123 45670."*
- It now shows **"Awaiting customer confirmation… Nothing is booked until the customer says yes."** Open Appointments in a new tab: no booking exists yet.

Say **"Yes, please confirm."**
- Trace: proposal `confirmed_by_customer`; `bookAppointment` passed **tool registered → arguments valid → customer confirmed this exact proposal**.
- Score → **77 (hot)**, status → *Visit scheduled*. The agent asks the missing qualification question (decision-maker).

Say: *"My wife and I will decide together. Is there a swimming pool? This is great!"*
- Authority 10/15, and "swimming pool" is captured as a preference (+4 requirement clarity) → **91**; sentiment **positive** with evidence "great"; the pool answer cites *Amenities › Clubhouse and sports*.

Click **End call & summarise** → a structured summary with requirements, outcome, sentiment trend and recommended next actions, saved to `call_summaries`.

## 4. Safety moments (1 min, pick two)
- **Unknown info:** new call → *"Do you have a helipad?"* → "I do not have verified information…", no citation.
- **Human escalation:** *"I want to talk to a human"* → status `escalated`.
- **Decline:** at a confirmation prompt say *"No, a different time"* → nothing is booked.
- **Hindi:** switch to हिन्दी, click the sample → Hindi reply, entities extracted from Devanagari, slots offered in Hindi.

## 5. Back office (1 min)
- **Appointments:** the visit, with Reschedule (live free slots), Completed, No-show, Cancel.
- **Leads:** open Kiran Rao → profile, score reasons, conversation, summary; change status.
- **Analytics / Dashboard:** live SQL numbers. The tool reliability table shows every tool call and its success rate.
- **Agent Trace:** every turn of every call is auditable.

## 6. Close (30 s)
"The model understands language; the backend owns every business action through validated tools, explicit consent, transactions and a database constraint. Everything is traceable. Scaling and the security roadmap are in the docs."

## If something goes wrong
| Symptom | Fix |
|---|---|
| Mic button missing | Browser lacks Web Speech: type instead (designed fallback) |
| "Microphone permission was denied" | Allow the mic in the site settings, or type |
| No Telugu voice | The UI says so; replies still show as text |
| `Cannot reach the VaaniQ server` | Backend not running; check `npm run dev` in backend |
| "That slot was just taken" | Correct behaviour: the agent re-offers fresh slots |

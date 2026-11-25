# VaaniQ: 5-Minute Product Demo

Every step below was run against the current build. Lines in *italics* are what to say.

## Setup (before the audience joins, about 3 minutes)
1. Point `DATABASE_URL` in `.env` at a reachable database (local: `postgres://vaaniq@localhost:5433/vaaniq`; Supabase: the **Session pooler** URL plus `DATABASE_SSL=require`).
2. Clean data and start:
   ```bash
   cd backend && npm run db:reset -- --yes
   ```
   ```bash
   cd backend && npm run dev
   ```
   ```bash
   cd frontend && npm run dev
   ```
3. Open http://localhost:5173 in **Chrome or Edge**, allow the microphone, and sign in as `admin@abcdevelopers.demo`.
4. **Settings & Language → Test AI connection.** `demo_mode` means rule-based answers; `ok` means a live LLM (only if you put a key in `.env`). Either works for the demo. Say which one is running.
5. Open a second tab on **Appointments** (it should show no upcoming visits).

Fallback plan: if the mic misbehaves, click the "Try the demo scenario" box or type. Voice is an input method, not a dependency.

---

## 0:00–0:30 · 1. Problem statement
*"Property enquiries come in at all hours and in several languages. Sales teams reply late, qualify inconsistently and book visits by hand. VaaniQ is a digital sales employee: it talks to customers, answers only from verified company documents, qualifies the lead transparently, and books a visit only after the customer says yes. Everything is saved and auditable. The company here, ABC Developers, is fictional: see the banner."*

## 0:30–1:45 · 2. Customer voice conversation + 3. RAG answer with source
**AI Voice Agent** → English → **Start call** (the greeting is spoken; the status pill shows *Speaking…*). Click the mic (*Listening…*) and say:
> I am looking for a 3BHK apartment in Gachibowli. My budget is around ₹90 lakhs. I am planning to purchase within the next month. Can you tell me about the project and arrange a site visit?

Point at:
- The **live transcript**, then the reply with **source chips** (*Project Overview › Apartment configurations*).
- *"The answer comes only from retrieved documents. If nothing relevant is found, it says it doesn't know instead of guessing."*
- **Appointment status:** *Free slots offered*, read from the real calendar.

(Optional, 10 s) Type *"Do you have a helipad?"* to show the "no verified information" reply with no sources.

## 1:45–2:30 · 4. Lead qualification
Right-hand panel:
- **Lead record:** 3BHK, Gachibowli, ₹90 lakh, 1 month. *Decision: not stated*. *"Nothing is invented."*
- **Score 74/100 (warm):** budget 25/25 *"because ₹90 lakh fits the 3BHK range of ₹88–115 lakh"*, authority 0/15 listed under *Missing information*.
- **Recommended next action**, and **sentiment** (*"from the transcript text, not voice tone"*).

## 2:30–3:30 · 5. Appointment booking
1. Click the first slot (or say *"the first one"*). The agent asks for name and number.
2. Say *"My name is Kiran Rao, my number is 98123 45670."* Appointment status becomes **Proposed: NOT booked until the customer says yes**.
3. Switch to the Appointments tab and refresh: *"still nothing booked. A proposal is not an appointment."*
4. Back on the agent, say **"Yes, please confirm."** The reply gives the confirmed time and a reference; the status is **Booked and confirmed**; the score rises to **77 (hot)**.

## 3:30–4:00 · 6. CRM persistence
- Refresh **Appointments**: the visit is there, with Reschedule, Completed, No-show and Cancel.
- **Leads** → open *Kiran Rao*: profile, score reasons with evidence, the conversation.
- Back on the agent, click **End call & summarise**. The structured summary (requirements, buying intent, appointment outcome, next actions) is *"saved in PostgreSQL"*.

## 4:00–4:30 · 7. Decision Trace
**Agent Decision Trace** → open the booking turn:
- The **summary line** and **execution events** (memory → intent → tool → scoring → output validated, with millisecond offsets).
- The **structured proposal**, *confirmed by customer*.
- `bookAppointment` passed **tool registered → arguments valid → actor authorized → resources belong to tenant → customer confirmed this exact proposal**.
- *"We record evidence, not hidden model reasoning, and phone numbers are masked."*

## 4:30–5:00 · 8. Scalability and commercial value
*"The API is stateless (memory lives in PostgreSQL), so it scales horizontally behind a load balancer, with PgBouncer, Redis and queues as the next steps. Capacity is sized by concurrent calls, not registered users, and LLM rate limits are the main constraint. We haven't load-tested it, so I won't quote throughput. Commercially, it's multi-tenant and industry-agnostic beyond the knowledge base: per-seat or per-conversation SaaS, where the main running cost is LLM tokens per turn."*

Close: *"Safety comes from the architecture: the model understands language, but only validated, authorized, consented backend tools change data, and every step is traceable."*

---

## If asked to show more (extra time)
- **Hindi or Telugu:** switch language and click the sample. The reply comes in that language, with entities extracted from native script.
- **Conflict:** start a new call, get a proposal, book the same slot from Appointments for another lead, then say "yes". The agent says the slot was just taken and re-offers free slots.
- **Executive Dashboard / Call Intelligence:** live SQL numbers, sentiment distribution, pipeline, tool reliability.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Mic button missing | The browser lacks Web Speech: type (designed fallback) |
| "Microphone permission was denied" | Allow the mic in the address bar, press **Retry**, or type |
| "No Telugu voice installed" | Expected on some systems; replies still appear as text |
| "Cannot reach the VaaniQ server" | Backend not running: `cd backend && npm run dev` |
| Health shows `DB_UNAVAILABLE` | `DATABASE_URL` unreachable (see Setup step 1) |
| "That slot was just taken" | Correct behaviour: pick one of the re-offered slots |

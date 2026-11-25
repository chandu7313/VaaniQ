# VaaniQ QA & Security Audit

**Date:** 2026-11-26 · **Scope:** frontend, backend, PostgreSQL, AI provider, voice, security, reliability.
**Method:** automated tests (96, all executed), live probes against running servers, a live Groq run, browser checks in the app's browser pane, log and repository scans. Nothing below is claimed unless it was executed. Untested items are listed at the end.

## 1. Defects found and fixed (prioritized)

| # | Severity | Defect | Fix | Proof |
|---|---|---|---|---|
| 1 | **Critical** | A real Groq API key and the Supabase DB password were in `.env.example` (committed file) and had entered local commit `a1aa6b7`. **Never pushed.** | Restored placeholders; amended the unpushed commit (`042e760`); verified no reachable commit contains them | `git` scan of all reachable commits: 0 matches |
| 2 | High | Valid LLM analysis rejected whenever the model sent `"sentiment": null`, so every live turn silently fell back to rules | Schema accepts `null` as "absent" | live Groq: `analysis=rules+llm`; test `LLM analysis with null fields` |
| 3 | High | LLM could state figures not in the sources (live: it applied a discount itself, "Rs 86–113 lakh") | Prompt forbids calculating; **numeric grounding guard** replaces such answers with the verbatim source | test `grounding guard`; live re-run: no ungrounded figures |
| 4 | High | "three bedroom" didn't match "3BHK" in retrieval, so a pricing question got "no verified information" | Tokenizer normalises `three bedroom` / `3 bed room` / `3-bhk` → `3bhk` | test; live: Price list cited |
| 5 | Medium | Two simultaneous messages on one conversation (double-click/retry) could interleave state; a duplicate "yes" produced a confusing "booking failed" | Same-conversation turns serialized | test: 2 concurrent "yes" → 1 booking, turns 1–4 sequential |
| 6 | Medium | Database outage returned an opaque `500 Unexpected server error` | Mapped to `503 SERVICE_UNAVAILABLE` with a clear message | test; live probe on a dead DB port |
| 7 | Medium | Rate-limit responses were plain text: the UI could only show "Request failed (429)" | JSON envelope `RATE_LIMITED` / `TOO_MANY_LOGIN_ATTEMPTS`; failed logins only count | test; live probe |
| 8 | Medium | No way to verify AI-provider connectivity | `GET /api/llm/health` + "Test AI connection" button in Settings | tests (demo/ok/down) |
| 9 | Low | `GET /conversations/:id/traces` returned `200 []` for other tenants' / unknown ids (no data, but inconsistent) | Ownership check → 404 | cross-tenant test |
| 10 | Low | Invalid-JSON warnings logged a snippet of model output (could echo customer text) | Log only "LLM returned invalid JSON" | test output |
| 11 | Low | LLM replies contained markdown (`**`) and line breaks, which TTS reads literally | Normalised to one plain paragraph | test + live |
| 12 | Low | Three pages overflowed horizontally on phones (grid `min-width:auto`) | `min-w-0` on cards and grid columns | DOM measurement: 9/9 pages fit at 375 and 768 px |
| 13 | Low | Daily analytics bucketed in the DB server's timezone (UTC in Docker/Supabase) | Explicit `Asia/Kolkata` bucketing | test suite; dashboard check |
| 14 | Low | Page transition could leave content transparent in background tabs | Motion-only animation (never hides content) | browser screenshots |

Earlier sessions fixed (also covered by tests): tokens valid after user deletion, wrong extractive sentence (2BHK for a 3BHK question), "This is great" parsed as a name, follow-up over-expansion, the `rs` tokenizer bug, Indic name truncation.

## 2. Feature verification (demonstrably working)

| Area | Status | Evidence |
|---|---|---|
| 1 Frontend build | ✅ | `vite build` OK; ESLint 0 problems |
| 2 Backend startup | ✅ | `server_started` + `database_connected` logs |
| 3 PostgreSQL connectivity | ✅ | `/api/health` 200; outage → 503 (probe) |
| 4 Authentication | ✅ | wrong password and unknown user give the same 401; bad/missing token 401; deleted user's token 401 |
| 5 API validation | ✅ | Zod on every body/param/query; 400 envelope; strict schemas reject computed fields |
| 6 AI provider connectivity | ✅ Groq live · ⚠️ Gemini adapter-tested only | live run; adapter tests incl. 429/timeout/empty |
| 7 RAG retrieval | ✅ | BM25 top-3, threshold, follow-up context, multilingual expansion |
| 8 Source attribution | ✅ | document + section + relevance on replies and in traces |
| 9 Conversation memory | ✅ | follow-ups, budget change, session isolation tests |
| 10 Multilingual text | ✅ | EN/HI/TE extraction, templates, LLM answers |
| 11 Speech availability/fallback | ✅ denied path live · ⚠️ unsupported path code-reviewed | alert + Retry, typing works |
| 12 Lead qualification | ✅ | 77 → 92 in acceptance test, evidence per factor |
| 13 Sentiment | ✅ | label, confidence, evidence; labelled transcript-text only |
| 14 Tool authorization | ✅ | actor + tenant scope + consent gate + audit (tools tests) |
| 15 Appointment booking | ✅ | acceptance test: row verified in DB |
| 16 Duplicate booking prevention | ✅ | same lead (409), same slot (409), 5-way race, concurrent "yes" |
| 17 CRM persistence | ✅ | CRUD tests verified against rows |
| 18 Call summaries | ✅ | persisted; `proposed_not_confirmed` vs `confirmed` |
| 19 Decision trace | ✅ | 9 complete traces; no raw phone numbers |
| 20 Error handling | ✅ | LLM down/invalid → rules fallback; DB down → 503; consistent envelopes |

## 3. Security audit

| Check | Result |
|---|---|
| Exposed API keys | Fixed (defect 1). No secrets in tracked files, history or the frontend bundle |
| SQL injection | All queries parameterized; only constant fragments are interpolated; injection payloads tested as inert |
| XSS | No `dangerouslySetInnerHTML`/`eval`; React escapes; stored payloads remain text |
| CORS | Only `http://localhost:5173` allowed (live check) |
| Request validation | Zod on all inputs; non-UUID ids rejected |
| Unauthorized CRM access | 401 without/with bad token; admin-only deletes (403 for sales role) |
| Cross-tenant exposure | 21 endpoint checks → 404; 7 lists empty; nothing modified |
| Unsafe tool execution | Allow-listed tools, strict schemas, consent gate, tenant scope, audit |
| Prompt injection | Doc chunks flagged/excluded; context delimited; LLM cannot set consent; live and tested injections did not book |
| Sensitive logs | Log scan: 0 phones, 0 names, 0 secrets; PII masked in traces and audit |
| Rate limiting | Global, failed-login and agent limits, live-verified with JSON 429s |

## 4. Not tested / residual risks (honest list)

- **Gemini live** (no key): adapter verified with a mocked fetch only.
- **Speech-unsupported browser:** fallback UI exists (feature detection), but no genuinely unsupported browser was run. Real microphone capture is not possible in the pane (denied path tested).
- **Docker images and nginx security headers:** config written and `docker compose config` valid; never built (daemon offline).
- **Load/performance:** no load test; no throughput claims.
- **Multi-instance concurrency:** turn serialization is per process; booking integrity across instances relies on the transaction + unique index (tested). A distributed lock is the documented next step.
- **Tokens in `sessionStorage`:** readable by injected script if an XSS were ever introduced. HttpOnly cookies are the production option.
- **`.env` still points at the Supabase direct host** (IPv6-only, unreachable here). Use the Session pooler URL + `DATABASE_SSL=require`, or the local DB. The Groq key belongs in `.env` (`LLM_PROVIDER=groq`, `LLM_MODEL=openai/gpt-oss-20b`) if you want live AI. Consider rotating the Groq key and the Supabase password, since both were pasted into a tracked file and appeared in tool output during this session (never pushed).

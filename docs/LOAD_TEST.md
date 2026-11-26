# VaaniQ Load Test

**Date:** 2026-11-26 · **Machine:** Apple M2, 8 cores, 8 GB RAM · **Node** v26.0.0 · **PostgreSQL** 18.1 (local) · one Node process, default pool of 10 connections.

These are **measurements on one developer laptop**: the client and server ran on the same machine. They show that the application logic holds up under concurrency (no errors, no data corruption) and where the real bottlenecks are. They are **not** production capacity figures.

## Method

- **Isolated instance:** a second backend on port 4200 in **DEMO_MODE**, so no LLM quota is spent, with its own throwaway database (`vaaniq_load`) and rate limits raised so the limiter doesn't hide application behaviour.
- **Script:** [`backend/scripts/loadtest.mjs`](../backend/scripts/loadtest.mjs), no dependencies. It runs a fixed number of requests at a fixed concurrency and records latency percentiles, throughput, HTTP statuses and errors.
- **Integrity check:** afterwards, every claim was verified directly in the database.

Reproduce:
```bash
createdb vaaniq_load   # or: psql -c "CREATE DATABASE vaaniq_load"
```
```bash
cd backend && DATABASE_URL=postgres://<user>@localhost:<port>/vaaniq_load DATABASE_SSL=false SEED_ADMIN_PASSWORD=load-test-pass-1 npm run setup
```
```bash
cd backend && PORT=4200 DATABASE_URL=postgres://<user>@localhost:<port>/vaaniq_load DATABASE_SSL=false LLM_PROVIDER=demo RATE_LIMIT_MAX=10000000 AGENT_RATE_LIMIT_MAX=10000000 LOGIN_RATE_LIMIT_MAX=10000000 node --env-file=../.env src/server.js
```
```bash
cd backend && BASE=http://localhost:4200/api PW=load-test-pass-1 npm run loadtest
```

## Results (DEMO_MODE, local PostgreSQL)

| Scenario | Requests | Concurrency | Throughput | p50 | p95 | p99 | Errors |
|---|---|---|---|---|---|---|---|
| `GET /health` | 3,000 | 50 | 6,553 req/s | 5.8 ms | 14.6 ms | 32.6 ms | 0 |
| `GET /leads` (JWT + live user check + DB read) | 2,000 | 50 | 2,945 req/s | 16.4 ms | 19.5 ms | 24.1 ms | 0 |
| `POST /knowledge/search` (BM25) | 2,000 | 50 | 4,025 req/s | 10.0 ms | 15.9 ms | 66.8 ms | 0 |
| Agent turn, full pipeline | 120 | 10 | 413 turns/s | 15.5 ms | 112 ms | 117 ms | 0 |
| Agent turn, full pipeline | 300 | 25 | 602 turns/s | 38.1 ms | 58.3 ms | 64.0 ms | 0 |
| Agent turn, full pipeline | 600 | 50 | 683 turns/s | 69.8 ms | 91.4 ms | 99.7 ms | 0 |

**Booking race:** 100 different customers tried to book 10 slots at the same instant. **Exactly 10 succeeded** and 90 got `SLOT_TAKEN`; it took 63 ms.

**Database checks afterwards:** 10 confirmed appointments in 10 distinct slots (never two in one slot); 1,020 agent turns traced with **0 duplicate turn numbers** and **0 failed turns**; 2,703 audit rows; 0 server error log lines.

## Live AI and remote database (the real-world numbers)

| Scenario | Result |
|---|---|
| 10 simultaneous turns, **live Groq** (`openai/gpt-oss-20b`) + **Supabase in Sydney** | all 10 answered with LLM-grounded answers, 0 errors, 0 fallbacks; median 4.4 s, slowest 5.0 s |
| Supabase round trip from this machine (`SELECT 1`) | about **288 ms** per query (local Postgres: 0.2 ms) |

In DEMO_MODE with a local database, a turn takes milliseconds. With a live LLM and a distant database it takes seconds. **The bottlenecks are the LLM calls and the network distance to the database, not the Node.js process.** After this test, a turn's independent database reads and writes run in parallel, tenant settings are cached, and duplicate ownership checks are skipped. Even so, a Supabase project closer to the users (Mumbai, `ap-south-1`) would cut each round trip substantially.

## What this does and does not show

- ✅ No errors, no lost updates and no double bookings under concurrent load; the consent and conflict logic holds.
- ✅ A single Node process handles hundreds of demo-mode turns per second on a laptop, so the application layer is not the constraint.
- ❌ It is not a production capacity test: there was no network between client and server, a single machine, no TLS, no autoscaling, and no long soak test.
- ❌ Live-LLM throughput is bounded by the provider's rate limits and latency. Only 10 concurrent live turns were run, deliberately, to avoid spending quota.

-- VaaniQ initial schema. Every business table carries tenant_id (multi-tenant ownership).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  settings    jsonb NOT NULL DEFAULT '{}'::jsonb,  -- catalog, scoring weights, booking hours
  is_demo     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email          text NOT NULL UNIQUE,
  password_hash  text NOT NULL,
  full_name      text NOT NULL,
  role           text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','agent')),
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_tenant_idx ON users(tenant_id);

CREATE TABLE leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  email           text,
  status          text NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','qualified','visit_scheduled','nurture','lost')),
  profile         jsonb NOT NULL DEFAULT '{}'::jsonb,   -- extracted requirements (only what the customer said)
  score           integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,   -- factors, reasons, missing info
  is_demo         boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_tenant_status_idx ON leads(tenant_id, status);
CREATE INDEX leads_tenant_score_idx ON leads(tenant_id, score DESC);
-- One lead per phone per tenant; used to merge repeat callers.
CREATE UNIQUE INDEX leads_tenant_phone_uq ON leads(tenant_id, phone) WHERE phone IS NOT NULL;

CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id       uuid REFERENCES leads(id) ON DELETE SET NULL,
  language      text NOT NULL DEFAULT 'en' CHECK (language IN ('en','hi','te')),
  channel       text NOT NULL DEFAULT 'voice' CHECK (channel IN ('voice','text')),
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended','escalated')),
  state         jsonb NOT NULL DEFAULT '{}'::jsonb,     -- session memory: pending proposal, offered slots
  escalation_reason text,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz
);
CREATE INDEX conversations_tenant_started_idx ON conversations(tenant_id, started_at DESC);
CREATE INDEX conversations_lead_idx ON conversations(lead_id);

CREATE TABLE messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id  uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('customer','agent')),
  content          text NOT NULL,
  sentiment        text CHECK (sentiment IN ('positive','neutral','negative')),
  sentiment_confidence real,
  sentiment_evidence   jsonb,
  sources          jsonb,                                -- RAG citations shown with agent replies
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_idx ON messages(conversation_id, created_at);

CREATE TABLE appointments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id         uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed','no_show')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
-- Hard guarantee against double-booking: one confirmed visit per slot per tenant.
-- Enforced by the database itself, so concurrent requests cannot both succeed.
CREATE UNIQUE INDEX appointments_slot_uq ON appointments(tenant_id, starts_at) WHERE status = 'confirmed';
CREATE INDEX appointments_tenant_start_idx ON appointments(tenant_id, starts_at);
CREATE INDEX appointments_lead_idx ON appointments(lead_id);

CREATE TABLE knowledge_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title       text NOT NULL,
  source_type text NOT NULL DEFAULT 'text',
  content     text NOT NULL,
  is_demo     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX knowledge_documents_tenant_idx ON knowledge_documents(tenant_id);

CREATE TABLE knowledge_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id  uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index  integer NOT NULL,
  section      text,
  content      text NOT NULL,
  flagged      boolean NOT NULL DEFAULT false,   -- looks like an injection attempt; excluded from retrieval
  UNIQUE (document_id, chunk_index)
);
CREATE INDEX knowledge_chunks_tenant_idx ON knowledge_chunks(tenant_id);

CREATE TABLE call_summaries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  summary         jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX call_summaries_tenant_idx ON call_summaries(tenant_id, created_at DESC);

CREATE TABLE agent_execution_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  turn_index      integer NOT NULL,
  intent          text,
  outcome         text NOT NULL,
  provider        text NOT NULL,
  latency_ms      integer,
  trace           jsonb NOT NULL,                       -- the Agent Decision Trace
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX agent_logs_tenant_idx ON agent_execution_logs(tenant_id, created_at DESC);
CREATE INDEX agent_logs_conv_idx ON agent_execution_logs(conversation_id, turn_index);

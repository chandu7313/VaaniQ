-- Audit log: one row per tool execution attempt (agent or staff), including rejected attempts.
-- Arguments are stored PII-masked. Complements agent_execution_logs (which is per conversational turn)
-- by also covering staff-initiated actions such as manual bookings and call summaries.
CREATE TABLE tool_audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  actor           text NOT NULL CHECK (actor IN ('agent','staff')),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  tool            text NOT NULL,
  status          text NOT NULL CHECK (status IN ('success','rejected','failed')),
  error_code      text,
  args            jsonb,
  duration_ms     integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tool_audit_tenant_created_idx ON tool_audit_log(tenant_id, created_at DESC);
CREATE INDEX tool_audit_tenant_tool_idx ON tool_audit_log(tenant_id, tool);
CREATE INDEX tool_audit_conversation_idx ON tool_audit_log(conversation_id);
ALTER TABLE tool_audit_log ENABLE ROW LEVEL SECURITY;

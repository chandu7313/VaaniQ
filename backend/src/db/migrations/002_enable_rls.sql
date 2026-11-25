-- Defence in depth for hosted Postgres (e.g. Supabase, whose Data API exposes the public schema
-- to anyone holding the project's public anon key). With RLS enabled and NO policies, roles other
-- than the table owner see nothing. The VaaniQ backend connects as the owner, so it is unaffected;
-- tenant isolation is still enforced in application queries.
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_summaries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations    ENABLE ROW LEVEL SECURITY;

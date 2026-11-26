-- Knowledge base metadata, governance lifecycle states, deduplication hashes, and index versioning.
ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS doc_id text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS version text NOT NULL DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS authority_level integer,
  ADD COLUMN IF NOT EXISTS retrieval_scope text NOT NULL DEFAULT 'customer_facing'
    CHECK (retrieval_scope IN ('customer_facing', 'agent_internal')),
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'PENDING_REVIEW'
    CHECK (approval_status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'indexed'
    CHECK (lifecycle_status IN ('uploaded', 'indexed', 'pending_review', 'approved', 'published', 'superseded', 'failed')),
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS index_version text NOT NULL DEFAULT 'bm25-v1',
  ADD COLUMN IF NOT EXISTS is_fictional_demo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS contains_synthetic_assumptions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS supersedes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS source_of_truth text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_documents_tenant_doc_id_uq
  ON knowledge_documents(tenant_id, doc_id)
  WHERE doc_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS knowledge_documents_scope_lifecycle_idx
  ON knowledge_documents(tenant_id, retrieval_scope, lifecycle_status);

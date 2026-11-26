import { createHash } from 'node:crypto';
import { query, withTransaction } from '../../db/pool.js';
import { notFound } from '../../lib/errors.js';
import { BM25, tokenize } from './bm25.js';
import { chunkDocument } from './chunker.js';
import { retrievalSynonyms } from '../lexicon.js';

const INDEX_VERSION = 'bm25-v1';

// Per-process cache of tenant indexes, invalidated on any ingest/delete.
// Stores separate BM25 indexes for all active documents vs customer_facing only,
// so agent_internal playbooks cannot affect customer IDF or hijack customer queries.
const indexCache = new Map();
const invalidate = (tenantId) => indexCache.delete(tenantId);

const computeHash = (text) => createHash('sha256').update(String(text || '').replace(/\r\n/g, '\n')).digest('hex');

async function insertChunks(client, tenantId, documentId, chunks) {
  if (!chunks.length) return;
  await client.query(
    `INSERT INTO knowledge_chunks (tenant_id, document_id, chunk_index, section, content, flagged)
     SELECT $1, $2, * FROM unnest($3::int[], $4::text[], $5::text[], $6::boolean[])`,
    [
      tenantId,
      documentId,
      chunks.map((c) => c.chunkIndex),
      chunks.map((c) => c.section ?? null),
      chunks.map((c) => c.content),
      chunks.map((c) => Boolean(c.flagged)),
    ],
  );
}

function normalizeDocMeta(doc = {}) {
  const isDemo = Boolean(doc.isDemo);
  const approvalStatus = doc.approvalStatus || (isDemo ? 'PENDING_REVIEW' : 'APPROVED');
  const lifecycleStatus = doc.lifecycleStatus || (approvalStatus === 'PENDING_REVIEW' ? 'pending_review' : 'indexed');
  return {
    title: doc.title,
    content: doc.content,
    sourceType: doc.sourceType || 'text',
    isDemo,
    docId: doc.docId || null,
    category: doc.category || null,
    subcategory: doc.subcategory || null,
    version: doc.version || '1.0.0',
    authorityLevel: doc.authorityLevel ?? null,
    retrievalScope: doc.retrievalScope || 'customer_facing',
    approvalStatus,
    lifecycleStatus,
    contentHash: doc.contentHash || computeHash(doc.content),
    indexVersion: doc.indexVersion || INDEX_VERSION,
    isFictionalDemo: doc.isFictionalDemo ?? isDemo,
    containsSyntheticAssumptions: Boolean(doc.containsSyntheticAssumptions),
    supersedes: Array.isArray(doc.supersedes) ? doc.supersedes : [],
    sourceOfTruth: doc.sourceOfTruth || null,
  };
}

export async function ingestDocument(tenantId, rawDoc) {
  const d = normalizeDocMeta(rawDoc);
  const chunks = chunkDocument(d.title, d.content);
  if (!chunks.length) throw new Error('Document produced no chunks');
  const doc = await withTransaction(async (c) => {
    const { rows } = await c.query(
      `INSERT INTO knowledge_documents (
         tenant_id, title, source_type, content, is_demo,
         doc_id, category, subcategory, version, authority_level,
         retrieval_scope, approval_status, lifecycle_status, content_hash,
         index_version, is_fictional_demo, contains_synthetic_assumptions, supersedes, source_of_truth
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19)
       RETURNING id, title, source_type, is_demo, doc_id, category, version, authority_level,
                 retrieval_scope, approval_status, lifecycle_status, index_version, created_at`,
      [
        tenantId, d.title, d.sourceType, d.content, d.isDemo,
        d.docId, d.category, d.subcategory, d.version, d.authorityLevel,
        d.retrievalScope, d.approvalStatus, d.lifecycleStatus, d.contentHash,
        d.indexVersion, d.isFictionalDemo, d.containsSyntheticAssumptions, JSON.stringify(d.supersedes), d.sourceOfTruth,
      ],
    );
    await insertChunks(c, tenantId, rows[0].id, chunks);
    return rows[0];
  });
  invalidate(tenantId);
  return { ...doc, chunkCount: chunks.length, flaggedChunks: chunks.filter((c) => c.flagged).length };
}

/**
 * Re-chunks stored documents with the current chunker (e.g. after changing chunking rules).
 * One transaction per document: its chunks are replaced atomically; CRM data is untouched.
 */
export async function reindexDocuments(tenantId) {
  const { rows } = await query(
    `SELECT id, tenant_id, title, content, lifecycle_status
       FROM knowledge_documents ${tenantId ? 'WHERE tenant_id = $1' : ''}`,
    tenantId ? [tenantId] : [],
  );
  let chunkTotal = 0;
  for (const doc of rows) {
    if (doc.lifecycle_status === 'superseded' || doc.lifecycle_status === 'failed') continue;
    const chunks = chunkDocument(doc.title, doc.content);
    await withTransaction(async (c) => {
      await c.query('DELETE FROM knowledge_chunks WHERE document_id = $1', [doc.id]);
      await insertChunks(c, doc.tenant_id, doc.id, chunks);
      await c.query('UPDATE knowledge_documents SET index_version = $2, updated_at = now() WHERE id = $1', [doc.id, INDEX_VERSION]);
    });
    chunkTotal += chunks.length;
    invalidate(doc.tenant_id);
  }
  return { documents: rows.length, chunks: chunkTotal, indexVersion: INDEX_VERSION };
}

const sameDocState = (cur, d) =>
  cur.content_hash === d.contentHash
  && cur.content === d.content
  && cur.title === d.title
  && (cur.doc_id ?? null) === d.docId
  && cur.retrieval_scope === d.retrievalScope
  && cur.approval_status === d.approvalStatus
  && cur.lifecycle_status === d.lifecycleStatus
  && (cur.authority_level ?? null) === d.authorityLevel
  && cur.version === d.version
  && cur.index_version === d.indexVersion;

/**
 * Keeps the tenant's DEMO documents identical to the given set: adds missing ones, updates changed
 * ones atomically inside transactions, skips unchanged hashes without reprocessing, and deletes stale
 * demo documents no longer in the set. Documents uploaded by users (is_demo = false) are never touched.
 */
export async function syncDemoDocuments(tenantId, docs) {
  const { rows } = await query(
    `SELECT id, title, content, doc_id, retrieval_scope, approval_status, lifecycle_status,
            authority_level, version, content_hash, index_version
       FROM knowledge_documents
      WHERE tenant_id = $1 AND is_demo`,
    [tenantId],
  );
  const byDocId = new Map(rows.filter((r) => r.doc_id).map((r) => [r.doc_id, r]));
  const byTitle = new Map(rows.map((r) => [r.title, r]));
  const seenRowIds = new Set();
  const result = { added: 0, updated: 0, removed: 0, unchanged: 0, failed: 0 };

  for (const raw of docs) {
    const d = normalizeDocMeta({ ...raw, isDemo: true });
    const cur = (d.docId && byDocId.get(d.docId)) || byTitle.get(d.title);
    if (!cur) {
      await ingestDocument(tenantId, d);
      result.added++;
      continue;
    }
    seenRowIds.add(cur.id);
    if (sameDocState(cur, d)) {
      result.unchanged++;
      continue;
    }
    const chunks = chunkDocument(d.title, d.content);
    if (!chunks.length) {
      await query(
        `UPDATE knowledge_documents SET lifecycle_status = 'failed', updated_at = now() WHERE tenant_id = $1 AND id = $2`,
        [tenantId, cur.id],
      );
      result.failed++;
      continue;
    }
    await withTransaction(async (c) => {
      await c.query(
        `UPDATE knowledge_documents
            SET title = $3, content = $4, doc_id = $5, category = $6, subcategory = $7,
                version = $8, authority_level = $9, retrieval_scope = $10, approval_status = $11,
                lifecycle_status = $12, content_hash = $13, index_version = $14,
                is_fictional_demo = $15, contains_synthetic_assumptions = $16,
                supersedes = $17::jsonb, source_of_truth = $18, updated_at = now()
          WHERE tenant_id = $1 AND id = $2`,
        [
          tenantId, cur.id, d.title, d.content, d.docId, d.category, d.subcategory,
          d.version, d.authorityLevel, d.retrievalScope, d.approvalStatus,
          d.lifecycleStatus, d.contentHash, d.indexVersion,
          d.isFictionalDemo, d.containsSyntheticAssumptions,
          JSON.stringify(d.supersedes), d.sourceOfTruth,
        ],
      );
      await c.query('DELETE FROM knowledge_chunks WHERE document_id = $1', [cur.id]);
      await insertChunks(c, tenantId, cur.id, chunks);
    });
    result.updated++;
  }

  for (const r of rows) {
    if (!seenRowIds.has(r.id)) {
      await query('DELETE FROM knowledge_documents WHERE tenant_id = $1 AND id = $2 AND is_demo', [tenantId, r.id]);
      result.removed++;
    }
  }
  invalidate(tenantId);
  return result;
}

export async function listDocuments(tenantId) {
  const { rows } = await query(
    `SELECT d.id, d.doc_id, d.title, d.category, d.subcategory, d.version, d.authority_level,
            d.retrieval_scope, d.approval_status, d.lifecycle_status, d.index_version,
            d.is_demo, d.is_fictional_demo, d.contains_synthetic_assumptions,
            d.source_type, d.created_at, d.updated_at,
            COUNT(c.id)::int AS chunk_count, COUNT(c.id) FILTER (WHERE c.flagged)::int AS flagged_chunks
       FROM knowledge_documents d LEFT JOIN knowledge_chunks c ON c.document_id = d.id
      WHERE d.tenant_id = $1 GROUP BY d.id ORDER BY d.doc_id NULLS LAST, d.created_at DESC`,
    [tenantId],
  );
  return rows;
}

export async function getDocument(tenantId, id) {
  const { rows } = await query(
    `SELECT id, doc_id, title, category, subcategory, version, authority_level,
            retrieval_scope, approval_status, lifecycle_status, index_version,
            is_demo, is_fictional_demo, contains_synthetic_assumptions, supersedes,
            source_of_truth, source_type, content, created_at, updated_at
       FROM knowledge_documents WHERE tenant_id=$1 AND id=$2`,
    [tenantId, id],
  );
  if (!rows[0]) throw notFound('Document');
  const chunks = await query('SELECT chunk_index, section, content, flagged FROM knowledge_chunks WHERE document_id=$1 ORDER BY chunk_index', [id]);
  return { ...rows[0], chunks: chunks.rows };
}

export async function deleteDocument(tenantId, id) {
  const { rowCount } = await query('DELETE FROM knowledge_documents WHERE tenant_id=$1 AND id=$2', [tenantId, id]);
  if (!rowCount) throw notFound('Document');
  invalidate(tenantId);
}

const buildBm25Entry = (rows) => ({
  byId: new Map(rows.map((r) => [r.id, r])),
  // Title and section are indexed with the body; the section heading counts twice (field boost)
  // because it is a curated summary of the chunk ("3BHK Pricing Details", "Home Loan and Financing Process").
  bm25: new BM25(rows.map((r) => ({ id: r.id, text: `${r.title} ${r.section} ${r.section} ${r.content}` }))),
});

async function loadIndex(tenantId) {
  if (indexCache.has(tenantId)) return indexCache.get(tenantId);
  const { rows } = await query(
    `SELECT c.id, c.document_id, d.doc_id, d.title, d.category, d.version, d.authority_level,
            d.retrieval_scope, d.approval_status, d.lifecycle_status, d.is_demo,
            c.section, c.content
       FROM knowledge_chunks c
       JOIN knowledge_documents d ON d.id = c.document_id
      WHERE c.tenant_id = $1
        AND NOT c.flagged
        AND d.lifecycle_status NOT IN ('superseded', 'failed', 'uploaded')
        AND (d.is_demo = true OR d.approval_status = 'APPROVED' OR d.lifecycle_status IN ('indexed', 'approved', 'published'))`,
    [tenantId],
  );
  const customerRows = rows.filter((r) => r.retrieval_scope !== 'agent_internal');
  const entry = {
    all: buildBm25Entry(rows),
    customer: buildBm25Entry(customerRows),
    indexVersion: INDEX_VERSION,
  };
  indexCache.set(tenantId, entry);
  return entry;
}

/** Appends English keywords for Hindi/Telugu terms so a lexical English index can still match. */
export function expandQuery(text) {
  const extra = [];
  for (const [en, forms] of Object.entries(retrievalSynonyms)) {
    if (forms.some((f) => text.toLowerCase().includes(f.toLowerCase()))) extra.push(en);
  }
  return extra.length ? `${text} ${extra.join(' ')}` : text;
}

const BOILERPLATE_SECTION = /^(?:[125689]|10)\.\s*(?:purpose|business context|important conditions|exceptions|what the ai|escalation)|^(?:important conditions|exceptions)$/i;
const PRIMARY_CUSTOMER_SECTION = /^(?:4\.\s*customer-facing|3\.\s*(?:pricing details|apartment details|questions and answers|frequently asked|construction-linked|registration status))/i;
const SUB_SECTION = /^3\.\d+\b/i;

function rerankForCustomer(hits, byId, k) {
  return [...hits]
    .map((h) => {
      const r = byId.get(h.id);
      const sec = r?.section || '';
      const mult = BOILERPLATE_SECTION.test(sec)
        ? 0.2
        : PRIMARY_CUSTOMER_SECTION.test(sec)
          ? 1.6
          : sec === r?.title
            ? 1.5
            : /^3\.\s/i.test(sec)
              ? 1.35
              : SUB_SECTION.test(sec)
                ? 1.0
                : 1.0;
      return { ...h, _rankScore: h.score * mult };
    })
    .sort((a, b) => b._rankScore - a._rankScore)
    .slice(0, k);
}

/**
 * Retriever interface: retrieve(tenantId, query, {k, minRelevance, includeInternal})
 * -> [{chunkId, documentId, docId, title, section, content, retrievalScope, authorityLevel, approvalStatus, score, relevance}].
 * Customer-facing requests pass includeInternal: false so agent_internal playbooks/dialogues
 * are never exposed to end users or allowed to outrank customer-facing product docs.
 */
export async function retrieve(tenantId, queryText, { k = 4, minRelevance = 0.2, includeInternal = false } = {}) {
  const idx = await loadIndex(tenantId);
  const { byId, bm25 } = includeInternal ? idx.all : idx.customer;
  let q = expandQuery(queryText);
  // "Tell me about GreenHaven Residences": the name is in every document title, so it cannot pick a
  // document. A question made only of such ubiquitous words is asking for the overview.
  if (bm25.isGenericQuery(q)) q = `${q} project overview about`;
  const poolSize = includeInternal ? k : Math.max(k * 4, 16);
  let hits = bm25.search(q, Math.max(poolSize, 8)).filter((h) => h.relevance >= minRelevance);
  // Keep glossary matches (e.g. "Multilingual Sales Glossary") to at most 1 chunk so they don't crowd out
  // substantive product/pricing documents or hide uncovered topics on multilingual questions.
  let seenGlossary = false;
  hits = hits.filter((h) => {
    const r = byId.get(h.id);
    if (r?.doc_id === 'ABC-GHR-KB-61') {
      if (seenGlossary) return false;
      seenGlossary = true;
    }
    return true;
  });
  hits = includeInternal ? hits.slice(0, k) : rerankForCustomer(hits, byId, k);
  // Two-part questions ("3BHK price, and are there schools nearby?"): if some topic words are covered by
  // none of the non-glossary hits, run one focused search so each topic gets its best passage.
  // Only for questions that are already on-topic: an off-topic question (no hits) must stay unanswered.
  const substantiveIds = hits.filter((h) => byId.get(h.id)?.doc_id !== 'ABC-GHR-KB-61').map((h) => h.id);
  const uncovered = hits.length > 0 && hits[0].relevance >= 0.25 ? bm25.uncoveredTerms(q, substantiveIds) : [];
  if (uncovered.length) {
    const entities = tokenize(q).filter((t) => /\d/.test(t) && bm25.df.has(t));
    const seenDocs = new Set(hits.map((h) => byId.get(h.id)?.document_id));
    const extra = [];
    for (const h of bm25.search([...uncovered, ...entities].join(' '), Math.max(k * 2, 8))) {
      if (h.relevance < minRelevance || hits.some((x) => x.id === h.id)) continue;
      const r = byId.get(h.id);
      if (!r || r.doc_id === 'ABC-GHR-KB-61' || seenDocs.has(r.document_id)) continue;
      seenDocs.add(r.document_id);
      extra.push(h);
      if (extra.length >= Math.min(2, k)) break;
    }
    if (extra.length) {
      const keep = Math.max(1, k - extra.length);
      hits = [...hits.slice(0, keep), ...extra].slice(0, k);
    }
  }
  return hits.map((h) => {
    const r = byId.get(h.id);
    return {
      chunkId: r.id,
      documentId: r.document_id,
      docId: r.doc_id,
      title: r.title,
      section: r.section,
      content: r.content,
      retrievalScope: r.retrieval_scope,
      authorityLevel: r.authority_level,
      approvalStatus: r.approval_status,
      score: Number(h.score.toFixed(3)),
      relevance: Number(h.relevance.toFixed(3)),
    };
  });
}

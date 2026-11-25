import { query, withTransaction } from '../../db/pool.js';
import { notFound } from '../../lib/errors.js';
import { BM25 } from './bm25.js';
import { chunkDocument } from './chunker.js';
import { retrievalSynonyms } from '../lexicon.js';

// Per-process cache of tenant indexes, invalidated on any ingest/delete.
// With multiple instances this becomes a Redis-published version key (see docs).
const indexCache = new Map();
const invalidate = (tenantId) => indexCache.delete(tenantId);

export async function ingestDocument(tenantId, { title, content, sourceType = 'text', isDemo = false }) {
  const chunks = chunkDocument(title, content);
  if (!chunks.length) throw new Error('Document produced no chunks');
  const doc = await withTransaction(async (c) => {
    const { rows } = await c.query(
      `INSERT INTO knowledge_documents (tenant_id, title, source_type, content, is_demo)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, title, source_type, is_demo, created_at`,
      [tenantId, title, sourceType, content, isDemo],
    );
    for (const ch of chunks) {
      await c.query(
        `INSERT INTO knowledge_chunks (tenant_id, document_id, chunk_index, section, content, flagged)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [tenantId, rows[0].id, ch.chunkIndex, ch.section, ch.content, ch.flagged],
      );
    }
    return rows[0];
  });
  invalidate(tenantId);
  return { ...doc, chunkCount: chunks.length, flaggedChunks: chunks.filter((c) => c.flagged).length };
}

export async function listDocuments(tenantId) {
  const { rows } = await query(
    `SELECT d.id, d.title, d.source_type, d.is_demo, d.created_at,
            COUNT(c.id)::int AS chunk_count, COUNT(c.id) FILTER (WHERE c.flagged)::int AS flagged_chunks
       FROM knowledge_documents d LEFT JOIN knowledge_chunks c ON c.document_id = d.id
      WHERE d.tenant_id = $1 GROUP BY d.id ORDER BY d.created_at DESC`,
    [tenantId],
  );
  return rows;
}

export async function getDocument(tenantId, id) {
  const { rows } = await query('SELECT id, title, source_type, content, is_demo, created_at FROM knowledge_documents WHERE tenant_id=$1 AND id=$2', [tenantId, id]);
  if (!rows[0]) throw notFound('Document');
  const chunks = await query('SELECT chunk_index, section, content, flagged FROM knowledge_chunks WHERE document_id=$1 ORDER BY chunk_index', [id]);
  return { ...rows[0], chunks: chunks.rows };
}

export async function deleteDocument(tenantId, id) {
  const { rowCount } = await query('DELETE FROM knowledge_documents WHERE tenant_id=$1 AND id=$2', [tenantId, id]);
  if (!rowCount) throw notFound('Document');
  invalidate(tenantId);
}

async function loadIndex(tenantId) {
  if (indexCache.has(tenantId)) return indexCache.get(tenantId);
  const { rows } = await query(
    `SELECT c.id, c.document_id, d.title, c.section, c.content
       FROM knowledge_chunks c JOIN knowledge_documents d ON d.id = c.document_id
      WHERE c.tenant_id = $1 AND NOT c.flagged`,
    [tenantId],
  );
  const entry = {
    byId: new Map(rows.map((r) => [r.id, r])),
    // Title and section are indexed too: "pricing" should find the Pricing document.
    bm25: new BM25(rows.map((r) => ({ id: r.id, text: `${r.title} ${r.section} ${r.content}` }))),
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

/**
 * Retriever interface: retrieve(tenantId, query, {k}) -> [{chunkId, documentId, title, section, content, score, relevance}].
 * An embedding/pgvector retriever can replace this function without touching the agent.
 */
export async function retrieve(tenantId, queryText, { k = 4, minRelevance = 0.2 } = {}) {
  const { byId, bm25 } = await loadIndex(tenantId);
  return bm25
    .search(expandQuery(queryText), k)
    .filter((h) => h.relevance >= minRelevance)
    .map((h) => {
      const r = byId.get(h.id);
      return { chunkId: r.id, documentId: r.document_id, title: r.title, section: r.section, content: r.content,
        score: Number(h.score.toFixed(3)), relevance: Number(h.relevance.toFixed(3)) };
    });
}

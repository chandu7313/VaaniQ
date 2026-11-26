// Loads the demo tenant's knowledge documents from VaaniQ_Knowledge_Base/ (the validated source set).
// YAML frontmatter is document metadata, not retrievable text: it is stripped before indexing,
// while structured metadata fields are preserved in PostgreSQL for governance and scoped retrieval.
// KB_DIR overrides the location (the Docker image copies the documents to /app/knowledge).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../VaaniQ_Knowledge_Base');
const DOC_FILE = /^\d\d_[a-z0-9_]+\.md$/;

const parseScalar = (v) => {
  const s = v.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '') return null;
  if (s === '[]') return [];
  return s.replace(/^"(.*)"$/, '$1');
};

export function parseFrontmatter(raw) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  let currentArrayKey = null;
  for (const line of m[1].split('\n')) {
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && currentArrayKey) {
      meta[currentArrayKey].push(parseScalar(item[1]));
      continue;
    }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (kv) {
      const val = kv[2].trim();
      if (val === '') {
        meta[kv[1]] = [];
        currentArrayKey = kv[1];
      } else {
        meta[kv[1]] = parseScalar(val);
        currentArrayKey = null;
      }
    }
  }
  return { meta, body: raw.slice(m[0].length) };
}

function mapLifecycleStatus(frontmatterStatus, approvalStatus) {
  if (frontmatterStatus === 'superseded') return 'superseded';
  if (frontmatterStatus === 'failed') return 'failed';
  if (approvalStatus === 'PENDING_REVIEW') return 'pending_review';
  if (approvalStatus === 'APPROVED') return 'approved';
  return 'indexed';
}

/**
 * Returns [{ title, content, docId, category, subcategory, version, status, authorityLevel,
 *   retrievalScope, approvalStatus, lifecycleStatus, fictionalDemoData, containsSyntheticAssumptions,
 *   supersedes, sourceOfTruth, contentHash }] sorted by document number.
 */
export function loadKnowledgeBase(dir = process.env.KB_DIR || DEFAULT_DIR) {
  if (!fs.existsSync(dir)) throw new Error(`Knowledge base folder not found: ${dir} (set KB_DIR)`);
  const files = fs.readdirSync(dir, { recursive: true })
    .filter((f) => DOC_FILE.test(path.basename(f)))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  const seenIds = new Set();
  return files.map((f) => {
    const normalizedRaw = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    const { meta, body } = parseFrontmatter(normalizedRaw);
    const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() || meta.document_title;
    if (!meta.doc_id || !title) throw new Error(`Knowledge document without doc_id/title: ${f}`);
    if (seenIds.has(meta.doc_id)) throw new Error(`Duplicate doc_id in knowledge base: ${meta.doc_id} (${f})`);
    seenIds.add(meta.doc_id);
    const approvalStatus = meta.approval_status || 'PENDING_REVIEW';
    const content = body.trim();
    const contentHash = createHash('sha256').update(normalizedRaw).digest('hex');
    return {
      title,
      content,
      docId: meta.doc_id,
      category: meta.category || null,
      subcategory: meta.subcategory || null,
      version: String(meta.version || '1.0.0'),
      status: meta.status || 'active_demo',
      authorityLevel: Number(meta.authority_level) || null,
      retrievalScope: meta.retrieval_scope || 'customer_facing',
      approvalStatus,
      lifecycleStatus: mapLifecycleStatus(meta.status, approvalStatus),
      fictionalDemoData: meta.fictional_demo_data !== false,
      containsSyntheticAssumptions: Boolean(meta.contains_synthetic_assumptions),
      supersedes: Array.isArray(meta.supersedes) ? meta.supersedes : [],
      sourceOfTruth: meta.source_of_truth || null,
      contentHash,
    };
  });
}

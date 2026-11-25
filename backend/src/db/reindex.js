// Re-chunks every stored knowledge document with the current chunker. Non-destructive for CRM data.
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';
import { reindexDocuments } from '../services/rag/knowledge.js';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  reindexDocuments()
    .then((r) => { console.log(`Re-indexed ${r.documents} documents into ${r.chunks} chunks`); return pool.end(); })
    .catch((e) => { console.error(e.message); process.exit(1); });
}

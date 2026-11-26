// Offline retrieval evaluation: indexes the 69 knowledge-base documents with the SAME chunker, tokenizer,
// BM25 ranking, Hindi/Telugu query expansion and two-part-question logic as backend/src/services/rag/knowledge.js,
// in memory (no database), then runs every evaluation/*.jsonl case.
// Usage: node tools/retrieval_eval.mjs [--json reports/retrieval_eval_results.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BM25, tokenize } from '../../backend/src/services/rag/bm25.js';
import { chunkDocument } from '../../backend/src/services/rag/chunker.js';
import { retrievalSynonyms } from '../../backend/src/services/lexicon.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const K = 4, MIN_REL = 0.2;
const exIdx = process.argv.indexOf('--exclude-authority');
const EXCLUDE = exIdx > 0 ? new Set(process.argv[exIdx + 1].split(',').map(Number)) : new Set();
const files = fs.readdirSync(ROOT, { recursive: true }).filter((f) => /(^|\/)\d\d_[^/]+\.md$/.test(f)).sort();
const rows = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const docId = /doc_id:\s*(\S+)/.exec(raw)[1];
  if (EXCLUDE.has(Number(/authority_level:\s*(\d)/.exec(raw)[1]))) continue;
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, ''); // frontmatter is metadata, not indexed text
  const title = /^#\s+(.*)$/m.exec(body)[1];
  for (const c of chunkDocument(title, body)) if (!c.flagged) rows.push({ id: rows.length, docId, title, section: c.section, content: c.content });
}
const bm25 = new BM25(rows.map((r) => ({ id: r.id, text: `${r.title} ${r.section} ${r.section} ${r.content}` })));
const expand = (t) => { const x = Object.entries(retrievalSynonyms).filter(([, fs_]) => fs_.some((s) => t.toLowerCase().includes(s.toLowerCase()))).map(([en]) => en); return x.length ? `${t} ${x.join(' ')}` : t; };
function retrieve(text) {
  let q = expand(text);
  if (bm25.isGenericQuery(q)) q = `${q} project overview about`;
  let hits = bm25.search(q, K).filter((h) => h.relevance >= MIN_REL);
  const unc = hits.length > 0 && hits.length < K ? bm25.uncoveredTerms(q, hits.map((h) => h.id)) : [];
  if (unc.length) {
    const ent = tokenize(q).filter((t) => /\d/.test(t) && bm25.df.has(t));
    hits = [...hits, ...bm25.search([...unc, ...ent].join(' '), K).filter((h) => h.relevance >= MIN_REL && !hits.some((x) => x.id === h.id))].slice(0, K);
  }
  return hits.map((h) => ({ docId: rows[h.id].docId, section: rows[h.id].section, relevance: +h.relevance.toFixed(3) }));
}

const results = []; const bySet = {};
for (const f of fs.readdirSync(path.join(ROOT, 'evaluation')).filter((x) => x.endsWith('.jsonl')).sort()) {
  for (const line of fs.readFileSync(path.join(ROOT, 'evaluation', f), 'utf8').split('\n').filter(Boolean)) {
    const c = JSON.parse(line);
    const hits = retrieve(c.query);
    const docs = [...new Set(hits.map((h) => h.docId))];
    let pass, top1 = null;
    if (!c.expected_doc_ids.length) pass = hits.length === 0; // off-topic: nothing should pass the threshold
    else { pass = docs.some((d) => c.expected_doc_ids.includes(d)); top1 = docs.length ? c.expected_doc_ids.includes(docs[0]) : false; }
    const s = (bySet[c.set] ??= { cases: 0, scored: 0, hit_at_4: 0, top1: 0, top1_eligible: 0 });
    s.cases++;
    if (c.retrieval_required) { s.scored++; if (pass) s.hit_at_4++; if (top1 !== null) { s.top1_eligible++; if (top1) s.top1++; } }
    results.push({ id: c.id, set: c.set, language: c.language, query: c.query, expected: c.expected_doc_ids, retrieved: docs, scored: c.retrieval_required, pass, top1, top_section: hits[0]?.section ?? null, top_relevance: hits[0]?.relevance ?? null });
  }
}
const scored = results.filter((r) => r.scored), total = scored.length, passed = scored.filter((r) => r.pass).length;
console.log(`indexed ${new Set(rows.map((r) => r.docId)).size} documents, ${rows.length} chunks${EXCLUDE.size ? ` (excluding authority level ${[...EXCLUDE]})` : ''}`);
for (const [k, v] of Object.entries(bySet)) console.log(`${k.padEnd(14)} hit@4 ${v.hit_at_4}/${v.scored}   top-1 ${v.top1}/${v.top1_eligible}   (${v.cases - v.scored} routed by orchestrator, not scored)`);
console.log(`OVERALL retrieval hit@4 ${passed}/${total} (${(100 * passed / total).toFixed(1)}%), ${results.length - total} routing cases excluded`);
for (const r of scored.filter((x) => !x.pass)) console.log(`  MISS ${r.id} [${r.language}] "${r.query}" expected ${r.expected.join(',') || '(none)'} got ${r.retrieved.join(',') || '(none)'}`);
const out = process.argv.indexOf('--json');
if (out > 0) fs.writeFileSync(path.join(ROOT, process.argv[out + 1]), JSON.stringify({ generated_at: new Date().toISOString(), k: K, min_relevance: MIN_REL, documents: new Set(rows.map((r) => r.docId)).size, excluded_authority_levels: [...EXCLUDE], chunks: rows.length, summary: bySet, overall: { scored_cases: total, routing_cases_not_scored: results.length - total, hit_at_4: passed }, results }, null, 1));

import { ingestDocument, listDocuments, getDocument, deleteDocument, retrieve } from '../services/rag/knowledge.js';

export const list = async (req, res) => res.json({ data: await listDocuments(req.user.tenantId) });
export const create = async (req, res) => res.status(201).json({ data: await ingestDocument(req.user.tenantId, req.valid.body) });
// The tester shows every hit (minRelevance 0); the agent itself applies the 0.20 threshold.
export const search = async (req, res) => res.json({ data: await retrieve(req.user.tenantId, req.valid.body.query, { k: req.valid.body.k, minRelevance: 0 }) });
export const detail = async (req, res) => res.json({ data: await getDocument(req.user.tenantId, req.valid.params.id) });
export async function remove(req, res) {
  await deleteDocument(req.user.tenantId, req.valid.params.id);
  res.status(204).end();
}

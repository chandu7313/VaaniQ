import { Router } from 'express';
import { z } from 'zod';
import { ingestDocument, listDocuments, getDocument, deleteDocument, retrieve } from '../services/rag/knowledge.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';

const r = Router();
const idParams = z.object({ id: z.string().uuid() });

r.get('/', ah(async (req, res) => res.json({ data: await listDocuments(req.user.tenantId) })));
r.post('/', validate({ body: z.object({ title: z.string().trim().min(3).max(150), content: z.string().trim().min(20).max(200000), sourceType: z.enum(['text', 'markdown', 'file']).default('text') }) }), ah(async (req, res) =>
  res.status(201).json({ data: await ingestDocument(req.user.tenantId, req.valid.body) })));
r.post('/search', validate({ body: z.object({ query: z.string().trim().min(2).max(500), k: z.number().int().min(1).max(10).default(5) }) }), ah(async (req, res) =>
  res.json({ data: await retrieve(req.user.tenantId, req.valid.body.query, { k: req.valid.body.k, minRelevance: 0 }) })));
r.get('/:id', validate({ params: idParams }), ah(async (req, res) => res.json({ data: await getDocument(req.user.tenantId, req.valid.params.id) })));
r.delete('/:id', validate({ params: idParams }), ah(async (req, res) => { await deleteDocument(req.user.tenantId, req.valid.params.id); res.status(204).end(); }));

export default r;

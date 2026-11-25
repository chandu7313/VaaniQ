import { Router } from 'express';
import { z } from 'zod';
import { listLeads, getLeadDetail, updateLead } from '../services/crm.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';

const r = Router();
const status = z.enum(['new', 'contacted', 'qualified', 'visit_scheduled', 'nurture', 'lost']);
const idParams = z.object({ id: z.string().uuid() });

r.get('/', validate({ query: z.object({ status: status.optional(), search: z.string().max(80).optional() }) }), ah(async (req, res) =>
  res.json({ data: await listLeads(req.user.tenantId, req.valid.query) })));
r.get('/:id', validate({ params: idParams }), ah(async (req, res) => res.json({ data: await getLeadDetail(req.user.tenantId, req.valid.params.id) })));
r.patch('/:id', validate({ params: idParams, body: z.object({ status: status.optional(), fullName: z.string().min(1).max(80).optional(), email: z.string().email().optional() }).strict() }), ah(async (req, res) =>
  res.json({ data: await updateLead(req.user.tenantId, req.valid.params.id, req.valid.body) })));

export default r;

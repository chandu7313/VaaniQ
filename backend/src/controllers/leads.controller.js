import { listLeads, getLeadDetail, updateLead } from '../services/crm.js';

export const list = async (req, res) => res.json({ data: await listLeads(req.user.tenantId, req.valid.query) });
export const detail = async (req, res) => res.json({ data: await getLeadDetail(req.user.tenantId, req.valid.params.id) });
export const update = async (req, res) => res.json({ data: await updateLead(req.user.tenantId, req.valid.params.id, req.valid.body) });

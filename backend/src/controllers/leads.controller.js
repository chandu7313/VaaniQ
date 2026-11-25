import { listLeads, getLeadDetail, updateLead, deleteLead } from '../services/crm.js';
import { runStaffTool } from './toolContext.js';

export const list = async (req, res) => res.json({ data: await listLeads(req.user.tenantId, req.valid.query) });
export const detail = async (req, res) => res.json({ data: await getLeadDetail(req.user.tenantId, req.valid.params.id) });
// Manual lead entry goes through the saveLead tool: validated, deduplicated by phone, scored, audited.
export const create = async (req, res) => res.status(201).json({ data: await runStaffTool(req, 'saveLead', req.valid.body) });
export const update = async (req, res) => res.json({ data: await updateLead(req.user.tenantId, req.valid.params.id, req.valid.body) });
export async function remove(req, res) {
  await deleteLead(req.user.tenantId, req.valid.params.id);
  res.status(204).end();
}

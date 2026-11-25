import { listCustomers, getCustomer } from '../services/customers.js';
import { deleteLead } from '../services/crm.js';
import { runStaffTool } from './toolContext.js';

export const list = async (req, res) => res.json({ data: await listCustomers(req.user.tenantId, req.valid.query) });
export const detail = async (req, res) => res.json({ data: await getCustomer(req.user.tenantId, req.valid.params.id) });

export async function create(req, res) {
  const { lead, created } = await runStaffTool(req, 'saveLead', req.valid.body);
  res.status(created ? 201 : 200).json({ data: await getCustomer(req.user.tenantId, lead.id) });
}

export async function update(req, res) {
  await getCustomer(req.user.tenantId, req.valid.params.id); // 404 unless it is a customer of this tenant
  const { leadId } = await runStaffTool(req, 'updateLead', req.valid.body, { leadId: req.valid.params.id });
  res.json({ data: await getCustomer(req.user.tenantId, leadId) });
}

export async function remove(req, res) {
  await getCustomer(req.user.tenantId, req.valid.params.id);
  await deleteLead(req.user.tenantId, req.valid.params.id);
  res.status(204).end();
}

import { listCallSummaries, getCallSummary, updateCallSummaryNotes, deleteCallSummary } from '../services/callSummaries.js';
import { runStaffTool } from './toolContext.js';

export const list = async (req, res) => res.json({ data: await listCallSummaries(req.user.tenantId, req.valid.query) });
export const detail = async (req, res) => res.json({ data: await getCallSummary(req.user.tenantId, req.valid.params.id) });
export async function create(req, res) {
  const { conversationId, end } = req.valid.body;
  res.status(201).json({ data: await runStaffTool(req, 'generateCallSummary', { end }, { conversationId }) });
}
export const update = async (req, res) => res.json({ data: await updateCallSummaryNotes(req.user.tenantId, req.valid.params.id, req.valid.body) });
export async function remove(req, res) {
  await deleteCallSummary(req.user.tenantId, req.valid.params.id);
  res.status(204).end();
}

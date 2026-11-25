import { AppError } from '../lib/errors.js';
import { getTenant } from '../services/tenants.js';
import { executeTool } from '../services/tools/executor.js';

// Staff actions from the admin console go through the same tool executor as the AI agent,
// so they are validated, authorized and written to tool_audit_log too.

const STATUS = { INVALID_ARGS: 400, FORBIDDEN: 404, NOT_FOUND: 404, CONFIRMATION_REQUIRED: 409, SLOT_TAKEN: 409, LEAD_ALREADY_BOOKED: 409, SLOT_OUTSIDE_POLICY: 422, MISSING_CONTACT: 422, UNKNOWN_TOOL: 500 };

export async function runStaffTool(req, name, args, extra = {}) {
  const { settings } = await getTenant(req.user.tenantId);
  const ctx = { tenantId: req.user.tenantId, actor: 'staff', userId: req.user.id, now: new Date(), settings, ...extra };
  const rec = await executeTool(ctx, name, args, `Staff action by ${req.user.role}`);
  if (rec.ok) return rec.result;
  // FORBIDDEN (resource in another tenant) is reported as 404 so other tenants' ids are not revealed.
  const status = rec.error.httpStatus ?? STATUS[rec.error.code] ?? 500;
  throw new AppError(status, rec.error.code === 'FORBIDDEN' ? 'NOT_FOUND' : rec.error.code, rec.error.code === 'FORBIDDEN' ? 'Resource not found' : rec.error.message);
}

/** The agent creates the caller's lead when a call starts (marked demo: callers are role-played). */
export async function runAgentTool(req, name, args, extra = {}) {
  const { settings } = await getTenant(req.user.tenantId);
  const rec = await executeTool({ tenantId: req.user.tenantId, actor: 'agent', now: new Date(), settings, ...extra }, name, args, 'Call started');
  if (!rec.ok) throw new AppError(rec.error.httpStatus ?? 500, rec.error.code, rec.error.message);
  return rec.result;
}

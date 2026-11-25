import { query } from '../../db/pool.js';
import { log } from '../../lib/logger.js';
import { maskDeep } from '../../lib/privacy.js';
import { definitionsByName } from './definitions.js';
import { handlers } from './handlers.js';

// Tool EXECUTION pipeline, the only way to run a tool:
//   1 registered  2 inputs valid (Zod)  3 actor authorized  4 resources belong to tenant
//   5 confirmation gate  6 execute  7 audit row (always, including rejections)
// Returns a structured record: { tool, actor, status: success|rejected|failed, ok, validation, result|error, durationMs }.

const stable = (v) => JSON.stringify(v, Object.keys(v || {}).sort());
const EXISTS = {
  lead: (ctx) => ctx.leadId && query('SELECT 1 FROM leads WHERE id=$1 AND tenant_id=$2', [ctx.leadId, ctx.tenantId]),
  conversation: (ctx) => ctx.conversationId && query('SELECT 1 FROM conversations WHERE id=$1 AND tenant_id=$2', [ctx.conversationId, ctx.tenantId]),
};

async function audit(ctx, record, args) {
  try {
    await query(
      // IDs are re-resolved inside the tenant, so a rejected call carrying a foreign or unknown id
      // records NULL instead of leaking another tenant's id (or failing on the foreign key).
      `INSERT INTO tool_audit_log (tenant_id, conversation_id, lead_id, actor, user_id, tool, status, error_code, args, duration_ms)
       VALUES ($1, (SELECT id FROM conversations WHERE id = $2::uuid AND tenant_id = $1),
               (SELECT id FROM leads WHERE id = $3::uuid AND tenant_id = $1), $4, $5, $6, $7, $8, $9, $10)`,
      [ctx.tenantId, ctx.conversationId ?? null, record.result?.leadId ?? ctx.leadId ?? null, ctx.actor, ctx.userId ?? null,
        record.tool, record.status, record.error?.code ?? null, args === undefined ? null : JSON.stringify(maskDeep(args)), record.durationMs],
    );
  } catch (err) {
    // The business action already happened; surface the audit failure loudly instead of hiding it.
    log.error('tool_audit_write_failed', { tool: record.tool, code: err.code, message: err.message });
    record.auditError = err.message;
  }
}

/**
 * @param ctx { tenantId, actor: 'agent'|'staff', userId?, conversationId?, leadId?, now, settings,
 *              pendingProposal?, customerConfirmed? }
 * customerConfirmed is set only by the orchestrator, only when deterministic rules detected an explicit
 * "yes" from the customer in THIS turn while a proposal was pending. Model output can never set it.
 */
export async function executeTool(ctx, name, rawArgs, reason) {
  const started = Date.now();
  const record = { tool: name, actor: ctx.actor, reason, args: rawArgs, validation: { ok: false, checks: [] } };
  const finish = async (status, extra, args) => {
    Object.assign(record, extra, { status, ok: status === 'success', durationMs: Date.now() - started });
    if (ctx.tenantId) await audit(ctx, record, args ?? rawArgs);
    return record;
  };
  const reject = (code, message) => finish('rejected', { error: { code, message } });

  const def = definitionsByName.get(name);
  if (!def || !handlers[name]) return reject('UNKNOWN_TOOL', `Tool ${name} is not registered`);
  record.sideEffect = def.sideEffect;
  record.validation.checks.push('tool registered');

  const parsed = def.argsSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) return reject('INVALID_ARGS', parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  record.validation.checks.push('arguments valid');

  if (!ctx.tenantId || !def.actors.includes(ctx.actor)) return reject('FORBIDDEN', `Actor "${ctx.actor}" may not run ${name}`);
  record.validation.checks.push('actor authorized');

  for (const resource of def.scope) {
    const r = await EXISTS[resource](ctx);
    if (!r || !r.rowCount) return reject('FORBIDDEN', `${resource} does not belong to this tenant`);
  }
  if (def.scope.length) record.validation.checks.push('resources belong to tenant');

  if (def.requiresConfirmation) {
    if (ctx.actor === 'staff') {
      record.validation.checks.push('confirmed by signed-in staff member');
    } else {
      const p = ctx.pendingProposal;
      const ok = ctx.customerConfirmed && p && p.tool === name && stable(p.args) === stable(parsed.data) && new Date(p.expiresAt) > ctx.now;
      if (!ok) return reject('CONFIRMATION_REQUIRED', 'This action needs the customer\'s explicit confirmation of the exact proposal');
      record.validation.checks.push('customer confirmed this exact proposal');
    }
  }
  record.validation.ok = true;

  try {
    const result = await handlers[name](ctx, parsed.data);
    return finish('success', { result }, parsed.data);
  } catch (err) {
    // Business outcomes such as SLOT_TAKEN arrive here as structured failures, never as crashes.
    return finish('failed', { error: { code: err.code || 'TOOL_ERROR', message: err.message, httpStatus: err.status } }, parsed.data);
  }
}

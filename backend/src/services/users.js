import { query } from '../db/pool.js';

/** Includes password_hash: only for credential checks, never returned to clients. */
export async function findUserForLogin(email) {
  const { rows } = await query(
    `SELECT u.id, u.tenant_id, u.email, u.full_name, u.role, u.password_hash, t.name AS tenant_name
       FROM users u JOIN tenants t ON t.id = u.tenant_id WHERE u.email = $1`,
    [email.toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function getUserProfile(userId) {
  const { rows } = await query(
    `SELECT u.id, u.email, u.full_name, u.role, t.name AS tenant_name
       FROM users u JOIN tenants t ON t.id = u.tenant_id WHERE u.id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

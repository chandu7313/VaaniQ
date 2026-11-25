import { readFileSync } from 'node:fs';
import pg from 'pg';
import { config } from '../config.js';

// TLS for hosted databases. Set DATABASE_SSL instead of putting sslmode in the URL:
// pg gives URL parameters precedence over this object.
function sslOptions() {
  if (config.dbSsl === 'require') return { rejectUnauthorized: false };
  if (config.dbSsl === 'verify') {
    return { rejectUnauthorized: true, ...(config.dbSslCaFile ? { ca: readFileSync(config.dbSslCaFile, 'utf8') } : {}) };
  }
  return false;
}

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolMax,
  ssl: sslOptions(),
  connectionTimeoutMillis: 10000,
});

/** Human-readable reason for a failed DB connection, without ever echoing the URL or password. */
export function describeDbError(err) {
  if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') return 'Database host not found. Supabase direct hosts (db.<ref>.supabase.co) are IPv6-only: use the Session pooler connection string.';
  if (err.code === 'ECONNREFUSED') return 'Database refused the connection: is PostgreSQL running on that host/port?';
  if (err.code === '28P01') return 'Database rejected the username/password.';
  if (err.code === '3D000') return 'Database name does not exist.';
  if (/SSL|TLS|certificate/i.test(err.message)) return `TLS problem: check DATABASE_SSL (${err.message})`;
  if (/timeout/i.test(err.message)) return 'Database connection timed out (network/firewall?).';
  return err.message;
}

export const query = (text, params) => pool.query(text, params);

/** Run fn inside a transaction; rolls back on any thrown error. */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

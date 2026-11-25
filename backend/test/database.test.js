import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool, query } from './helpers.js';
import { describeDbError } from '../src/db/pool.js';

before(async () => { await resetDb(); });
after(async () => {
  await query('DROP ROLE IF EXISTS vaaniq_rls_probe');
  await pool.end();
});

test('RLS: a non-owner role (like Supabase anon) sees no rows even with SELECT granted', async () => {
  await query('DROP ROLE IF EXISTS vaaniq_rls_probe');
  await query('CREATE ROLE vaaniq_rls_probe NOLOGIN');
  await query('GRANT SELECT ON leads, knowledge_chunks, users TO vaaniq_rls_probe');
  const owner = await query('SELECT COUNT(*)::int AS n FROM leads');
  assert.ok(owner.rows[0].n > 0, 'owner (the backend) still sees data');
  const c = await pool.connect();
  try {
    await c.query('SET ROLE vaaniq_rls_probe');
    for (const t of ['leads', 'knowledge_chunks', 'users']) {
      assert.equal((await c.query(`SELECT COUNT(*)::int AS n FROM ${t}`)).rows[0].n, 0, `${t} must be hidden`);
    }
  } finally {
    await c.query('RESET ROLE');
    await c.query('REVOKE ALL ON leads, knowledge_chunks, users FROM vaaniq_rls_probe');
    c.release();
  }
});

test('database errors are explained without leaking the connection string', () => {
  assert.match(describeDbError({ code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND db.x.supabase.co' }), /Session pooler/);
  assert.match(describeDbError({ code: '28P01', message: 'password authentication failed for user "postgres"' }), /username\/password/);
  assert.match(describeDbError({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED' }), /running/);
});

test('seed is repeatable and demo lead scores come from the scoring model', async () => {
  const { seed } = await import('../src/db/seed.js');
  const { scoreLead } = await import('../src/services/leadScoring.js');
  const { demoTenantSettings } = await import('../src/db/seedData.js');
  await seed({ adminPassword: 'test-password-1' }); // second run on an already-seeded DB
  const counts = await query(`SELECT (SELECT COUNT(*)::int FROM tenants) t, (SELECT COUNT(*)::int FROM users) u,
                                     (SELECT COUNT(*)::int FROM knowledge_documents) d, (SELECT COUNT(*)::int FROM leads WHERE is_demo) l`);
  assert.deepEqual(counts.rows[0], { t: 1, u: 1, d: 10, l: 4 });
  const { rows } = await query('SELECT full_name, profile, score, score_breakdown FROM leads WHERE is_demo ORDER BY score DESC');
  for (const l of rows) {
    const expected = scoreLead(l.profile, { catalog: demoTenantSettings.catalog, scoring: demoTenantSettings.scoring });
    assert.equal(l.score, expected.total, l.full_name);
    assert.equal(l.score_breakdown.factors.length, 5);
  }
  assert.deepEqual(rows.map((r) => r.score), [77, 60, 34, 9]);
});

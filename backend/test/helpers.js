import { migrate } from '../src/db/migrate.js';
import { pool, query } from '../src/db/pool.js';
import { seed } from '../src/db/seed.js';

if (!process.env.DATABASE_URL?.includes('_test')) throw new Error('Refusing to run tests against a non-test database');

/** Fresh schema contents + seeded demo tenant for each test file. */
export async function resetDb() {
  await migrate();
  await query('TRUNCATE tenants CASCADE');
  const { tenantId } = await seed({ adminPassword: 'test-password-1' });
  return tenantId;
}
export { pool, query };

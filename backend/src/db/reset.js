// DEV ONLY: wipes all data and re-seeds the fictional demo tenant. Requires --yes.
import { fileURLToPath } from 'node:url';
import { pool, query } from './pool.js';
import { migrate } from './migrate.js';
import { seed, DEMO_ADMIN_EMAIL } from './seed.js';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes('--yes') || process.env.NODE_ENV === 'production') {
    console.error('Refusing: this deletes ALL data. Run `npm run db:reset -- --yes` (not allowed when NODE_ENV=production).');
    process.exit(1);
  }
  migrate()
    .then(() => query('TRUNCATE tenants CASCADE'))
    .then(() => seed())
    .then((r) => { console.log(`Database reset. Demo tenant ${r.tenantId}, admin ${DEMO_ADMIN_EMAIL}`); if (r.generatedPassword) console.log(`Generated admin password: ${r.generatedPassword}`); return pool.end(); })
    .catch((e) => { console.error(e.message); process.exit(1); });
}

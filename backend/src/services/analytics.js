import { query } from '../db/pool.js';

// Every number here is computed live from PostgreSQL at request time.
export async function getOverview(tenantId) {
  const q = (sql) => query(sql, [tenantId]).then((r) => r.rows);
  const [[kpi], statusRows, scoreBuckets, daily, sentiment, intents, outcomes, tools, [latency], upcoming] = await Promise.all([
    q(`SELECT (SELECT COUNT(*)::int FROM leads WHERE tenant_id=$1) AS leads,
              (SELECT COUNT(*)::int FROM leads WHERE tenant_id=$1 AND score >= 75) AS hot_leads,
              (SELECT COALESCE(ROUND(AVG(score)),0)::int FROM leads WHERE tenant_id=$1) AS avg_score,
              (SELECT COUNT(*)::int FROM conversations WHERE tenant_id=$1) AS conversations,
              (SELECT COUNT(*)::int FROM conversations WHERE tenant_id=$1 AND status='escalated') AS escalations,
              (SELECT COUNT(*)::int FROM appointments WHERE tenant_id=$1 AND status='confirmed') AS confirmed_visits,
              (SELECT COUNT(DISTINCT lead_id)::int FROM appointments WHERE tenant_id=$1) AS leads_with_visits`),
    q(`SELECT status, COUNT(*)::int AS count FROM leads WHERE tenant_id=$1 GROUP BY status`),
    q(`SELECT CASE WHEN score >= 75 THEN 'Hot (75+)' WHEN score >= 50 THEN 'Warm (50-74)' ELSE 'Cold (<50)' END AS bucket, COUNT(*)::int AS count
         FROM leads WHERE tenant_id=$1 GROUP BY 1`),
    q(`SELECT to_char(d, 'YYYY-MM-DD') AS day,
              (SELECT COUNT(*)::int FROM conversations c WHERE c.tenant_id=$1 AND c.started_at::date = d) AS conversations,
              (SELECT COUNT(*)::int FROM appointments a WHERE a.tenant_id=$1 AND a.created_at::date = d) AS bookings
         FROM generate_series(current_date - 13, current_date, interval '1 day') d ORDER BY d`),
    q(`SELECT sentiment, COUNT(*)::int AS count FROM messages WHERE tenant_id=$1 AND role='customer' AND sentiment IS NOT NULL GROUP BY sentiment`),
    q(`SELECT intent, COUNT(*)::int AS count FROM agent_execution_logs WHERE tenant_id=$1 GROUP BY intent ORDER BY count DESC LIMIT 8`),
    q(`SELECT outcome, COUNT(*)::int AS count FROM agent_execution_logs WHERE tenant_id=$1 GROUP BY outcome ORDER BY count DESC`),
    q(`SELECT s->>'tool' AS tool, COUNT(*)::int AS calls, COUNT(*) FILTER (WHERE (s->>'ok')::boolean)::int AS succeeded
         FROM agent_execution_logs l, jsonb_array_elements(l.trace->'steps') s WHERE l.tenant_id=$1 GROUP BY 1 ORDER BY calls DESC`),
    q(`SELECT COALESCE(ROUND(AVG(latency_ms)),0)::int AS avg_ms,
              COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms),0)::int AS p95_ms FROM agent_execution_logs WHERE tenant_id=$1`),
    q(`SELECT a.id, a.starts_at, l.full_name, l.is_demo FROM appointments a JOIN leads l ON l.id=a.lead_id
         WHERE a.tenant_id=$1 AND a.status='confirmed' AND a.starts_at > now() ORDER BY a.starts_at LIMIT 5`),
  ]);
  return {
    kpi: { ...kpi, visit_conversion: kpi.leads ? Math.round((100 * kpi.leads_with_visits) / kpi.leads) : 0 },
    leadsByStatus: statusRows, scoreBuckets, daily, sentiment, intents, outcomes, tools, latency, upcoming,
    generatedAt: new Date().toISOString(),
  };
}

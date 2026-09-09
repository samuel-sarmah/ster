/**
 * Generate a large synthetic dataset (~5M rows) directly in BigQuery for
 * practicing analytics queries against a demo-sized warehouse.
 *
 * Replaces ALL tables in the dataset with fabricated but referentially intact
 * data that mirrors the real domain model:
 *   - escrow budget caps (migration 007 accounting: committed payouts can
 *     never exceed total_budget, some campaigns end up CAPPED)
 *   - 6-hour view-tracker polling cadence with viral growth curves
 *   - velocity fraud outliers (>500k views/hour jumps get flagged, same
 *     threshold as workers/view-tracker.ts)
 * Run `npm run bq:sync` afterwards to restore the real (mostly empty) state.
 *
 * Deterministic: FARM_FINGERPRINT-based pseudo-randomness, so re-runs
 * reproduce the exact same dataset.
 *
 * NOTE: this GCP project is in sandbox mode (no billing), which enforces a
 * 60-day expiration on tables. Re-running this script regenerates everything.
 *
 * Usage:
 *   npm run bq:demo
 */
import { BigQuery } from "@google-cloud/bigquery";
import { loadLocalEnv } from "../lib/env/load-local-env";

loadLocalEnv();

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET = process.env.BIGQUERY_DATASET ?? "analytics";

if (!PROJECT) {
  console.error("Missing GOOGLE_CLOUD_PROJECT in .env.local");
  process.exit(1);
}

const t = (name: string) => `\`${PROJECT}.${DATASET}.${name}\``;

// rr(k, lo, hi): deterministic float in [lo, hi] keyed by k.
const RR = `CREATE TEMP FUNCTION rr(k STRING, lo FLOAT64, hi FLOAT64) AS (
  lo + MOD(ABS(FARM_FINGERPRINT(k)), 1000000) / 999999.0 * (hi - lo)
);`;

interface Stmt {
  label: string;
  sql: string;
}

const STATEMENTS: Stmt[] = [
  {
    label: "profiles (5,200)",
    sql: `${RR}
CREATE OR REPLACE TABLE ${t("profiles")} AS
SELECT
  CONCAT('demo-', LPAD(CAST(i AS STRING), 6, '0')) AS id,
  IF(i <= 5000, 'creator', 'brand') AS role,
  CONCAT(
    ['Ava','Noah','Mia','Liam','Zoe','Kai','Ivy','Leo','Nora','Ezra','Ruby','Owen','Luna','Milo','Iris','Theo','Wren','Jude','Cleo','Finn'][OFFSET(MOD(ABS(FARM_FINGERPRINT(CONCAT('fn', i))), 20))],
    ' ',
    ['Reyes','Kim','Patel','Nguyen','Silva','Okafor','Haddad','Novak','Ito','Costa'][OFFSET(MOD(ABS(FARM_FINGERPRINT(CONCAT('ln', i))), 10))]
  ) AS display_name,
  CONCAT('https://api.dicebear.com/9.x/initials/svg?seed=demo', i) AS avatar_url,
  CAST(NULL AS STRING) AS stripe_account_id,
  CAST(NULL AS STRING) AS stripe_customer_id,
  FALSE AS is_suspended,
  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL CAST(rr(CONCAT('pc', i), 1, 720) AS INT64) DAY) AS created_at
FROM UNNEST(GENERATE_ARRAY(1, 5200)) AS i`,
  },
  {
    label: "campaigns (300)",
    sql: `${RR}
CREATE OR REPLACE TABLE ${t("campaigns")} AS
WITH b AS (
  SELECT i, ABS(FARM_FINGERPRINT(CONCAT('camp', i))) AS h
  FROM UNNEST(GENERATE_ARRAY(1, 300)) AS i
),
d AS (
  SELECT
    *,
    CASE WHEN MOD(h, 100) < 15 THEN ROUND(rr(CONCAT('tb', i), 250, 700), 2)
         ELSE ROUND(EXP(rr(CONCAT('lb', i), LN(1500), LN(60000))), 2)
    END AS total_budget,
    ROUND(rr(CONCAT('cpm', i), 2, 18), 2) AS target_cpm,
    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL CAST(rr(CONCAT('age', i), 5, 330) AS INT64) DAY) AS starts_at
  FROM b
),
e AS (
  SELECT *, TIMESTAMP_ADD(starts_at, INTERVAL CAST(rr(CONCAT('dur', i), 14, 90) AS INT64) DAY) AS ends_at
  FROM d
),
f AS (
  SELECT
    *,
    CASE
      WHEN ends_at < CURRENT_TIMESTAMP() THEN IF(MOD(h, 10) < 7, 'completed', 'archived')
      WHEN MOD(h, 100) < 8 THEN 'draft'
      WHEN MOD(h, 100) < 23 THEN 'paused'
      ELSE 'active'
    END AS status,
    (
      SELECT ARRAY(
        SELECT p FROM UNNEST(['tiktok','instagram','youtube','x']) AS p
        WHERE MOD(ABS(FARM_FINGERPRINT(CONCAT('plat', i, p))), 100)
              < CASE p WHEN 'tiktok' THEN 85 WHEN 'instagram' THEN 70 WHEN 'youtube' THEN 55 ELSE 30 END
      )
    ) AS plats_raw
  FROM e
)
SELECT
  CONCAT('cmp-', LPAD(CAST(i AS STRING), 5, '0')) AS id,
  CONCAT('demo-', LPAD(CAST(5001 + MOD(h, 200) AS STRING), 6, '0')) AS brand_id,
  CONCAT(
    ['Neon','Peak','Drift','Nova','Ember','Atlas','Flux','Vibe','Orbit','Rally'][OFFSET(MOD(h, 10))],
    ' ',
    ['Energy Drink','Running Shoes','Skincare Serum','Budgeting App','Meal Kit','Wireless Earbuds','Travel Card','Fitness App','Cold Brew','Laptop Stand'][OFFSET(MOD(DIV(h, 10), 10))],
    ' Launch'
  ) AS title,
  CONCAT('Get authentic short-form clips in front of creator audiences for the ',
         ['Neon','Peak','Drift','Nova','Ember','Atlas','Flux','Vibe','Orbit','Rally'][OFFSET(MOD(h, 10))], ' launch.') AS description,
  'Keep it native to your feed. Disclose the partnership with #ad. Minimum 15s runtime.' AS guidelines,
  CAST(target_cpm AS NUMERIC) AS target_cpm,
  CAST(total_budget AS NUMERIC) AS total_budget,
  CAST(0 AS NUMERIC) AS spent_budget,
  IF(ARRAY_LENGTH(plats_raw) = 0, ['tiktok'], plats_raw) AS platforms,
  'Vertical video, native captions, brand tag visible within the first 3 seconds.' AS content_requirements,
  status,
  CONCAT('pi_demo_', i) AS stripe_payment_intent_id,
  status IN ('completed', 'archived') AS escrow_released,
  starts_at,
  ends_at,
  TIMESTAMP_SUB(starts_at, INTERVAL 7 DAY) AS created_at
FROM f`,
  },
  {
    label: "submissions (~65k)",
    sql: `${RR}
CREATE OR REPLACE TABLE ${t("submissions")} AS
WITH camps AS (
  SELECT id AS cid, platforms, starts_at, ends_at,
         rr(CONCAT('frac', id), 0.03, 0.08) AS pick_frac
  FROM ${t("campaigns")}
  WHERE status != 'draft'
),
pool AS (
  SELECT
    cid, platforms, starts_at, ends_at, pick_frac, cand,
    ROW_NUMBER() OVER (PARTITION BY cid ORDER BY FARM_FINGERPRINT(CONCAT(cid, '|', cand))) AS rn
  FROM camps
  CROSS JOIN UNNEST(GENERATE_ARRAY(1, 5000)) AS cand
),
sel AS (
  SELECT * FROM pool WHERE rn <= CEIL(5000 * pick_frac)
),
attrs AS (
  SELECT
    *,
    CONCAT('sub-', SUBSTR(cid, 5), '-', LPAD(CAST(rn AS STRING), 5, '0')) AS sid,
    cid AS campaign_id,
    CONCAT('demo-', LPAD(CAST(cand AS STRING), 6, '0')) AS creator_id,
    CONCAT('sa-', cid, '-', cand) AS social_account_id,
    platforms[OFFSET(MOD(ABS(FARM_FINGERPRINT(CONCAT('pl', cid, rn))), ARRAY_LENGTH(platforms)))] AS platform,
    CAST(MOD(ABS(FARM_FINGERPRINT(CONCAT('pid', cid, rn))), 8000000000000000000) + 1000000000000000000 AS STRING) AS pid,
    MOD(ABS(FARM_FINGERPRINT(CONCAT('st', cid, rn))), 100) AS st_h,
    TIMESTAMP_ADD(starts_at, INTERVAL CAST(rr(CONCAT('sub', cid, rn), 0, 1)
      * TIMESTAMP_DIFF(LEAST(ends_at, CURRENT_TIMESTAMP()), starts_at, SECOND) AS INT64) SECOND) AS sub_ts
  FROM sel
)
SELECT
  sid AS id,
  campaign_id,
  creator_id,
  social_account_id,
  platform,
  CASE platform
    WHEN 'tiktok' THEN CONCAT('https://www.tiktok.com/@clipper', SUBSTR(sid, -4), '/video/', pid)
    WHEN 'instagram' THEN CONCAT('https://www.instagram.com/reel/', pid)
    WHEN 'youtube' THEN CONCAT('https://www.youtube.com/watch?v=', SUBSTR(pid, 1, 11))
    ELSE CONCAT('https://x.com/clipper', SUBSTR(sid, -4), '/status/', pid)
  END AS post_url,
  pid AS post_platform_id,
  CASE
    WHEN st_h < 17 THEN 'rejected'
    WHEN st_h < 32 THEN 'pending_review'
    WHEN st_h < 48 THEN 'approved'
    WHEN st_h < 70 THEN 'tracking'
    ELSE 'paid'
  END AS status,
  sub_ts AS submitted_at,
  IF(st_h >= 32,
     TIMESTAMP_ADD(sub_ts, INTERVAL CAST(rr(CONCAT('ap', sid), 1, 30) * 3600 AS INT64) SECOND),
     CAST(NULL AS TIMESTAMP)) AS approved_at,
  IF(st_h < 17,
     ['Off-brief content', 'Missing #ad disclosure', 'Reused existing video', 'Below quality bar'][OFFSET(MOD(st_h, 4))],
     CAST(NULL AS STRING)) AS rejection_reason
FROM attrs`,
  },
  {
    label: "view_snapshots (~4.9M)",
    sql: `${RR}
CREATE OR REPLACE TABLE ${t("view_snapshots")}
PARTITION BY DATE(fetched_at)
CLUSTER BY submission_id
AS
WITH appr AS (
  SELECT id, approved_at
  FROM ${t("submissions")}
  WHERE status IN ('approved', 'tracking', 'paid') AND approved_at IS NOT NULL
),
params AS (
  SELECT
    a.id,
    a.approved_at,
    LEAST(120, GREATEST(6, DIV(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), a.approved_at, SECOND), 21600))) AS n,
    EXP(rr(CONCAT('pk', a.id), LN(4000), LN(6000000)))
      * IF(MOD(ABS(FARM_FINGERPRINT(CONCAT('vir', a.id))), 1000) < 8, 6.0, 1.0) AS peak,
    rr(CONCAT('tau', a.id), 8, 45) AS tau,
    MOD(ABS(FARM_FINGERPRINT(CONCAT('frd', a.id))), 1000) < 1 AS fraud
  FROM appr a
),
gen AS (
  SELECT
    p.id,
    idx,
    -- Anchor the timeline at NOW extending backwards so every partition sits
    -- inside the sandbox's enforced 60-day expiration window (otherwise older
    -- history is auto-deleted on insert).
    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL CAST((CAST(p.n AS INT64) - idx) * 21600 AS INT64) SECOND) AS fetched_at,
    CAST(ROUND(p.peak * (1 - EXP(-idx / p.tau))
      * (0.97 + 0.06 * MOD(ABS(FARM_FINGERPRINT(CONCAT('nz', p.id, idx))), 1000) / 1000.0)) AS INT64)
      + IF(p.fraud AND idx = DIV(CAST(p.n AS INT64), 2), 4000000, 0) AS raw_v
  FROM params p
  CROSS JOIN UNNEST(GENERATE_ARRAY(1, CAST(p.n AS INT64))) AS idx
),
mono AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY id ORDER BY fetched_at) AS k,
    MAX(raw_v) OVER (PARTITION BY id ORDER BY fetched_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS view_count,
    fetched_at
  FROM gen
)
SELECT
  CONCAT('vs-', id, '-', LPAD(CAST(k AS STRING), 4, '0')) AS id,
  id AS submission_id,
  view_count,
  fetched_at
FROM mono`,
  },
  {
    label: "earnings (~47k, budget-capped)",
    sql: `${RR}
CREATE OR REPLACE TABLE ${t("earnings")} AS
WITH final AS (
  SELECT submission_id, view_count AS verified_views, fetched_at AS last_ts,
         ROW_NUMBER() OVER (PARTITION BY submission_id ORDER BY fetched_at DESC) AS rn
  FROM ${t("view_snapshots")}
),
base AS (
  SELECT
    s.id AS submission_id,
    s.creator_id,
    s.campaign_id,
    fv.verified_views,
    fv.last_ts,
    c.target_cpm,
    c.total_budget,
    ROUND(fv.verified_views / 1000 * c.target_cpm, 2) AS uncapped
  FROM ${t("submissions")} s
  JOIN final fv ON fv.submission_id = s.id AND fv.rn = 1
  JOIN ${t("campaigns")} c ON c.id = s.campaign_id
),
cum AS (
  SELECT
    *,
    SUM(uncapped) OVER (PARTITION BY campaign_id ORDER BY last_ts, submission_id
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_incl
  FROM base
),
capped AS (
  SELECT
    *,
    ROUND(LEAST(uncapped, GREATEST(total_budget - (cum_incl - uncapped), 0)), 2) AS amount_usd,
    CASE WHEN verified_views >= 10000 THEN 'confirmed' ELSE 'pending' END AS status_raw
  FROM cum
),
paid_flag AS (
  SELECT
    *,
    status_raw = 'confirmed'
      AND amount_usd > 0
      AND MOD(ABS(FARM_FINGERPRINT(CONCAT('pay', submission_id))), 100) < 40 AS is_paid
  FROM capped
)
SELECT
  CONCAT('ern-', submission_id) AS id,
  submission_id,
  creator_id,
  campaign_id,
  verified_views,
  CAST(amount_usd AS NUMERIC) AS amount_usd,
  IF(is_paid, 'paid', status_raw) AS status,
  IF(is_paid, CONCAT('tr_demo_', SUBSTR(TO_HEX(MD5(submission_id)), 1, 16)), CAST(NULL AS STRING)) AS stripe_transfer_id,
  IF(is_paid,
     TIMESTAMP_ADD(last_ts, INTERVAL CAST(rr(CONCAT('pd', submission_id), 1, 120) * 86400 AS INT64) SECOND),
     CAST(NULL AS TIMESTAMP)) AS paid_at,
  last_ts AS updated_at
FROM paid_flag`,
  },
  {
    label: "campaigns.spent_budget rollup",
    sql: `-- Sandbox/free-tier projects disallow DML, so rebuild via CTAS instead of UPDATE.
CREATE OR REPLACE TABLE ${t("campaigns")} AS
SELECT
  c.* EXCEPT(spent_budget),
  CAST(COALESCE(agg.t, 0) AS NUMERIC) AS spent_budget
FROM ${t("campaigns")} c
LEFT JOIN (
  SELECT campaign_id, SUM(amount_usd) AS t
  FROM ${t("earnings")}
  GROUP BY campaign_id
) agg ON agg.campaign_id = c.id`,
  },
];

async function main() {
  const bq = new BigQuery({ projectId: PROJECT! });

  for (const stmt of STATEMENTS) {
    process.stdout.write(`[bq:demo] ${stmt.label} ... `);
    await bq.query(stmt.sql);
    console.log("done");
  }

  const countSql = ["profiles", "submissions", "view_snapshots", "earnings", "campaigns"]
    .map((name) => `SELECT '${name}' AS t, COUNT(*) AS c FROM ${t(name)}`)
    .join(" UNION ALL ");
  const [countRows] = await bq.query(countSql);

  console.log("\nRow counts:");
  let total = 0;
  for (const row of countRows as { t: string; c: number }[]) {
    total += Number(row.c);
    console.log(`  ${row.t.padEnd(15)} ${Number(row.c).toLocaleString()}`);
  }
  console.log(`  ${"TOTAL".padEnd(15)} ${total.toLocaleString()}`);

  const [budgetRows] = await bq.query(`
    WITH committed AS (
      SELECT campaign_id, SUM(amount_usd) AS committed_usd
      FROM ${t("earnings")}
      GROUP BY campaign_id
    )
    SELECT
      CASE
        WHEN committed.committed_usd >= c.total_budget THEN 'CAPPED'
        WHEN SAFE_DIVIDE(committed.committed_usd, c.total_budget) >= 0.8 THEN 'NEARING CAP'
        ELSE 'OK'
      END AS budget_state,
      COUNT(*) AS campaigns
    FROM ${t("campaigns")} c
    JOIN committed ON committed.campaign_id = c.id
    WHERE c.status IN ('active', 'paused')
    GROUP BY budget_state
  `);
  console.log("\nActive/paused campaign budget states:");
  for (const row of budgetRows as { budget_state: string; campaigns: number }[]) {
    console.log(`  ${row.budget_state.padEnd(12)} ${Number(row.campaigns)}`);
  }

  console.log(`\nDone. Dataset: ${PROJECT}.${DATASET}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});

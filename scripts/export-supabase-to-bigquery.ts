/**
 * Export Supabase tables to BigQuery (analytics dataset).
 *
 * One-command sync: reads submissions, view_snapshots, earnings and campaigns
 * from Supabase, writes NDJSON staging files to exports/, creates the BigQuery
 * tables if missing, and bulk-loads them with WRITE_TRUNCATE so re-running
 * refreshes mutable tables idempotently.
 *
 * NOTE: this GCP project is in sandbox mode (no billing), which enforces a
 * 60-day table/partition expiration on everything in the analytics dataset.
 * Re-running this script fully restores any expired tables.
 *
 * Usage:
 *   npm run bq:sync
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (service role) in
 * .env.local. Auth to Google Cloud uses Application Default Credentials — run
 * `gcloud auth application-default login` once; no service account key needed.
 */
import { createClient } from "@supabase/supabase-js";
import { BigQuery } from "@google-cloud/bigquery";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// --- minimal .env.local loader (tsx scripts don't auto-load it) ---
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const i = trimmed.indexOf("=");
      const key = trimmed.slice(0, i).trim();
      const val = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // fall back to whatever is already in process.env
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const GCP_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET_ID = process.env.BIGQUERY_DATASET ?? "analytics";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}
if (!GCP_PROJECT) {
  console.error("Missing GOOGLE_CLOUD_PROJECT in .env.local");
  process.exit(1);
}

const EXPORTS_DIR = resolve(process.cwd(), "exports");
const PAGE_SIZE = 1000;

// PostgREST returns NUMERIC columns as JSON numbers; string-encode them so
// money precision survives the NDJSON -> NUMERIC round-trip losslessly.
const NUMERIC_FIELDS = new Set(["amount_usd", "target_cpm", "total_budget", "spent_budget"]);

function normalizeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v === undefined ? null : NUMERIC_FIELDS.has(k) && v !== null ? String(v) : v;
  }
  return out;
}

async function fetchAllRows(supabase: any, table: string, orderCol: string) {
  const rows: Record<string, unknown>[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderCol)
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return rows.map(normalizeRow);
}

interface TableSpec {
  name: string;
  orderCol: string;
  schema: { name: string; type: string; mode?: string }[];
  timePartitioning?: { type: "DAY"; field: string };
  clustering?: { fields: string[] };
}

const TABLE_SPECS: TableSpec[] = [
  {
    name: "profiles",
    orderCol: "id",
    schema: [
      { name: "id", type: "STRING" },
      { name: "role", type: "STRING" },
      { name: "display_name", type: "STRING" },
      { name: "avatar_url", type: "STRING" },
      { name: "stripe_account_id", type: "STRING" },
      { name: "stripe_customer_id", type: "STRING" },
      { name: "is_suspended", type: "BOOL" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "submissions",
    orderCol: "id",
    schema: [
      { name: "id", type: "STRING" },
      { name: "campaign_id", type: "STRING" },
      { name: "creator_id", type: "STRING" },
      { name: "social_account_id", type: "STRING" },
      { name: "platform", type: "STRING" },
      { name: "post_url", type: "STRING" },
      { name: "post_platform_id", type: "STRING" },
      { name: "status", type: "STRING" },
      { name: "submitted_at", type: "TIMESTAMP" },
      { name: "approved_at", type: "TIMESTAMP" },
      { name: "rejection_reason", type: "STRING" },
    ],
  },
  {
    // Append-only time series: partition by day, cluster per submission so
    // velocity/trend queries only scan the relevant slices.
    name: "view_snapshots",
    orderCol: "fetched_at",
    timePartitioning: { type: "DAY", field: "fetched_at" },
    clustering: { fields: ["submission_id"] },
    schema: [
      { name: "id", type: "STRING" },
      { name: "submission_id", type: "STRING" },
      { name: "view_count", type: "INT64" },
      { name: "fetched_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "earnings",
    orderCol: "updated_at",
    schema: [
      { name: "id", type: "STRING" },
      { name: "submission_id", type: "STRING" },
      { name: "creator_id", type: "STRING" },
      { name: "campaign_id", type: "STRING" },
      { name: "verified_views", type: "INT64" },
      { name: "amount_usd", type: "NUMERIC" },
      { name: "status", type: "STRING" },
      { name: "stripe_transfer_id", type: "STRING" },
      { name: "paid_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "campaigns",
    orderCol: "created_at",
    schema: [
      { name: "id", type: "STRING" },
      { name: "brand_id", type: "STRING" },
      { name: "title", type: "STRING" },
      { name: "description", type: "STRING" },
      { name: "guidelines", type: "STRING" },
      { name: "target_cpm", type: "NUMERIC" },
      { name: "total_budget", type: "NUMERIC" },
      { name: "spent_budget", type: "NUMERIC" },
      { name: "platforms", type: "STRING", mode: "REPEATED" },
      { name: "content_requirements", type: "STRING" },
      { name: "status", type: "STRING" },
      { name: "stripe_payment_intent_id", type: "STRING" },
      { name: "escrow_released", type: "BOOL" },
      { name: "starts_at", type: "TIMESTAMP" },
      { name: "ends_at", type: "TIMESTAMP" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
];

async function ensureTable(dataset: ReturnType<BigQuery["dataset"]>, spec: TableSpec) {
  const table = dataset.table(spec.name);
  const [exists] = await table.exists();
  if (!exists) {
    await dataset.createTable(spec.name, {
      schema: spec.schema,
      ...(spec.timePartitioning ? { timePartitioning: spec.timePartitioning } : {}),
      ...(spec.clustering ? { clustering: spec.clustering } : {}),
    });
    console.log(`[bq] created table ${spec.name}`);
  }
  return table;
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  const bq = new BigQuery({ projectId: GCP_PROJECT });
  const dataset = bq.dataset(DATASET_ID);

  mkdirSync(EXPORTS_DIR, { recursive: true });
  const counts: Record<string, number> = {};

  for (const spec of TABLE_SPECS) {
    process.stdout.write(`[export] ${spec.name} ... `);
    const rows = await fetchAllRows(supabase, spec.name, spec.orderCol);
    counts[spec.name] = rows.length;

    const file = resolve(EXPORTS_DIR, `${spec.name}.ndjson`);
    writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
    console.log(`${rows.length} rows -> exports/${spec.name}.ndjson`);

    const table = await ensureTable(dataset, spec);
    const opts = {
      format: "json", // maps to NEWLINE_DELIMITED_JSON
      writeDisposition: "WRITE_TRUNCATE",
    };
    if (rows.length > 0) {
      const [job] = await table.load(file, opts);
      const err = job.status?.errorResult;
      if (err) throw new Error(`load ${spec.name}: ${err.message}`);
      console.log(`[bq] loaded ${spec.name} (job ${job.id})`);
    } else {
      console.log(`[bq] ${spec.name}: nothing to load`);
    }
  }

  // Parity check straight from BigQuery
  const unionSql = TABLE_SPECS.map(
    (s) => `SELECT '${s.name}' AS t, COUNT(*) AS c FROM \`${GCP_PROJECT}.${DATASET_ID}.${s.name}\``
  ).join(" UNION ALL ");
  const [bqCounts] = await bq.query(unionSql);

  console.log("\nRow-count parity (supabase -> bigquery):");
  let ok = true;
  for (const row of bqCounts as { t: string; c: number }[]) {
    const match = counts[row.t] === Number(row.c);
    ok = ok && match;
    console.log(`  ${row.t.padEnd(15)} ${counts[row.t]} -> ${row.c} ${match ? "OK" : "MISMATCH"}`);
  }

  if (!ok) throw new Error("Row counts do not match — inspect the load jobs above.");
  console.log("\nDone. Dataset: " + `${GCP_PROJECT}.${DATASET_ID}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});

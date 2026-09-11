import { BigQuery, Dataset } from "@google-cloud/bigquery";

/** The analytics dataset lives in the US multi-region; jobs must match it. */
const LOCATION = "US";

/** Abandon a report query rather than let an admin page hang on a slow job. */
const JOB_TIMEOUT_MS = 30_000;

/** Hard ceiling per query. BigQuery kills the job rather than billing past it. */
const DEFAULT_MAX_BYTES_BILLED = 512 * 1024 * 1024;

let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient() {
  if (bigqueryClient) return bigqueryClient;

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error("Missing GOOGLE_CLOUD_PROJECT");
  }

  bigqueryClient = new BigQuery({ projectId });
  return bigqueryClient;
}

export function getAnalyticsDataset(): Dataset {
  const datasetId = process.env.BIGQUERY_DATASET ?? "analytics";
  return getBigQueryClient().dataset(datasetId);
}

/** Table names are interpolated into SQL, so they must be bare identifiers. */
const TABLE_NAME_PATTERN = /^[A-Za-z0-9_]+$/;

/**
 * Fully-qualified backtick table reference for the configured project/dataset,
 * e.g. `my-project.analytics.earnings`. Pass a table name (no backticks) to
 * interpolate into hand-written SQL so queries respect the deployed env
 * instead of a hardcoded project.
 */
export function tableRef(name: string): string {
  if (!TABLE_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid BigQuery table name: ${name}`);
  }
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const datasetId = process.env.BIGQUERY_DATASET ?? "analytics";
  if (!projectId) {
    throw new Error("Missing GOOGLE_CLOUD_PROJECT");
  }
  return `\`${projectId}.${datasetId}.${name}\``;
}

export type AnalyticsRow = Record<string, unknown>;

/** A report's SQL plus the named parameters it expects. */
export interface AnalyticsQuery {
  sql: string;
  params: Record<string, unknown>;
}

function maxBytesBilled(): string {
  const configured = Number(process.env.BIGQUERY_MAX_BYTES_BILLED);
  const bytes =
    Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_MAX_BYTES_BILLED;
  return String(Math.floor(bytes));
}

/**
 * BigQuery hands back wrapper objects rather than JS primitives: TIMESTAMP/DATE/
 * DATETIME arrive as `{ value: string }` and NUMERIC/BIGNUMERIC as big.js `Big`
 * instances. Both survive JSON.stringify in a shape the UI can't use — a
 * timestamp serializes to a nested object, so `String(row.fetched_at)` yields
 * "[object Object]" and renders as an Invalid Date.
 *
 * Unwrap by value shape only. Never sniff strings for number-ish content: a
 * genuine STRING column (a display name of "3.5", say) must stay a string.
 */
export function normalizeRow(row: AnalyticsRow): AnalyticsRow {
  const out: AnalyticsRow = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = normalizeValue(value);
  }
  return out;
}

function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) return value.map(normalizeValue);

  // BigQueryTimestamp / BigQueryDate / BigQueryDatetime / BigQueryTime.
  const wrapped = (value as { value?: unknown }).value;
  if (typeof wrapped === "string") return wrapped;

  // big.js Big — NUMERIC and BIGNUMERIC columns.
  if (isBig(value)) return Number(value.toString());

  // Nested STRUCT.
  return normalizeRow(value as AnalyticsRow);
}

function isBig(value: object): value is { toString(): string } {
  return (
    "s" in value &&
    "e" in value &&
    "c" in value &&
    Array.isArray((value as { c: unknown }).c)
  );
}

export interface AnalyticsQueryOptions {
  params?: Record<string, unknown>;
  maximumBytesBilled?: string;
}

/**
 * Runs a report query against the analytics dataset under a byte budget and a
 * job timeout, and unwraps BigQuery's column wrappers into plain JSON values.
 */
export async function runAnalyticsQuery(
  sql: string,
  opts: AnalyticsQueryOptions = {}
): Promise<AnalyticsRow[]> {
  const [rows] = await getBigQueryClient().query({
    query: sql,
    useLegacySql: false,
    location: LOCATION,
    jobTimeoutMs: JOB_TIMEOUT_MS,
    maximumBytesBilled: opts.maximumBytesBilled ?? maxBytesBilled(),
    labels: { feature: "admin-analytics" },
    ...(opts.params ? { params: opts.params } : {}),
  });

  return (rows as AnalyticsRow[]).map(normalizeRow);
}

/**
 * Validates a query against the live schema and reports what it would scan,
 * without running it. Dry runs are billed at $0, which makes them cheap enough
 * to assert cost budgets in tests.
 */
export async function dryRunAnalyticsQuery(
  sql: string,
  params?: Record<string, unknown>
): Promise<{ totalBytesProcessed: number }> {
  const [job] = await getBigQueryClient().createQueryJob({
    query: sql,
    useLegacySql: false,
    location: LOCATION,
    dryRun: true,
    ...(params ? { params } : {}),
  });

  const stats = job.metadata?.statistics;
  return { totalBytesProcessed: Number(stats?.totalBytesProcessed ?? 0) };
}

import { BigQuery, Dataset } from "@google-cloud/bigquery";

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

/**
 * Mirrors one public.view_snapshots row into BigQuery.
 * Analytics-only: callers must treat failures as non-fatal so tracking and
 * payout accrual are never blocked by warehouse availability.
 */
export interface ViewSnapshotEvent {
  submission_id: string;
  view_count: number;
  fetched_at: string; // ISO 8601 timestamp
}

export function insertViewSnapshotEvent(event: ViewSnapshotEvent) {
  return getAnalyticsDataset().table("view_snapshots").insert([event]);
}

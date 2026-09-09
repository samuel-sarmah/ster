import { loadLocalEnv } from "./lib/env/load-local-env";

// Vitest doesn't bootstrap Next's env loading, and the BigQuery tests need
// GOOGLE_CLOUD_PROJECT / BIGQUERY_DATASET from .env.local.
loadLocalEnv();

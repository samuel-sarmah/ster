import { tableRef, type AnalyticsQuery } from "./index";

/**
 * Parameterized versions of the analytics reports. These interpolate the
 * deployed project/dataset via tableRef() so the UI always targets the
 * configured warehouse rather than a hardcoded project.
 *
 * This module is the single source of truth for the report SQL.
 */

/**
 * Default window for the velocity report, in days. Kept well inside the depth
 * of the warehouse so the partition filter actually prunes: measured on the
 * demo dataset, 3d scans 29 MB, 14d 103 MB, and 30d or wider the whole 199 MB
 * table. This is a fraud report, so recent events are what matter anyway.
 */
export const DEFAULT_VELOCITY_LOOKBACK_DAYS = 14;
export const MIN_VELOCITY_LOOKBACK_DAYS = 1;
export const MAX_VELOCITY_LOOKBACK_DAYS = 90;

/** Rows returned by campaignsNearingBudgetCap(). */
export interface CampaignCapRow {
  title: string | null;
  campaign_id: string;
  status: string | null;
  target_cpm: number | null;
  total_budget: number | null;
  committed_usd: number | null;
  headroom_usd: number | null;
  pct_used: number | null;
  budget_state: "CAPPED" | "NEARING CAP" | "OK";
}

/** Rows returned by earningsPerCreator(). */
export interface CreatorEarningsRow {
  display_name: string | null;
  creator_id: string;
  submissions_with_earnings: number;
  total_verified_views: number | null;
  total_amount_usd: number | null;
  effective_usd_per_1k_views: number | null;
  earnings_statuses: string | null;
}

/** Rows returned by viewVelocity(). `fetched_at` is an ISO 8601 string. */
export interface ViewVelocityRow {
  fetched_at: string;
  platform: string | null;
  submission_status: string | null;
  submission_id: string;
  prev_view_count: number | null;
  view_count: number | null;
  views_per_hour: number | null;
  lifetime_avg_views_per_hour: number | null;
  velocity_flag: "FLAG" | "";
}

/**
 * Campaigns near/over their escrow budget cap.
 * Reimplements the cap accounting from migration 007: a campaign's TOTAL
 * committed payouts are SUM(earnings.amount_usd); pct_used >= 100% means new
 * views stop paying out entirely.
 */
export function campaignsNearingBudgetCap(): AnalyticsQuery {
  const earnings = tableRef("earnings");
  const campaigns = tableRef("campaigns");

  return {
    params: {},
    sql: `
    WITH committed AS (
      SELECT
        campaign_id,
        SUM(amount_usd) AS committed_usd,
        SUM(verified_views) AS verified_views,
        COUNT(*) AS funded_submissions
      FROM ${earnings}
      GROUP BY campaign_id
    )
    SELECT
      c.title,
      c.id AS campaign_id,
      c.status,
      c.target_cpm,
      c.total_budget,
      ROUND(committed.committed_usd, 2) AS committed_usd,
      ROUND(GREATEST(c.total_budget - committed.committed_usd, 0), 2) AS headroom_usd,
      ROUND(SAFE_DIVIDE(committed.committed_usd, c.total_budget) * 100, 1) AS pct_used,
      CASE
        WHEN committed.committed_usd >= c.total_budget THEN 'CAPPED'
        WHEN SAFE_DIVIDE(committed.committed_usd, c.total_budget) >= 0.8 THEN 'NEARING CAP'
        ELSE 'OK'
      END AS budget_state
    FROM ${campaigns} AS c
    JOIN committed
      ON committed.campaign_id = c.id
    WHERE c.status IN ('active', 'paused')
    ORDER BY pct_used DESC
  `,
  };
}

/**
 * Per-creator earnings: total verified views, committed USD, and effective
 * payout rate per 1,000 views (sits below target CPM for creators whose posts
 * hit a campaign's budget cap).
 */
export function earningsPerCreator(): AnalyticsQuery {
  const earnings = tableRef("earnings");
  const profiles = tableRef("profiles");

  return {
    params: {},
    sql: `
    SELECT
      p.display_name,
      e.creator_id,
      COUNT(*) AS submissions_with_earnings,
      SUM(e.verified_views) AS total_verified_views,
      ROUND(SUM(e.amount_usd), 2) AS total_amount_usd,
      ROUND(SAFE_DIVIDE(SUM(e.amount_usd), SUM(e.verified_views) / 1000), 4) AS effective_usd_per_1k_views,
      STRING_AGG(DISTINCT e.status, ',' ORDER BY e.status) AS earnings_statuses
    FROM ${earnings} AS e
    LEFT JOIN ${profiles} AS p
      ON p.id = e.creator_id
    GROUP BY e.creator_id, p.display_name
    ORDER BY total_amount_usd DESC
  `,
  };
}

/**
 * View velocity over time — mirrors the fraud check in workers/view-tracker.ts
 * (500,000 views/hour threshold). Top 50 fastest growth events first.
 *
 * The fetched_at predicate is load-bearing: view_snapshots is DAY-partitioned on
 * that column, and without it the window function scans every partition ever
 * written. Query parameters prune partitions just as well as literals here.
 */
export function viewVelocity(
  lookbackDays: number = DEFAULT_VELOCITY_LOOKBACK_DAYS
): AnalyticsQuery {
  const snapshots = tableRef("view_snapshots");
  const submissions = tableRef("submissions");

  return {
    params: { lookback_days: lookbackDays },
    sql: `
    WITH ordered AS (
      SELECT
        submission_id,
        fetched_at,
        view_count,
        LAG(view_count) OVER w AS prev_view_count,
        LAG(fetched_at) OVER w AS prev_fetched_at,
        FIRST_VALUE(view_count) OVER w AS baseline_views,
        MIN(fetched_at) OVER w AS baseline_ts
      FROM ${snapshots}
      WHERE fetched_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @lookback_days DAY)
      WINDOW w AS (PARTITION BY submission_id ORDER BY fetched_at)
    ),
    velocity AS (
      SELECT
        *,
        SAFE_DIVIDE(
          view_count - prev_view_count,
          TIMESTAMP_DIFF(fetched_at, prev_fetched_at, SECOND) / 3600.0
        ) AS views_per_hour,
        SAFE_DIVIDE(
          view_count - baseline_views,
          TIMESTAMP_DIFF(fetched_at, baseline_ts, SECOND) / 3600.0
        ) AS lifetime_avg_views_per_hour
      FROM ordered
      WHERE prev_fetched_at IS NOT NULL
    )
    SELECT
      v.fetched_at,
      s.platform,
      s.status AS submission_status,
      v.submission_id,
      v.prev_view_count,
      v.view_count,
      ROUND(v.views_per_hour) AS views_per_hour,
      ROUND(v.lifetime_avg_views_per_hour) AS lifetime_avg_views_per_hour,
      CASE WHEN v.views_per_hour > 500000 THEN 'FLAG' ELSE '' END AS velocity_flag
    FROM velocity AS v
    JOIN ${submissions} AS s
      ON s.id = v.submission_id
    ORDER BY v.views_per_hour DESC
    LIMIT 50
  `,
  };
}

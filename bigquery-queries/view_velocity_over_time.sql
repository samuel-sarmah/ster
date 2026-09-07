-- View velocity over time.
--
-- Mirrors the fraud check in workers/view-tracker.ts: compares consecutive
-- snapshots per submission and derives views/hour between them. The
-- velocity_flag column marks the same 500,000 views/hour threshold the worker
-- uses to raise admin_flags. Top 50 fastest growth events first.
WITH ordered AS (
  SELECT
    submission_id,
    fetched_at,
    view_count,
    LAG(view_count) OVER w AS prev_view_count,
    LAG(fetched_at) OVER w AS prev_fetched_at,
    FIRST_VALUE(view_count) OVER w AS baseline_views,
    MIN(fetched_at) OVER w AS baseline_ts
  FROM `sterclip.analytics.view_snapshots`
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
JOIN `sterclip.analytics.submissions` AS s
  ON s.id = v.submission_id
ORDER BY v.views_per_hour DESC
LIMIT 50;

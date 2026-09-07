-- Campaigns nearing their escrow budget cap.
--
-- Reimplements the cap accounting from supabase/migrations/007 in SQL:
-- a campaign's TOTAL committed payouts are SUM(earnings.amount_usd), and the
-- accrual function caps each row so that sum never exceeds total_budget.
-- pct_used >= 100% means new views on this campaign stop paying out entirely.
WITH committed AS (
  SELECT
    campaign_id,
    SUM(amount_usd) AS committed_usd,
    SUM(verified_views) AS verified_views,
    COUNT(*) AS funded_submissions
  FROM `sterclip.analytics.earnings`
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
FROM `sterclip.analytics.campaigns` AS c
JOIN committed
  ON committed.campaign_id = c.id
WHERE c.status IN ('active', 'paused')
ORDER BY pct_used DESC;

-- Earnings per creator.
--
-- Aggregates every earnings row by creator: total verified views, total
-- committed USD, and the effective payout rate per 1,000 views (which will sit
-- below target CPM for creators whose posts hit a campaign's budget cap).
SELECT
  p.display_name,
  e.creator_id,
  COUNT(*) AS submissions_with_earnings,
  SUM(e.verified_views) AS total_verified_views,
  ROUND(SUM(e.amount_usd), 2) AS total_amount_usd,
  ROUND(SAFE_DIVIDE(SUM(e.amount_usd), SUM(e.verified_views) / 1000), 4) AS effective_usd_per_1k_views,
  STRING_AGG(DISTINCT e.status, ',' ORDER BY e.status) AS earnings_statuses
FROM `sterclip.analytics.earnings` AS e
LEFT JOIN `sterclip.analytics.profiles` AS p
  ON p.id = e.creator_id
GROUP BY e.creator_id, p.display_name
ORDER BY total_amount_usd DESC;

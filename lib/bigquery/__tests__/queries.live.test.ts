import { describe, it, expect } from "vitest";
import { runAnalyticsQuery } from "../index";
import {
  campaignsNearingBudgetCap,
  earningsPerCreator,
  viewVelocity,
} from "../queries";

/**
 * Actually executes each report against the warehouse and asserts the returned
 * shape matches the exported row interfaces. Opt-in (`npm run test:live`)
 * because unlike the dry runs these scan real bytes.
 */

const CAMPAIGN_CAP_COLUMNS = [
  "title", "campaign_id", "status", "target_cpm", "total_budget",
  "committed_usd", "headroom_usd", "pct_used", "budget_state",
];

const CREATOR_EARNINGS_COLUMNS = [
  "display_name", "creator_id", "submissions_with_earnings",
  "total_verified_views", "total_amount_usd", "effective_usd_per_1k_views",
  "earnings_statuses",
];

const VIEW_VELOCITY_COLUMNS = [
  "fetched_at", "platform", "submission_status", "submission_id",
  "prev_view_count", "view_count", "views_per_hour",
  "lifetime_avg_views_per_hour", "velocity_flag",
];

describe("report execution", () => {
  it("campaigns-cap returns the declared columns with numeric money fields", async () => {
    const { sql, params } = campaignsNearingBudgetCap();
    const rows = await runAnalyticsQuery(sql, { params });

    expect(rows.length).toBeGreaterThan(0);
    expect(Object.keys(rows[0]).sort()).toEqual([...CAMPAIGN_CAP_COLUMNS].sort());

    for (const row of rows.slice(0, 25)) {
      // NUMERIC must arrive as a number, not a Big or a string.
      expect(typeof row.committed_usd).toBe("number");
      expect(typeof row.total_budget).toBe("number");
      expect(typeof row.title).toBe("string");
      expect(["CAPPED", "NEARING CAP", "OK"]).toContain(row.budget_state);
    }
  });

  it("creator-earnings returns the declared columns", async () => {
    const { sql, params } = earningsPerCreator();
    const rows = await runAnalyticsQuery(sql, { params });

    expect(rows.length).toBeGreaterThan(0);
    expect(Object.keys(rows[0]).sort()).toEqual([...CREATOR_EARNINGS_COLUMNS].sort());

    for (const row of rows.slice(0, 25)) {
      expect(typeof row.total_amount_usd).toBe("number");
      expect(typeof row.total_verified_views).toBe("number");
      expect(typeof row.creator_id).toBe("string");
    }
  });

  it("view-velocity returns fetched_at as a parseable ISO string", async () => {
    const { sql, params } = viewVelocity();
    const rows = await runAnalyticsQuery(sql, { params });

    expect(rows.length).toBeGreaterThan(0);
    expect(Object.keys(rows[0]).sort()).toEqual([...VIEW_VELOCITY_COLUMNS].sort());

    for (const row of rows) {
      // The direct assertion for the "Invalid Date" regression: the component
      // does new Date(row.fetched_at), which only works on a plain string.
      expect(typeof row.fetched_at).toBe("string");
      expect(Number.isNaN(Date.parse(row.fetched_at as string))).toBe(false);
      expect(typeof row.view_count).toBe("number");
      expect(["FLAG", ""]).toContain(row.velocity_flag);
    }
  });

  it("respects a maximumBytesBilled ceiling", async () => {
    const { sql, params } = viewVelocity();

    // 1 MB is far below what this query needs; BigQuery must refuse the job
    // rather than bill past the cap.
    await expect(
      runAnalyticsQuery(sql, { params, maximumBytesBilled: String(1024 * 1024) })
    ).rejects.toThrow();
  });
});

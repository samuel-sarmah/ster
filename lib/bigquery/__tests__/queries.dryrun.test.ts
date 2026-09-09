import { describe, it, expect } from "vitest";
import { dryRunAnalyticsQuery } from "../index";
import {
  campaignsNearingBudgetCap,
  earningsPerCreator,
  viewVelocity,
  DEFAULT_VELOCITY_LOOKBACK_DAYS,
} from "../queries";

/**
 * Dry runs validate each report against the LIVE warehouse schema and report
 * what it would scan, without executing it — BigQuery bills dry runs at $0.
 *
 * These catch two classes of regression the type system cannot: SQL that no
 * longer matches the deployed schema (a renamed or dropped column), and a query
 * whose cost has quietly grown.
 *
 * Requires Application Default Credentials:
 *   gcloud auth application-default login
 */

const MB = 1024 * 1024;

describe("report SQL dry runs", () => {
  it("campaigns-cap is valid and cheap", async () => {
    const { sql, params } = campaignsNearingBudgetCap();
    const { totalBytesProcessed } = await dryRunAnalyticsQuery(sql, params);

    expect(totalBytesProcessed).toBeGreaterThan(0);
    expect(totalBytesProcessed).toBeLessThan(5 * MB);
  });

  it("creator-earnings is valid and cheap", async () => {
    const { sql, params } = earningsPerCreator();
    const { totalBytesProcessed } = await dryRunAnalyticsQuery(sql, params);

    expect(totalBytesProcessed).toBeGreaterThan(0);
    expect(totalBytesProcessed).toBeLessThan(10 * MB);
  });

  it("view-velocity is valid and stays within its scan budget", async () => {
    const { sql, params } = viewVelocity();
    const { totalBytesProcessed } = await dryRunAnalyticsQuery(sql, params);

    expect(totalBytesProcessed).toBeGreaterThan(0);
    // Unbounded, this query scans the whole of view_snapshots (~199 MB today,
    // and growing). The fetched_at partition filter is what holds it here.
    expect(totalBytesProcessed).toBeLessThan(120 * MB);
  });

  it("view-velocity keeps a fetched_at predicate so partitions can prune", () => {
    const { sql, params } = viewVelocity();

    expect(sql).toMatch(/WHERE\s+fetched_at\s+>=/);
    expect(sql).toContain("@lookback_days");
    expect(params).toEqual({ lookback_days: DEFAULT_VELOCITY_LOOKBACK_DAYS });
  });

  it("prunes partitions — a narrower lookback scans substantially less", async () => {
    // Proves the DAY partitioning is actually doing work, independent of how
    // deep the warehouse happens to be. If pruning silently stopped (a filter
    // BigQuery can't push down, say), these two would converge.
    const wide = await dryRunAnalyticsQuery(...toArgs(viewVelocity(90)));
    const narrow = await dryRunAnalyticsQuery(...toArgs(viewVelocity(3)));

    expect(narrow.totalBytesProcessed).toBeLessThan(wide.totalBytesProcessed / 2);
  });
});

function toArgs(q: { sql: string; params: Record<string, unknown> }) {
  return [q.sql, q.params] as const;
}

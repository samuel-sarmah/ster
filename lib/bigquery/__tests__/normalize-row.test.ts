import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { BigQuery } from "@google-cloud/bigquery";
import Big from "big.js";
import { normalizeRow, tableRef } from "../index";

describe("normalizeRow", () => {
  it("unwraps a BigQueryTimestamp into an ISO string", () => {
    // Regression: NextResponse.json serialized the wrapper as
    // {"fetched_at":{"value":"..."}}, so String(row.fetched_at) produced
    // "[object Object]" and every velocity row rendered "Invalid Date".
    const row = normalizeRow({
      fetched_at: BigQuery.timestamp("2026-07-27T03:39:34.069082000Z"),
    });

    expect(typeof row.fetched_at).toBe("string");
    expect(Number.isNaN(Date.parse(row.fetched_at as string))).toBe(false);
  });

  it("unwraps BigQueryDate and BigQueryDatetime", () => {
    const row = normalizeRow({
      d: BigQuery.date("2026-07-27"),
      dt: BigQuery.datetime("2026-07-27T03:39:34"),
    });

    expect(row.d).toBe("2026-07-27");
    expect(typeof row.dt).toBe("string");
  });

  it("converts NUMERIC Big values to numbers", () => {
    // NUMERIC arrives as big.js Big, never as a string — the old regex-on-string
    // check never fired for the columns it was written for.
    const row = normalizeRow({
      total_amount_usd: new Big("2428.32"),
      total_budget: new Big("100"),
      negative: new Big("-12.5"),
    });

    expect(row.total_amount_usd).toBe(2428.32);
    expect(row.total_budget).toBe(100);
    expect(row.negative).toBe(-12.5);
  });

  it("leaves number-like STRING columns as strings", () => {
    // The old /^-?\d+\.\d+$/ coercion silently turned a display name of "3.5"
    // into the number 3.5.
    const row = normalizeRow({
      display_name: "3.5",
      title: "2.0",
      status: "active",
      earnings_statuses: "confirmed,paid",
    });

    expect(row.display_name).toBe("3.5");
    expect(row.title).toBe("2.0");
    expect(row.status).toBe("active");
    expect(row.earnings_statuses).toBe("confirmed,paid");
  });

  it("passes INT64 numbers and booleans through untouched", () => {
    const row = normalizeRow({ view_count: 1005, escrow_released: true });

    expect(row.view_count).toBe(1005);
    expect(row.escrow_released).toBe(true);
  });

  it("normalizes null and undefined to null", () => {
    const row = normalizeRow({ a: null, b: undefined });

    expect(row.a).toBeNull();
    expect(row.b).toBeNull();
  });

  it("recurses into arrays and nested structs", () => {
    const row = normalizeRow({
      items: [new Big("1.25"), new Big("2.50")],
      nested: { amount: new Big("9.99"), label: "1.5" },
    });

    expect(row.items).toEqual([1.25, 2.5]);
    expect(row.nested).toEqual({ amount: 9.99, label: "1.5" });
  });
});

describe("tableRef", () => {
  const original = process.env.GOOGLE_CLOUD_PROJECT;

  beforeEach(() => {
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    process.env.BIGQUERY_DATASET = "analytics";
  });

  afterEach(() => {
    process.env.GOOGLE_CLOUD_PROJECT = original;
  });

  it("builds a backticked fully-qualified reference", () => {
    expect(tableRef("earnings")).toBe("`test-project.analytics.earnings`");
  });

  it("rejects names that could break out of the backticks", () => {
    expect(() => tableRef("earnings`")).toThrow(/Invalid BigQuery table name/);
    expect(() => tableRef("a.b")).toThrow(/Invalid BigQuery table name/);
    expect(() => tableRef("")).toThrow(/Invalid BigQuery table name/);
  });
});

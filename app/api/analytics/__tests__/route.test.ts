import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import {
  DEFAULT_VELOCITY_LOOKBACK_DAYS,
  MIN_VELOCITY_LOOKBACK_DAYS,
  MAX_VELOCITY_LOOKBACK_DAYS,
} from "@/lib/bigquery/queries";

const requireActiveUser = vi.fn();
const runAnalyticsQuery = vi.fn();

vi.mock("@/lib/auth/require-active-user", () => ({
  requireActiveUser: () => requireActiveUser(),
}));

// Keep the real module (queries.ts pulls tableRef from it) and stub only the
// call that would hit BigQuery.
vi.mock("@/lib/bigquery", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/bigquery")>()),
  runAnalyticsQuery: (...args: unknown[]) => runAnalyticsQuery(...args),
}));

const { GET } = await import("../[report]/route");

const asAdmin = () => ({ user: { id: "u1" }, profile: { role: "admin" }, supabase: {} });
const asCreator = () => ({ user: { id: "u2" }, profile: { role: "creator" }, supabase: {} });
const anonymous = () => ({
  error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
});
const suspended = () => ({
  error: NextResponse.json({ error: "Account suspended" }, { status: 403 }),
});

function call(report: string, query = "") {
  return GET(new Request(`http://localhost/api/analytics/${report}${query}`), {
    params: Promise.resolve({ report }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  runAnalyticsQuery.mockResolvedValue([{ campaign_id: "c1" }]);
});

describe("GET /api/analytics/[report]", () => {
  it("401s an anonymous caller", async () => {
    requireActiveUser.mockResolvedValue(anonymous());

    const res = await call("campaigns-cap");

    expect(res.status).toBe(401);
    expect(runAnalyticsQuery).not.toHaveBeenCalled();
  });

  it("403s a suspended account", async () => {
    requireActiveUser.mockResolvedValue(suspended());

    expect((await call("campaigns-cap")).status).toBe(403);
    expect(runAnalyticsQuery).not.toHaveBeenCalled();
  });

  it("403s a non-admin", async () => {
    requireActiveUser.mockResolvedValue(asCreator());

    expect((await call("campaigns-cap")).status).toBe(403);
    expect(runAnalyticsQuery).not.toHaveBeenCalled();
  });

  it("401s — not 404s — an unknown report for an anonymous caller", async () => {
    // Report names must not be enumerable without authenticating.
    requireActiveUser.mockResolvedValue(anonymous());

    expect((await call("does-not-exist")).status).toBe(401);
  });

  it("404s an unknown report for an admin", async () => {
    requireActiveUser.mockResolvedValue(asAdmin());

    expect((await call("does-not-exist")).status).toBe(404);
    expect(runAnalyticsQuery).not.toHaveBeenCalled();
  });

  it("returns rows for an admin", async () => {
    requireActiveUser.mockResolvedValue(asAdmin());

    const res = await call("creator-earnings");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.rows).toEqual([{ campaign_id: "c1" }]);
    expect(typeof body.cachedAt).toBe("number");
    expect(res.headers.get("Cache-Control")).toContain("private");
  });

  it("clamps lookbackDays into range and ignores garbage", async () => {
    requireActiveUser.mockResolvedValue(asAdmin());

    await call("view-velocity", "?lookbackDays=9999");
    expect(paramsOf(0).lookback_days).toBe(MAX_VELOCITY_LOOKBACK_DAYS);

    await call("view-velocity", "?lookbackDays=-5");
    expect(paramsOf(1).lookback_days).toBe(MIN_VELOCITY_LOOKBACK_DAYS);

    await call("view-velocity", "?lookbackDays=notanumber");
    expect(paramsOf(2).lookback_days).toBe(DEFAULT_VELOCITY_LOOKBACK_DAYS);
  });

  it("serves a repeat request from cache without re-querying", async () => {
    requireActiveUser.mockResolvedValue(asAdmin());

    await call("campaigns-cap");
    await call("campaigns-cap");

    expect(runAnalyticsQuery).toHaveBeenCalledTimes(1);
  });

  it("500s without leaking the BigQuery error message", async () => {
    requireActiveUser.mockResolvedValue(asAdmin());
    runAnalyticsQuery.mockRejectedValue(new Error("dataset sterclip:analytics not found"));

    const res = await call("view-velocity", "?lookbackDays=11");
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).not.toContain("sterclip");
  });
});

function paramsOf(callIndex: number): Record<string, number> {
  const opts = runAnalyticsQuery.mock.calls[callIndex][1] as {
    params: Record<string, number>;
  };
  return opts.params;
}

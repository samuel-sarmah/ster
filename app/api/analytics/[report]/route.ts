import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { serverError } from "@/lib/api/error-response";
import {
  campaignsNearingBudgetCap,
  earningsPerCreator,
  viewVelocity,
  DEFAULT_VELOCITY_LOOKBACK_DAYS,
  MIN_VELOCITY_LOOKBACK_DAYS,
  MAX_VELOCITY_LOOKBACK_DAYS,
} from "@/lib/bigquery/queries";
import { runAnalyticsQuery, type AnalyticsRow } from "@/lib/bigquery";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const REPORTS = {
  "campaigns-cap": () => campaignsNearingBudgetCap(),
  "creator-earnings": () => earningsPerCreator(),
  "view-velocity": (lookbackDays: number) => viewVelocity(lookbackDays),
} as const;

export type ReportName = keyof typeof REPORTS;

/** Out-of-range values clamp rather than 400 — this is a dashboard control. */
const lookbackSchema = z.coerce
  .number()
  .int()
  .catch(DEFAULT_VELOCITY_LOOKBACK_DAYS)
  .transform((n) =>
    Math.min(Math.max(n, MIN_VELOCITY_LOOKBACK_DAYS), MAX_VELOCITY_LOOKBACK_DAYS)
  );

/** Reports are recomputed at most once a minute; BigQuery scans aren't free. */
const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  rows: AnalyticsRow[];
  cachedAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ report: string }> }
): Promise<NextResponse> {
  // Authenticate before acknowledging whether a report name exists, so the
  // valid names aren't enumerable by an anonymous caller.
  const result = await requireActiveUser();
  if ("error" in result) return result.error;
  const { profile } = result;

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { report } = await params;

  if (!(String(report) in REPORTS)) {
    return NextResponse.json({ error: "Unknown report" }, { status: 404 });
  }

  const lookbackDays = lookbackSchema.parse(
    new URL(request.url).searchParams.get("lookbackDays") ??
      DEFAULT_VELOCITY_LOOKBACK_DAYS
  );

  const cacheKey = `${report}:${lookbackDays}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.cachedAt < CACHE_TTL_MS) {
    return jsonWithCacheHeaders({ rows: hit.rows, cachedAt: hit.cachedAt });
  }

  try {
    const { sql, params: queryParams } = REPORTS[report as ReportName](lookbackDays);
    const rows = await runAnalyticsQuery(sql, { params: queryParams });

    const cachedAt = Date.now();
    cache.set(cacheKey, { rows, cachedAt });

    return jsonWithCacheHeaders({ rows, cachedAt });
  } catch (err) {
    return serverError(err, `analytics:${report}`);
  }
}

function jsonWithCacheHeaders(body: { rows: AnalyticsRow[]; cachedAt: number }) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": `private, max-age=${Math.floor(CACHE_TTL_MS / 1000)}`,
    },
  });
}

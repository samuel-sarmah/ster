"use client";

import { useAnalyticsReport } from "./analytics-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsEmpty, AnalyticsError, AnalyticsLoading } from "./analytics-states";

function money(v: number) {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export interface AnalyticsSummary {
  campaignsTracked: number;
  capped: number;
  nearingCap: number;
  creatorsPaid: number;
  totalPayoutsUsd: number;
  totalVerifiedViews: number;
  flaggedEvents: number;
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

/**
 * Rolls the three shared report streams up into the header stat cards. All
 * three come from the provider, so this adds no extra BigQuery jobs.
 */
export function useAnalyticsSummary() {
  const cap = useAnalyticsReport("campaigns-cap");
  const earnings = useAnalyticsReport("creator-earnings");
  const velocity = useAnalyticsReport("view-velocity");

  const loading = cap.loading || earnings.loading || velocity.loading;
  const error = cap.error ?? earnings.error ?? velocity.error;

  const retry = () => {
    cap.retry();
    earnings.retry();
    velocity.retry();
  };

  if (loading || error) {
    return { summary: null, loading, error: loading ? null : error, retry };
  }

  const capRows = cap.data ?? [];
  const earRows = earnings.data ?? [];
  const velRows = velocity.data ?? [];

  const summary: AnalyticsSummary = {
    campaignsTracked: capRows.length,
    capped: capRows.filter((r) => r.budget_state === "CAPPED").length,
    nearingCap: capRows.filter((r) => r.budget_state === "NEARING CAP").length,
    creatorsPaid: earRows.length,
    totalPayoutsUsd: earRows.reduce((acc, r) => acc + (r.total_amount_usd ?? 0), 0),
    totalVerifiedViews: earRows.reduce((acc, r) => acc + (r.total_verified_views ?? 0), 0),
    flaggedEvents: velRows.filter((r) => r.velocity_flag === "FLAG").length,
  };

  // An entirely empty warehouse is a real state, not an error: the reports
  // succeeded and returned nothing.
  const isEmpty = capRows.length === 0 && earRows.length === 0 && velRows.length === 0;

  return { summary, loading: false, error: null, isEmpty, retry };
}

export function AnalyticsOverview() {
  const { summary, loading, error, isEmpty, retry } = useAnalyticsSummary();

  if (loading) return <AnalyticsLoading label="analytics overview" />;
  if (error) return <AnalyticsError message={error} onRetry={retry} />;
  if (isEmpty || !summary) return <AnalyticsEmpty />;

  const stats = [
    {
      label: "Active campaigns",
      value: summary.campaignsTracked.toLocaleString(),
      sub: `${summary.capped} capped · ${summary.nearingCap} near cap`,
    },
    {
      label: "Committed payouts",
      value: money(summary.totalPayoutsUsd),
      sub: `across ${summary.creatorsPaid.toLocaleString()} creators`,
    },
    {
      label: "Verified views",
      value: summary.totalVerifiedViews.toLocaleString(),
      sub: "tracked in warehouse",
    },
    {
      label: "Velocity flags",
      value: summary.flaggedEvents.toLocaleString(),
      sub: ">500k views/hr",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <SummaryCard key={s.label} {...s} />
      ))}
    </div>
  );
}

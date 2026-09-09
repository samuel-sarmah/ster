"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalyticsReport } from "./analytics-provider";
import { AnalyticsEmpty, AnalyticsError, AnalyticsLoading } from "./analytics-states";

function num(v: number | null): number {
  return v ?? 0;
}

function BudgetStateBadge({ state }: { state: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    CAPPED: "destructive",
    "NEARING CAP": "secondary",
    OK: "outline",
  };
  return <Badge variant={map[state] ?? "outline"}>{state}</Badge>;
}

function BudgetBar({ pct, state }: { pct: number; state: string }) {
  const clamped = Math.min(pct, 100);
  const color =
    state === "CAPPED" ? "bg-destructive" : state === "NEARING CAP" ? "bg-accent" : "bg-chart-2";
  return (
    <div className="flex w-full items-center gap-2">
      <div className="h-2 w-full min-w-24 bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

export function CampaignsCapReport() {
  const { data, loading, error, retry } = useAnalyticsReport("campaigns-cap");

  if (loading) return <AnalyticsLoading label="campaign budget report" />;
  if (error) return <AnalyticsError message={error} onRetry={retry} />;
  if (!data || data.length === 0) return <AnalyticsEmpty />;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comm. USD</TableHead>
              <TableHead>Headroom</TableHead>
              <TableHead className="w-[200px]">Budget used</TableHead>
              <TableHead>State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.campaign_id}>
                <TableCell className="font-medium">{row.title ?? "—"}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {row.status ?? "—"}
                </TableCell>
                <TableCell className="tabular-nums">
                  ${num(row.committed_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  ${num(row.headroom_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <BudgetBar pct={num(row.pct_used)} state={row.budget_state} />
                </TableCell>
                <TableCell>
                  <BudgetStateBadge state={row.budget_state} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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

function StatusesBadge({ statuses }: { statuses: string }) {
  const parts = statuses.split(",").filter(Boolean);
  if (parts.length === 0) return null;
  const variant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    paid: "default",
    confirmed: "secondary",
    pending: "outline",
  };
  return (
    <span className="flex flex-wrap gap-1">
      {parts.map((s) => (
        <Badge key={s} variant={variant[s] ?? "outline"}>
          {s}
        </Badge>
      ))}
    </span>
  );
}

export function CreatorEarningsReport() {
  const { data, loading, error, retry } = useAnalyticsReport("creator-earnings");

  if (loading) return <AnalyticsLoading label="creator earnings report" />;
  if (error) return <AnalyticsError message={error} onRetry={retry} />;
  if (!data || data.length === 0) return <AnalyticsEmpty />;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead className="text-right">Submissions</TableHead>
              <TableHead className="text-right">Verified views</TableHead>
              <TableHead className="text-right">Total USD</TableHead>
              <TableHead className="text-right">$/1k views</TableHead>
              <TableHead>Statuses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.creator_id}>
                <TableCell className="font-medium">
                  {row.display_name ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {num(row.submissions_with_earnings).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {num(row.total_verified_views).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  ${num(row.total_amount_usd).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  ${num(row.effective_usd_per_1k_views).toFixed(4)}
                </TableCell>
                <TableCell>
                  <StatusesBadge statuses={row.earnings_statuses ?? ""} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

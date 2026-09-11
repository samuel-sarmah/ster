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

const PLATFORM_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  tiktok: "default",
  instagram: "secondary",
  youtube: "outline",
  x: "outline",
};

export function ViewVelocityReport() {
  const { data, loading, error, retry } = useAnalyticsReport("view-velocity");

  if (loading) return <AnalyticsLoading label="view velocity report" />;
  if (error) return <AnalyticsError message={error} onRetry={retry} />;
  if (!data || data.length === 0) return <AnalyticsEmpty />;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fetched</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead className="text-right">Prev</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Views/hr</TableHead>
              <TableHead className="text-right">Lifetime avg</TableHead>
              <TableHead>Anomaly</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => {
              const flagged = row.velocity_flag === "FLAG";
              return (
                <TableRow key={`${row.submission_id}-${i}`}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(row.fetched_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={PLATFORM_VARIANT[row.platform ?? ""] ?? "outline"}>
                      {row.platform ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.submission_id}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {num(row.prev_view_count).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {num(row.view_count).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {num(row.views_per_hour).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {num(row.lifetime_avg_views_per_hour).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {flagged ? <Badge variant="destructive">FLAG</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

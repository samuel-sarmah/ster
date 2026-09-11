"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  CampaignCapRow,
  CreatorEarningsRow,
  ViewVelocityRow,
} from "@/lib/bigquery/queries";

export interface ReportState<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export interface AnalyticsReports {
  "campaigns-cap": ReportState<CampaignCapRow>;
  "creator-earnings": ReportState<CreatorEarningsRow>;
  "view-velocity": ReportState<ViewVelocityRow>;
}

export type ReportName = keyof AnalyticsReports;

/** Maps a report name to its row type. */
export interface ReportRowMap {
  "campaigns-cap": CampaignCapRow;
  "creator-earnings": CreatorEarningsRow;
  "view-velocity": ViewVelocityRow;
}

const AnalyticsContext = createContext<AnalyticsReports | null>(null);

interface FetchState<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches one report. Lives in the provider so the overview and the tab panel
 * that both read a report share a single request — each BigQuery job scans real
 * bytes, so fetching per-consumer doubled the cost of every page load.
 */
function useReportFetch<T>(report: ReportName): ReportState<T> {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    fetch(`/api/analytics/${report}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Request failed");
        return body.rows as T[];
      })
      .then((rows) => setState({ data: rows, loading: false, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load report",
        });
      });

    return () => controller.abort();
  }, [report, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, retry };
}

export function AnalyticsReportsProvider({ children }: { children: React.ReactNode }) {
  const campaignsCap = useReportFetch<CampaignCapRow>("campaigns-cap");
  const creatorEarnings = useReportFetch<CreatorEarningsRow>("creator-earnings");
  const viewVelocity = useReportFetch<ViewVelocityRow>("view-velocity");

  const value = useMemo<AnalyticsReports>(
    () => ({
      "campaigns-cap": campaignsCap,
      "creator-earnings": creatorEarnings,
      "view-velocity": viewVelocity,
    }),
    [campaignsCap, creatorEarnings, viewVelocity]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

/**
 * Reads one report's state from the provider. Returns the shared request, so
 * mounting a tab panel costs nothing.
 */
export function useAnalyticsReport<K extends ReportName>(
  report: K
): ReportState<ReportRowMap[K]> {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalyticsReport must be used inside <AnalyticsReportsProvider>");
  }
  return ctx[report] as ReportState<ReportRowMap[K]>;
}

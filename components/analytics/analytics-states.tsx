"use client";

/**
 * Shared loading / error / empty states for analytics report panels.
 */

export function AnalyticsLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${label}`}
      className="grid gap-4 border rounded-lg p-6"
    >
      <div className="h-4 w-40 bg-muted animate-pulse" />
      <div className="h-24 bg-muted/60 animate-pulse" />
      <div className="h-24 bg-muted/60 animate-pulse" />
    </div>
  );
}

export function AnalyticsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="border rounded-lg p-8 text-center text-sm">
      <div className="font-medium text-foreground">Couldn&apos;t load analytics</div>
      <p className="mt-1 text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Retry
      </button>
    </div>
  );
}

export function AnalyticsEmpty() {
  return (
    <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
      No analytics data yet. Run <code className="text-foreground">npm run bq:sync</code> or{" "}
      <code className="text-foreground">npm run bq:demo</code> to populate the warehouse.
    </div>
  );
}

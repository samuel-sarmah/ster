"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon, PLATFORM_BRAND_CLASS, type PlatformKey } from "@/components/brand-icons";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { NICHES } from "@/lib/niches";
import { cn } from "@/lib/utils";
import { joinCampaign } from "@/app/campaigns/actions";

export interface BrowserCampaign {
  id: string;
  title: string;
  description: string | null;
  platforms: string[];
  categories: string[];
  target_cpm: number;
  total_budget: number;
  spent_budget: number;
}

export function CampaignBrowser({
  campaigns,
  appliedStatus,
  creatorNiches,
}: {
  campaigns: BrowserCampaign[];
  appliedStatus: Record<string, string>;
  creatorNiches: string[];
}) {
  // Default the filter to the niches the creator picked at onboarding, but let
  // them edit it freely. Falls back to "show everything" when nothing's picked.
  const [selected, setSelected] = useState<string[]>(creatorNiches);
  const [applied, setApplied] = useState<Record<string, string>>(appliedStatus);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(niche: string) {
    setSelected((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche],
    );
  }

  const visible = useMemo(() => {
    if (selected.length === 0) return campaigns;
    return campaigns.filter(
      (c) =>
        // Uncategorised campaigns always show; categorised ones must overlap
        // at least one selected niche.
        c.categories.length === 0 ||
        c.categories.some((cat) => selected.includes(cat)),
    );
  }, [campaigns, selected]);

  function handleApply(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await joinCampaign(id);
      if (result.ok) {
        setApplied((prev) => ({ ...prev, [id]: "pending" }));
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campaigns"
        description={
          selected.length > 0
            ? "Filtered to your niches. Tap a niche to edit."
            : "Every funded brief. Pick niches to narrow the list."
        }
        action={
          selected.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-[13px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {NICHES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => toggle(n)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
              selected.includes(n)
                ? "border-accent bg-accent text-white"
                : "border-border bg-transparent text-muted-foreground hover:border-accent/40 hover:text-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No campaigns match">
          {campaigns.length === 0
            ? "No active campaigns right now. Check back soon."
            : "Try adding more niches or clearing the filter."}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((campaign) => {
            const status = applied[campaign.id];
            const remaining = campaign.total_budget - campaign.spent_budget;

            return (
              <div
                key={campaign.id}
                className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold">{campaign.title}</h3>
                    {campaign.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-deep)]">
                      ${campaign.target_cpm.toFixed(2)} CPM
                    </span>
                    <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                      ${remaining.toLocaleString("en-US", { maximumFractionDigits: 0 })} left
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {campaign.platforms.map((p) => (
                    <span
                      key={p}
                      title={p}
                      className="flex size-6 items-center justify-center rounded-full border border-border bg-background"
                    >
                      <PlatformIcon
                        platform={p}
                        className={cn("size-3.5", PLATFORM_BRAND_CLASS[p as PlatformKey])}
                      />
                    </span>
                  ))}
                  {campaign.categories.map((c) => (
                    <Badge key={c} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <Link
                    href={`/creator/campaigns/${campaign.id}`}
                    className="text-[13px] font-semibold text-[var(--accent-deep)] hover:underline"
                  >
                    View details
                  </Link>
                  {status ? (
                    <Badge variant={status === "approved" ? "default" : "secondary"} className="capitalize">
                      {status}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApply(campaign.id)}
                      disabled={isPending && pendingId === campaign.id}
                    >
                      {isPending && pendingId === campaign.id ? "Applying…" : "Apply"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

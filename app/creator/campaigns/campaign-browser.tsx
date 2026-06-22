"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active campaigns</h1>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Editable niche filter — pre-set to the creator's niches. */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {selected.length > 0
            ? "Filtered to your niches — tap to edit"
            : "Showing all campaigns — pick niches to filter"}
        </div>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                selected.includes(n)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
          {campaigns.length === 0
            ? "No active campaigns right now. Check back later."
            : "No campaigns match your selected niches. Try adding more niches or clearing the filter."}
        </div>
      ) : (
        <div className="grid gap-4">
          {visible.map((campaign) => {
            const status = applied[campaign.id];
            const remaining = campaign.total_budget - campaign.spent_budget;

            return (
              <div key={campaign.id} className="border rounded-lg p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{campaign.title}</h3>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">
                      ${campaign.target_cpm.toFixed(2)} CPM
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${remaining.toFixed(0)} remaining
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {campaign.platforms.map((p) => (
                    <Badge key={p} variant="outline" className="capitalize text-xs">
                      {p}
                    </Badge>
                  ))}
                  {campaign.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/creator/campaigns/${campaign.id}`}
                    className="text-sm underline"
                  >
                    View details
                  </Link>
                  {status ? (
                    <Badge variant={status === "approved" ? "default" : "secondary"}>
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

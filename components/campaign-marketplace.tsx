"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CampaignCard, type CampaignCardProps } from "@/components/campaign-card";
import { CampaignDetailDialog } from "@/components/campaign-detail-dialog";
import { cn } from "@/lib/utils";

type Platform = "all" | "tiktok" | "instagram" | "youtube" | "x";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
];

interface CampaignMarketplaceProps {
  initialCampaigns: CampaignCardProps[];
  isAuthenticated?: boolean;
}

export function CampaignMarketplace({
  initialCampaigns,
  isAuthenticated = false,
}: CampaignMarketplaceProps) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = initialCampaigns
    .filter((c) => platform === "all" || c.platforms.includes(platform))
    .filter(
      (c) =>
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.brand_name.toLowerCase().includes(query.toLowerCase()),
    );

  const selected = selectedIndex != null ? filtered[selectedIndex] ?? null : null;

  return (
    <section id="marketplace" className="scroll-mt-20 border-b border-border/60">
      <div className="w-4/5 mx-auto">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns or brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-150",
                  platform === p.value
                    ? "border-accent bg-accent text-white"
                    : "border-border/60 bg-transparent text-muted-foreground hover:border-accent/40 hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
            <span className="ml-2 text-xs text-muted-foreground hidden sm:block">
              Highest rate first
            </span>
          </div>
        </div>

        {/* Campaign grid */}
        <div className="pb-14 sm:pb-18 lg:pb-22">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c, i) => (
                <CampaignCard
                  key={c.id}
                  {...c}
                  onSelect={() => {
                    setSelectedIndex(i);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="font-semibold text-foreground">No campaigns found</p>
              <p className="text-sm text-muted-foreground">
                {initialCampaigns.length === 0
                  ? "No active campaigns right now — check back soon."
                  : "Try a different search or platform filter."}
              </p>
            </div>
          )}
        </div>
      </div>

      <CampaignDetailDialog
        campaign={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isAuthenticated={isAuthenticated}
        hasPrev={selectedIndex != null && selectedIndex > 0}
        hasNext={selectedIndex != null && selectedIndex < filtered.length - 1}
        onPrev={() =>
          setSelectedIndex((i) => (i != null && i > 0 ? i - 1 : i))
        }
        onNext={() =>
          setSelectedIndex((i) =>
            i != null && i < filtered.length - 1 ? i + 1 : i,
          )
        }
      />
    </section>
  );
}

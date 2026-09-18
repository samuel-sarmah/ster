"use client";

import { useEffect, useRef, useState } from "react";
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

type SortKey = "rate-desc" | "rate-asc" | "budget-desc";

const SORTS: { value: SortKey; label: string; compare: (a: CampaignCardProps, b: CampaignCardProps) => number }[] = [
  { value: "rate-desc", label: "Highest rate", compare: (a, b) => b.target_cpm - a.target_cpm },
  { value: "rate-asc", label: "Lowest rate", compare: (a, b) => a.target_cpm - b.target_cpm },
  {
    value: "budget-desc",
    label: "Most budget left",
    compare: (a, b) =>
      b.total_budget - b.spent_budget - (a.total_budget - a.spent_budget),
  },
];

interface CampaignMarketplaceProps {
  initialCampaigns: CampaignCardProps[];
  isAuthenticated?: boolean;
  userRole?: string | null;
}

/**
 * Card grid that reveals its children in a stagger once it scrolls into view.
 * The animation is pure CSS (see `.reveal-grid` in globals.css); this only
 * flips one class, so the observer disconnects after the first intersection.
 * Keyed by the active filter at the call site, so a filter change remounts
 * the grid and replays the stagger.
 */
function RevealGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          node.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="reveal-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {children}
    </div>
  );
}

export function CampaignMarketplace({
  initialCampaigns,
  isAuthenticated = false,
  userRole = null,
}: CampaignMarketplaceProps) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [sort, setSort] = useState<SortKey>("rate-desc");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeSort = SORTS.find((s) => s.value === sort) ?? SORTS[0];

  const filtered = initialCampaigns
    .filter((c) => platform === "all" || c.platforms.includes(platform))
    .filter(
      (c) =>
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.brand_name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort(activeSort.compare);

  const selected = selectedIndex != null ? filtered[selectedIndex] ?? null : null;

  return (
    <div>
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 pb-6 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns or brands"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
                  platform === p.value
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-transparent text-muted-foreground hover:border-accent/40 hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
            <label className="ml-2 hidden items-center gap-1.5 sm:flex">
              <span className="sr-only">Sort campaigns</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-border bg-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label="Sort campaigns"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Campaign grid */}
        {filtered.length > 0 ? (
          <RevealGrid key={`${platform}:${sort}`}>
            {filtered.map((c, i) => (
              <CampaignCard
                key={c.id}
                {...c}
                style={{ "--i": i } as React.CSSProperties}
                onSelect={() => {
                  setSelectedIndex(i);
                  setDialogOpen(true);
                }}
              />
            ))}
          </RevealGrid>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="font-semibold text-foreground">No campaigns found</p>
            <p className="text-sm text-muted-foreground">
              {initialCampaigns.length === 0
                ? "No active campaigns right now. Check back soon."
                : "Try a different search or platform."}
            </p>
          </div>
        )}
      </div>

      <CampaignDetailDialog
        campaign={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
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
    </div>
  );
}

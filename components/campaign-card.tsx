import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CampaignCardProps {
  id: string;
  title: string;
  description: string | null;
  target_cpm: number;
  total_budget: number;
  spent_budget: number;
  platforms: string[];
  brand_name: string;
  ends_at: string | null;
  videoUrl?: string | null;
  className?: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
};

function formatRate(cpm: number): string {
  const perMillion = cpm * 1000;
  return `$${perMillion.toLocaleString("en-US", { maximumFractionDigits: 0 })} / 1M views`;
}

function formatBudget(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function CampaignCard({
  id,
  title,
  description,
  target_cpm,
  total_budget,
  spent_budget,
  platforms,
  brand_name,
  ends_at,
  videoUrl,
  className,
}: CampaignCardProps) {
  const remaining = total_budget - spent_budget;
  const initial = brand_name.charAt(0).toUpperCase();

  return (
    <a
      href={`/campaigns/${id}`}
      className={cn(
        "surface-card flex flex-col gap-0 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Video preview */}
      {videoUrl && (
        <div className="relative h-40 w-full bg-muted overflow-hidden">
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col gap-4 p-5">
      {/* Brand row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-black text-accent">
            {initial}
          </div>
          <span className="truncate text-sm font-semibold text-foreground">
            {brand_name}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {platforms.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              {PLATFORM_LABELS[p] ?? p}
            </span>
          ))}
        </div>
      </div>

      {/* Campaign info */}
      <div className="flex-1 space-y-1">
        <h3 className="font-bold leading-snug tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Rate + budget */}
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg border border-accent/25 bg-accent/10 px-3 py-1.5 text-sm font-black text-accent">
          {formatRate(target_cpm)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatBudget(remaining)} remaining
        </span>
      </div>

      {/* CTA row */}
      <div className="flex items-center justify-end gap-1 text-xs font-bold text-accent">
        View campaign
        <ArrowRight className="size-3.5" />
      </div>
      </div>
    </a>
  );
}

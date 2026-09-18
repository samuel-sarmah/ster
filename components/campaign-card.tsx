import { PlatformIcon, PLATFORM_BRAND_CLASS, type PlatformKey } from "@/components/brand-icons";
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
  imageUrl?: string | null;
  className?: string;
  style?: React.CSSProperties;
  /** When provided, the card opens this handler instead of navigating. */
  onSelect?: () => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
};

function formatRate(cpm: number): string {
  const perMillion = cpm * 1000;
  return `$${perMillion.toLocaleString("en-US", { maximumFractionDigits: 0 })} / 1M`;
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
  target_cpm,
  total_budget,
  spent_budget,
  platforms,
  brand_name,
  imageUrl,
  className,
  style,
  onSelect,
}: CampaignCardProps) {
  const initial = brand_name.charAt(0).toUpperCase();
  const remaining = total_budget - spent_budget;

  const cardClassName = cn(
    "group flex flex-col overflow-hidden rounded-[10px] border border-border bg-card text-left shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-[var(--shadow-soft-hover)]",
    className,
  );

  const inner = (
    <>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-[var(--surface)]">
          <span className="text-4xl font-semibold text-accent/40">{initial}</span>
        </div>
      )}

      <div className="flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <span className="text-xs font-medium text-muted-foreground">{brand_name}</span>
          <h3 className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-foreground">
            {title}
          </h3>
          <span className="mt-2 inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-deep)]">
            {formatRate(target_cpm)}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            {platforms.map((p) => (
              <span
                key={p}
                title={PLATFORM_LABELS[p] ?? p}
                aria-label={PLATFORM_LABELS[p] ?? p}
                className="flex size-6 items-center justify-center rounded-full border border-border bg-background"
              >
                <PlatformIcon
                  platform={p}
                  className={cn("size-3.5", PLATFORM_BRAND_CLASS[p as PlatformKey])}
                />
              </span>
            ))}
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{formatBudget(remaining)} left</span>
        </div>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={cardClassName} style={style}>
        {inner}
      </button>
    );
  }

  return (
    <a href={`/campaigns/${id}`} className={cardClassName} style={style}>
      {inner}
    </a>
  );
}

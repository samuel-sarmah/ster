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
  onSelect,
}: CampaignCardProps) {
  const initial = brand_name.charAt(0).toUpperCase();
  const remaining = total_budget - spent_budget;

  const cardClassName = `flex flex-col overflow-hidden rounded-2xl bg-muted text-left ${className ?? ""}`;

  const inner = (
    <>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-72 w-full object-cover"
        />
      ) : (
        <div className="flex h-72 items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
          <span className="text-5xl font-black text-accent/30">{initial}</span>
        </div>
      )}

      <div className="flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <span className="text-sm font-bold text-foreground">
            {brand_name}
          </span>
          <h3 className="truncate text-base font-black leading-tight text-foreground">
            {title}
          </h3>
          <span className="mt-1 inline-block rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-black text-accent">
            {formatRate(target_cpm)}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex flex-wrap gap-1">
            {platforms.map((p) => (
              <span
                key={p}
                className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatBudget(remaining)} remaining
          </span>
        </div>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={cardClassName}>
        {inner}
      </button>
    );
  }

  return (
    <a href={`/campaigns/${id}`} className={cardClassName}>
      {inner}
    </a>
  );
}

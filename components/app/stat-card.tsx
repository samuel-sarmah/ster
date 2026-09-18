import { cn } from "@/lib/utils";

/** Compact metric tile — the same shape as the homepage's dashboard mocks. */
export function StatCard({
  label,
  value,
  note,
  hot,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  hot?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border bg-card p-4 shadow-[var(--shadow-card)]",
        hot ? "border-accent bg-[var(--accent-soft)]" : "border-border",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none tabular-nums text-foreground">{value}</p>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

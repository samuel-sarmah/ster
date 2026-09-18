import { cn } from "@/lib/utils";

/** Dashed placeholder for lists with nothing in them yet. */
export function EmptyState({
  title,
  children,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-dashed border-border px-6 py-12 text-center",
        className
      )}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children && <p className="mt-1 text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}

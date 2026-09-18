import { cn } from "@/lib/utils";

/*
 * Layout primitives for the marketing homepage. Every section is built from
 * these so the page keeps one rhythm: a 1280px column, an eyebrow → headline →
 * one-line subhead header, and bordered "frames" with crop marks at the
 * corners in place of decorative backgrounds.
 */

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl", className)}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase leading-7 tracking-[0.02em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[40px] sm:leading-[52px]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-[680px] text-lg leading-8 text-muted-foreground",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** A bordered panel with the four corner crop marks. */
export function Frame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative border border-border", className)}>
      <CropMarks />
      {children}
    </div>
  );
}

function CropMarks() {
  const mark = "pointer-events-none absolute size-3 border border-border bg-background";
  return (
    <>
      <span aria-hidden className={cn(mark, "-left-1.5 -top-1.5")} />
      <span aria-hidden className={cn(mark, "-right-1.5 -top-1.5")} />
      <span aria-hidden className={cn(mark, "-bottom-1.5 -left-1.5")} />
      <span aria-hidden className={cn(mark, "-bottom-1.5 -right-1.5")} />
    </>
  );
}

/** Faint dot field that fades in from the top; sits behind a UI mock. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("dot-grid pointer-events-none absolute inset-x-0 bottom-0 h-3/4", className)}
      style={{
        maskImage: "linear-gradient(to top, black 20%, transparent)",
        WebkitMaskImage: "linear-gradient(to top, black 20%, transparent)",
      }}
    />
  );
}

/** Small white card used inside mocks — the 10px-radius tile. */
export function MockCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-card p-3 shadow-[var(--shadow-card)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Solid green primary button, 32px tall. */
export const btnPrimary =
  "group inline-flex h-8 items-center justify-center gap-1 rounded-md bg-accent px-3 text-[13px] font-semibold text-white transition-[filter,transform] duration-200 hover:brightness-105 active:translate-y-px";

/** White button with a hairline ring. */
export const btnSecondary =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-background px-3 text-[13px] font-semibold text-foreground shadow-[0_0_0_1px_var(--border)] transition-colors duration-200 hover:bg-muted active:translate-y-px";

/** Larger variants for the closing section. */
export const btnPrimaryLg =
  "group inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-[filter,transform] duration-200 hover:brightness-105 active:translate-y-px";

export const btnSecondaryLg =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-background px-4 text-sm font-semibold text-foreground shadow-[0_0_0_1px_var(--border)] transition-colors duration-200 hover:bg-muted active:translate-y-px";

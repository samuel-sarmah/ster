"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PixabayVideo {
  id: number;
  videos: {
    medium: { url: string };
    small: { url: string };
    tiny: { url: string };
  };
  tags: string;
  user: string;
}

export interface Hero195Props {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonUrl?: string;
  className?: string;
}

const Hero195 = ({
  title = "Performance creator campaigns with verified payouts",
  description = "Sterclip helps brands fund escrow-backed campaigns, creators submit confidently, and payouts release only after views are verified.",
  primaryButtonText = "Start your first campaign",
  primaryButtonUrl = "/signup",
  secondaryButtonText,
  secondaryButtonUrl,
  className,
}: Hero195Props) => {
  return (
    <section className={cn("border-b border-border/60", className)}>
      <div className="container mx-auto py-10 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">

          {/* Left — text */}
          <div className="flex flex-col items-start">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/12 bg-card px-3.5 py-1 text-[11px] font-medium tracking-wide text-foreground/55 sm:mb-5">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              Verified views &amp; escrow-backed payouts
            </div>

            <h1 className="max-w-xl text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              {title}
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {description}
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
              <Button
                render={<a href={primaryButtonUrl} />}
                nativeButton={false}
                className="h-10 rounded-xl px-6 text-sm font-semibold sm:h-11 sm:px-7"
              >
                {primaryButtonText}
              </Button>
              {secondaryButtonText && secondaryButtonUrl && (
                <Button
                  variant="outline"
                  render={<a href={secondaryButtonUrl} />}
                  nativeButton={false}
                  className="h-10 rounded-xl px-6 text-sm font-semibold sm:h-11 sm:px-7"
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>

            {/* Inline stats — visible only on mobile where the panel is hidden */}
            <div className="mt-8 grid w-full grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-4 lg:hidden">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Escrow funded</p>
                <p className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground">$1.2M</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Views verified</p>
                <p className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground">18.4M</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Payout rate</p>
                <p className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground">98.7%</p>
              </div>
            </div>
          </div>

          {/* Right — metrics panel, desktop only */}
          <div className="hidden rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] lg:block">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-xl border border-border/60 bg-muted/50 px-5 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Escrow funded</p>
                <p className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-foreground">$1.2M</p>
                <p className="mt-1 text-xs text-muted-foreground">across active campaigns</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/50 px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Verified views</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">18.4M</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/50 px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Payout rate</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">98.7%</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
              <p className="text-xs text-muted-foreground">Campaign controls and payout signals stay aligned.</p>
              <span className="ml-3 flex shrink-0 items-center gap-1.5 rounded-full bg-foreground/6 px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export { Hero195 };

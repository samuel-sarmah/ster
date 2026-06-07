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
    <section className={cn("relative overflow-hidden border-b border-border/60", className)}>
      <div className="container mx-auto py-20 lg:py-28 xl:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left column — text */}
          <div className="flex flex-col items-start">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/12 bg-card px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/55">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              Verified views &amp; escrow-backed payouts
            </div>

            <h1 className="max-w-xl text-balance text-5xl font-extrabold leading-[1.06] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[3.75rem] xl:text-7xl">
              {title}
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {description}
            </p>

            <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                render={<a href={primaryButtonUrl} />}
                nativeButton={false}
                className="h-12 rounded-xl px-8 text-sm font-semibold sm:text-base"
              >
                {primaryButtonText}
              </Button>
              {secondaryButtonText && secondaryButtonUrl && (
                <Button
                  variant="outline"
                  render={<a href={secondaryButtonUrl} />}
                  nativeButton={false}
                  className="h-12 rounded-xl px-8 text-sm font-semibold sm:text-base"
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>

            <p className="mt-8 text-xs font-medium tracking-wide text-muted-foreground/70">
              Built for brand and creator teams operating at scale.
            </p>
          </div>

          {/* Right column — metrics panel */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-xl border border-border/60 bg-muted/50 px-5 py-6">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Escrow funded</p>
                <p className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-foreground">$1.2M</p>
                <p className="mt-1 text-sm text-muted-foreground">across active campaigns</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/50 px-5 py-5">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Verified views</p>
                <p className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-foreground">18.4M</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/50 px-5 py-5">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Payout rate</p>
                <p className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-foreground">98.7%</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3.5">
              <p className="text-sm text-muted-foreground">Campaign controls and payout signals stay aligned.</p>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground/6 px-3 py-1 text-xs font-semibold text-foreground/70">
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

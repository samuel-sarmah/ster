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
    <section className={cn("section-dark border-b border-white/10", className)}>
      <div className="container mx-auto py-14 sm:py-18 lg:py-22">
        <div className="mx-auto max-w-3xl text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5">
            <span className="size-1.5 rounded-full bg-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
              Verified views &amp; escrow-backed payouts
            </span>
          </div>

          <h1 className="text-balance text-3xl font-black leading-[1.08] tracking-[-0.03em] sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
            {title}
          </h1>

          <p className="mt-4 mx-auto max-w-xl text-sm leading-6 sm:text-base sm:leading-7 text-white/60">
            {description}
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              render={<a href={primaryButtonUrl} />}
              nativeButton={false}
              className="h-11 rounded-xl px-8 text-sm font-bold sm:h-12 sm:px-9"
            >
              {primaryButtonText}
            </Button>
            {secondaryButtonText && secondaryButtonUrl && (
              <Button
                variant="outline"
                render={<a href={secondaryButtonUrl} />}
                nativeButton={false}
                className="h-11 rounded-xl border-white/20 px-8 text-sm font-bold text-white hover:bg-white/10 sm:h-12 sm:px-9"
              >
                {secondaryButtonText}
              </Button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export { Hero195 };

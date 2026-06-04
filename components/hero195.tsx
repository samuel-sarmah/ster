"use client";

import { useEffect, useRef } from "react";
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
  videos?: PixabayVideo[];
  className?: string;
}

function VideoTile({ url, delay }: { url: string; delay: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.play().catch(() => {});
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="w-full h-full overflow-hidden">
      <video
        ref={ref}
        src={url}
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}

const Hero195 = ({
  title = "Performance creator campaigns with verified payouts",
  description = "Sterclip helps brands fund escrow-backed campaigns, creators submit confidently, and payouts release only after views are verified.",
  primaryButtonText = "Start your first campaign",
  primaryButtonUrl = "/signup",
  secondaryButtonText,
  secondaryButtonUrl,
  videos = [],
  className,
}: Hero195Props) => {
  const media = videos.slice(0, 8);
  const words = title.trim().split(/\s+/);
  const lead = words.slice(0, 3).join(" ");
  const accent = words.slice(3).join(" ");

  return (
    <section className={cn("relative overflow-hidden section-padding", className)}>
      <div className="pointer-events-none absolute -left-40 top-10 size-[32rem] rounded-full atmo-blob opacity-45" />
      <div className="pointer-events-none absolute -right-40 top-16 size-[34rem] rounded-full atmo-blob opacity-35" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full atmo-blob opacity-20" />

      <div className="container relative z-10 mx-auto">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/75 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Verified views and escrow-backed payouts
            </div>

            <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl">
              {lead}
              {accent ? <span className="brand-gradient-text"> {accent}</span> : null}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {description}
            </p>

            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                render={<a href={primaryButtonUrl} />}
                nativeButton={false}
                className="h-11 rounded-full px-7 text-sm font-semibold sm:h-12 sm:px-8 sm:text-base"
              >
                {primaryButtonText}
              </Button>
              {secondaryButtonText && secondaryButtonUrl && (
                <Button
                  variant="outline"
                  render={<a href={secondaryButtonUrl} />}
                  nativeButton={false}
                  className="h-11 rounded-full px-7 text-sm font-semibold sm:h-12 sm:px-8 sm:text-base"
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>

            <p className="mt-8 text-xs font-medium tracking-wide text-muted-foreground/90">
              Designed for brand and creator teams operating at scale.
            </p>
          </div>

          <div className="[perspective:2000px]">
            <div className="relative animate-soft-float rounded-2xl border border-primary/25 bg-card/90 p-4 shadow-[var(--shadow-soft-hover)] backdrop-blur-sm transition-all duration-300 hover:[transform:rotateX(2deg)_rotateY(-8deg)_translateY(-4px)] [transform:rotateX(5deg)_rotateY(-12deg)]">
              <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-gradient-to-br from-primary/40 to-secondary/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-gradient-to-br from-secondary/35 to-primary/25 blur-3xl" />

              {media.length > 0 ? (
                <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {media.map((video, i) => (
                    <div
                      key={video.id}
                      className="overflow-hidden rounded-xl border border-border/80 bg-muted/40"
                    >
                      <VideoTile
                        url={
                          video.videos.tiny?.url ||
                          video.videos.small?.url ||
                          video.videos.medium?.url
                        }
                        delay={i * 120}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/80 bg-linear-to-br from-primary/12 to-secondary/12 p-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-card p-4 shadow-[var(--shadow-soft)]">
                      <p className="text-xs font-medium text-muted-foreground">Escrow funded</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">$1.2M</p>
                    </div>
                    <div className="rounded-lg bg-card p-4 shadow-[var(--shadow-soft)]">
                      <p className="text-xs font-medium text-muted-foreground">Verified views</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">18.4M</p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-card p-4 shadow-[var(--shadow-soft)]">
                      <p className="text-xs font-medium text-muted-foreground">Payout readiness rate</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">98.7%</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between rounded-lg border border-border/80 bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">Campaign controls and payout signals stay aligned.</p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Live</span>
              </div>
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <p className="mt-10 text-[11px] tracking-wide text-muted-foreground">
            Creator videos via Pixabay
          </p>
        )}
      </div>
    </section>
  );
};

export { Hero195 };

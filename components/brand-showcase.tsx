"use client";

import { useRef, useState, useCallback } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PixabayVideo } from "@/components/hero195";

const categories = [
  {
    id: "fashion",
    label: "Fashion & Lifestyle",
    tagline: "Style campaigns that convert",
    count: "420+ brands",
    // 420w is enough for a 2-col mobile grid; quality 65 keeps it light
    poster: "https://images.unsplash.com/photo-1558171481-4a71df7748bb?w=420&q=65&auto=format&fit=crop",
  },
  {
    id: "tech",
    label: "Tech & Gadgets",
    tagline: "Product launches that reach buyers",
    count: "290+ brands",
    poster: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=420&q=65&auto=format&fit=crop",
  },
  {
    id: "beauty",
    label: "Beauty & Skincare",
    tagline: "Authentic reviews, verified reach",
    count: "510+ brands",
    poster: "https://images.unsplash.com/photo-1596704017788-cef9b1be6a9b?w=420&q=65&auto=format&fit=crop",
  },
  {
    id: "food",
    label: "Food & Beverage",
    tagline: "Taste-driven content at scale",
    count: "380+ brands",
    poster: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=420&q=65&auto=format&fit=crop",
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    tagline: "Performance content for active audiences",
    count: "220+ brands",
    poster: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=420&q=65&auto=format&fit=crop",
  },
  {
    id: "gaming",
    label: "Gaming & Entertainment",
    tagline: "Deep engagement, measurable views",
    count: "350+ brands",
    poster: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=420&q=65&auto=format&fit=crop",
  },
];

function CategoryCard({
  category,
  video,
}: {
  category: (typeof categories)[0];
  video?: PixabayVideo;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    if (!videoRef.current || !video) return;
    videoRef.current.play().catch(() => {});
    setPlaying(true);
  }, [video]);

  const pause = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
  }, []);

  return (
    <div
      className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl"
      onMouseEnter={play}
      onMouseLeave={pause}
      onTouchStart={playing ? pause : play}
    >
      {/* Static poster — lazy loaded, sized to card width */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.poster}
        alt={category.label}
        width={420}
        height={525}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      {/* Video — preload=none so nothing downloads until hover/touch */}
      {video && (
        <video
          ref={videoRef}
          src={video.videos.small?.url || video.videos.medium?.url || video.videos.tiny?.url}
          muted
          loop
          playsInline
          preload="none"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {/* Play icon — shows on hover if video available */}
      {video && (
        <div
          className={cn(
            "absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200",
            playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Play className="size-3 fill-white text-white" />
        </div>
      )}

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/55">
          {category.count}
        </p>
        <h3 className="text-sm font-bold leading-snug tracking-[-0.01em] sm:text-base">
          {category.label}
        </h3>
        <p className="mt-0.5 text-xs text-white/60 sm:text-sm">{category.tagline}</p>
      </div>
    </div>
  );
}

interface BrandShowcaseProps {
  videos?: PixabayVideo[];
  className?: string;
}

export function BrandShowcase({ videos = [], className }: BrandShowcaseProps) {
  return (
    <section className={cn("section-padding border-t border-border/60", className)}>
      <div className="container mx-auto">
        <div className="mb-7 sm:mb-9">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Brand categories
          </p>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl lg:text-4xl">
            Every category, one platform
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Brands across verticals use Sterclip to fund campaigns, verify creator views, and release payouts automatically.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} video={videos[i]} />
          ))}
        </div>

        {videos.length > 0 && (
          <p className="mt-5 text-center text-[11px] tracking-wide text-muted-foreground/55">
            Hover or tap to preview creator content · Videos via Pixabay
          </p>
        )}
      </div>
    </section>
  );
}

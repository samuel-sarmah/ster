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
    poster: "https://images.unsplash.com/photo-1558171481-4a71df7748bb?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "tech",
    label: "Tech & Gadgets",
    tagline: "Product launches that reach buyers",
    count: "290+ brands",
    poster: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "beauty",
    label: "Beauty & Skincare",
    tagline: "Authentic reviews, verified reach",
    count: "510+ brands",
    poster: "https://images.unsplash.com/photo-1596704017788-cef9b1be6a9b?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "food",
    label: "Food & Beverage",
    tagline: "Taste-driven content at scale",
    count: "380+ brands",
    poster: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    tagline: "Performance content for active audiences",
    count: "220+ brands",
    poster: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "gaming",
    label: "Gaming & Entertainment",
    tagline: "Deep engagement, measurable views",
    count: "350+ brands",
    poster: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=700&q=80&auto=format&fit=crop",
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
      className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl"
      onMouseEnter={play}
      onMouseLeave={pause}
      onTouchStart={playing ? pause : play}
    >
      {/* Static poster */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.poster}
        alt={category.label}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Video — only mounted if a video is provided */}
      {video && (
        <video
          ref={videoRef}
          src={video.videos.small?.url || video.videos.medium?.url || video.videos.tiny?.url}
          muted
          loop
          playsInline
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

      {/* Play indicator */}
      {video && (
        <div
          className={cn(
            "absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300",
            playing
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
          )}
        >
          <Play className="size-3 fill-white text-white" />
        </div>
      )}

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/60">
          {category.count}
        </p>
        <h3 className="text-lg font-bold leading-tight tracking-[-0.01em]">
          {category.label}
        </h3>
        <p className="mt-1 text-sm text-white/65">{category.tagline}</p>
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
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Brand categories
          </p>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl lg:text-5xl">
            Every category, one platform
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground lg:text-lg">
            Brands across verticals use Sterclip to fund campaigns, verify creator views, and release payouts automatically.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} video={videos[i]} />
          ))}
        </div>

        {videos.length > 0 && (
          <p className="mt-6 text-center text-[11px] tracking-wide text-muted-foreground/60">
            Hover or tap a card to preview creator content · Videos via Pixabay
          </p>
        )}
      </div>
    </section>
  );
}

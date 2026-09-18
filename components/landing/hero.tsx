"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Banknote, Check, ChevronRight, Lock } from "lucide-react";
import { TikTokIcon, InstagramIcon, YouTubeIcon, XIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "./use-count-up";
import { AreaChart } from "./chart";
import { Container, MockCard, btnPrimary, btnSecondary } from "./section";

const CPM = 4; // $4 per 1,000 views — drives the live math
const ESCROW = 20_000;

const fmtInt = (n: number) => Math.floor(n).toLocaleString("en-US");
const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const PLATFORMS = [
  { label: "TikTok", Icon: TikTokIcon, done: true },
  { label: "Instagram", Icon: InstagramIcon, done: true },
  { label: "YouTube", Icon: YouTubeIcon, done: true },
  { label: "X", Icon: XIcon, done: false },
];

const EARNINGS_SERIES = [4, 6, 9, 11, 15, 18, 21, 27, 30, 36, 41, 45, 52, 58, 64, 73];

/**
 * Three overlapping product tiles. The views figure ticks up and the escrow
 * bar fills in lockstep at the CPM — the product promise, happening live.
 */
function HeroCards() {
  const [views, setViews] = useState(3_812_400);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => {
      setViews((v) => v + Math.floor(180 + Math.random() * 900));
    }, 140);
    return () => clearInterval(id);
  }, []);

  const earnings = (views / 1000) * CPM;
  const released = Math.min(100, (earnings / ESCROW) * 100);

  return (
    <div className="relative mx-auto flex w-full max-w-[540px] flex-col gap-3 sm:block sm:h-[372px]">
      {/* verified views */}
      <MockCard className="w-full sm:absolute sm:right-8 sm:top-0 sm:w-[268px]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-accent">
            <BadgeCheck className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none tabular-nums text-foreground">
              {fmtInt(views)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">verified views</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2">
          {PLATFORMS.map((p) => (
            <div key={p.label} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full",
                  p.done ? "bg-accent text-white" : "bg-border text-muted-foreground"
                )}
              >
                {p.done ? <Check className="size-3.5" strokeWidth={3} /> : <p.Icon className="size-3" />}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">{p.label}</span>
            </div>
          ))}
        </div>
      </MockCard>

      {/* escrow release */}
      <MockCard className="w-full sm:absolute sm:left-0 sm:top-[136px] sm:w-[328px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-[#17a6e8] text-white">
              <Lock className="size-3" />
            </span>
            Escrow
          </span>
          <span className="text-sm font-semibold text-[#17a6e8]">{released.toFixed(0)}% released</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#17a6e8] transition-[width] duration-200 ease-out"
            style={{ width: `${released}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            {fmtMoney(earnings)} / {fmtMoney(ESCROW)}
          </span>
          <span>${CPM.toFixed(2)} CPM</span>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground">
            <span>$20k</span>
            <span>$10k</span>
            <span>$0</span>
          </div>
          <AreaChart values={EARNINGS_SERIES} stroke="#17a6e8" height={72} width={260} className="flex-1" />
        </div>
      </MockCard>

      {/* paid out */}
      <MockCard className="w-full text-center sm:absolute sm:right-0 sm:top-[184px] sm:w-[160px] sm:py-5">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_6px_16px_rgba(76,199,74,0.35)]">
          <Banknote className="size-7" />
        </span>
        <p className="mt-3 text-sm font-semibold text-foreground">Paid out</p>
        <p className="mt-0.5 text-xs text-muted-foreground">$4,000.00 · Stripe</p>
      </MockCard>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
      <Container className="grid items-center gap-14 lg:grid-cols-[600px_1fr] lg:gap-10">
        {/* left: the pitch */}
        <div className="max-w-[600px]">
          <h1 className="text-[40px] font-semibold leading-[1.02] tracking-[-1.2px] text-foreground sm:text-[52px] lg:text-[60px] lg:leading-[60px] lg:tracking-[-1.5px]">
            Creator campaigns, <span className="text-accent">paid on proof</span>
          </h1>

          <p className="mt-6 text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-8">
            Brands fund escrow. Creators post. Views are read from the platform
            APIs and paid out weekly through Stripe.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="/signup" className={btnPrimary}>
              Start earning
              <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a href="/signup?role=brand" className={btnSecondary}>
              Fund a campaign
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
            <span className="text-xs font-medium">Verified on</span>
            <TikTokIcon className="size-4" aria-label="TikTok" />
            <InstagramIcon className="size-4" aria-label="Instagram" />
            <YouTubeIcon className="size-4" aria-label="YouTube" />
            <XIcon className="size-4" aria-label="X" />
            <span className="text-xs font-medium">· Paid through</span>
            <span className="text-[15px] font-bold tracking-[-0.03em]">stripe</span>
          </div>
        </div>

        {/* right: the product, live */}
        <div className="flex justify-center lg:justify-end">
          <HeroCards />
        </div>
      </Container>
    </section>
  );
}

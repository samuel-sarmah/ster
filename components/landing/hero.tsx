"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { TikTokIcon, InstagramIcon, YouTubeIcon, XIcon } from "@/components/brand-icons";
import { prefersReducedMotion } from "./use-count-up";

const CPM = 4; // $4 per 1,000 views — drives the live math

const fmtInt = (n: number) => Math.floor(n).toLocaleString("en-US");
const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/**
 * The soul of the page: a payout statement that is visibly *alive*. Views tick
 * up, and dollars accrue in lockstep at the CPM rate — the whole product promise
 * ("views become verified income") happening in front of you.
 */
function LiveStatement() {
  const [views, setViews] = useState(3_812_400);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => {
      // a believable, slightly jittery trickle of new verified views
      setViews((v) => v + Math.floor(180 + Math.random() * 900));
    }, 140);
    return () => clearInterval(id);
  }, []);

  const earnings = (views / 1000) * CPM;
  const budget = 20_000;
  const released = Math.min(100, (earnings / budget) * 100);

  return (
    <div className="relative w-full max-w-md">
      {/* accent glow behind the statement */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 bg-accent/15 blur-3xl"
        style={{ maskImage: "radial-gradient(closest-side, black, transparent)" }}
      />

      <div className="border border-border bg-card shadow-[0_30px_70px_-25px_rgba(40,20,10,0.35)]">
        {/* statement header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Payout statement
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping bg-accent opacity-75" />
              <span className="relative inline-flex size-1.5 bg-accent" />
            </span>
            Live
          </span>
        </div>

        {/* the two numbers that move together */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Verified views
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
              {fmtInt(views)}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Earned so far
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-accent">
              {fmtMoney(earnings)}
            </p>
          </div>
        </div>

        {/* budget release meter */}
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono">${CPM.toFixed(2)} / 1,000 views</span>
            <span className="font-mono">{released.toFixed(1)}% of escrow released</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden bg-muted">
            <div
              className="h-full bg-accent transition-[width] duration-200 ease-out"
              style={{ width: `${released}%` }}
            />
          </div>
        </div>

        {/* ledger line items */}
        <div className="divide-y divide-border">
          {[
            { icon: <TikTokIcon className="size-3.5 text-foreground" />, handle: "@maya.makes", v: "1.2M", amt: "+$4,800.00" },
            { icon: <YouTubeIcon className="size-3.5 text-[#FF0000]" />, handle: "@deshawn", v: "740K", amt: "+$2,960.00" },
            { icon: <InstagramIcon className="size-3.5 text-[#E4405F]" />, handle: "@lena.co", v: "512K", amt: "+$2,048.00" },
          ].map((row) => (
            <div key={row.handle} className="flex items-center gap-3 px-5 py-2.5">
              <span className="flex size-6 items-center justify-center border border-border bg-muted">
                {row.icon}
              </span>
              <span className="text-xs font-semibold text-foreground">{row.handle}</span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">{row.v} views</span>
              <span className="w-20 text-right font-mono text-[11px] font-semibold text-accent">
                {row.amt}
              </span>
            </div>
          ))}
        </div>

        {/* verified stamp footer */}
        <div className="flex items-center gap-2 border-t border-border bg-muted/50 px-5 py-3">
          <span className="flex size-4 items-center justify-center bg-accent text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Verified via platform API · paid by Stripe
          </span>
        </div>
      </div>
    </div>
  );
}

const btnPrimary =
  "group inline-flex h-12 items-center justify-center gap-2 bg-accent px-7 text-sm font-bold text-white transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px";
const btnGhost =
  "inline-flex h-12 items-center justify-center gap-2 border border-border px-7 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-muted active:translate-y-px";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* faint ledger grid + top-down accent wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[52rem] -translate-x-1/2 bg-[oklch(0.78_0.11_262)]/40 blur-[120px]"
      />

      <div className="container mx-auto grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28">
        {/* left: the pitch */}
        <div className="max-w-xl">
          <h1 className="text-balance text-4xl font-black leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
            Views in.
            <br />
            Dollars out.
            <br />
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
            Sterz locks the budget in escrow before a single frame goes live, pulls
            your real view counts straight from the platform&rsquo;s API, and releases
            your cut the moment they&rsquo;re verified. 
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="/signup" className={btnPrimary}>
              Start earning
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a href="/signup?role=brand" className={btnGhost}>
              Fund a campaign
            </a>
          </div>

          {/* platform verification line */}
          <div className="mt-9 flex items-center gap-4 border-t border-border pt-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Verified on
            </span>
            <div className="flex items-center gap-4 text-foreground/75">
              <TikTokIcon className="size-4" />
              <InstagramIcon className="size-4" />
              <YouTubeIcon className="size-4" />
              <XIcon className="size-4" />
            </div>
          </div>
        </div>

        {/* right: the living statement */}
        <div className="flex justify-center lg:justify-end">
          <LiveStatement />
        </div>
      </div>
    </section>
  );
}

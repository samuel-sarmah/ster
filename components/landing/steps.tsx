import { Wallet, Clapperboard, BadgeCheck } from "lucide-react";

const STEPS = [
  {
    icon: Wallet,
    kicker: "Brand",
    title: "Fund the campaign",
    body: "A brand sets a CPM say $4 per 1,000 views and deposits the budget into escrow. The money is locked before anyone is asked to lift a camera.",
  },
  {
    icon: Clapperboard,
    kicker: "Creator",
    title: "Post the video",
    body: "Creators browse live campaigns, claim the ones that fit, post on TikTok, Instagram, YouTube or X, and drop in the URL.",
  },
  {
    icon: BadgeCheck,
    kicker: "Sterz",
    title: "Get paid on proof",
    body: "We pull the real view count from the platform API, multiply by the CPM, run fraud checks, and release earnings through Stripe Connect. Automatically.",
  },
];

export function Steps() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border">
      <div className="container mx-auto py-20 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl">
            Three moves from post to payout.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="group relative flex flex-col bg-card p-7 transition-colors duration-300 hover:bg-muted/40 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-5xl font-black leading-none text-foreground/[0.08] transition-colors duration-300 group-hover:text-accent/30">
                    0{i + 1}
                  </span>
                  <span className="flex size-10 items-center justify-center border border-border bg-muted text-accent">
                    <Icon className="size-5" />
                  </span>
                </div>

                <span className="mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                  {step.kicker}
                </span>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

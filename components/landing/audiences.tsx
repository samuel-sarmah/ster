import { ArrowRight } from "lucide-react";

const BRAND_POINTS = [
  "Pay per verified view",
  "Escrow caps your spend; you can’t overpay",
  "Track every creator’s performance in one ledger",
  "Launch across four platforms without extra ops",
];

const CREATOR_POINTS = [
  "See the budget is funded before you post",
  "Your earnings are math",
  "Cash out through Stripe",
  "Stack campaigns that fit your niche and audience",
];

function Column({
  tag,
  title,
  points,
  href,
  cta,
  accent,
}: {
  tag: string;
  title: string;
  points: string[];
  href: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "relative bg-card p-8 sm:p-10"
          : "bg-muted/50 p-8 sm:p-10"
      }
    >
      {accent && <div aria-hidden className="pointer-events-none absolute inset-0 bg-accent/[0.05]" />}
      <div className="relative flex h-full flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
          {tag}
        </span>
        <h3 className="mt-3 text-2xl font-black tracking-[-0.02em] text-foreground sm:text-3xl">
          {title}
        </h3>
        <ul className="mt-7 space-y-3.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 bg-accent" />
              {p}
            </li>
          ))}
        </ul>
        <a
          href={href}
          className="group mt-9 inline-flex items-center gap-2 self-start border-b border-accent/40 pb-1 text-sm font-bold text-foreground transition-colors hover:border-accent"
        >
          {cta}
          <ArrowRight className="size-4 text-accent transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}

export function Audiences() {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl">
            Built for the people writing the checks and the people earning them.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          <Column
            tag="For brands"
            title="Spend on outcomes, not promises."
            points={BRAND_POINTS}
            href="/signup?role=brand"
            cta="Fund a campaign"
          />
          <Column
            tag="For creators"
            title="Get paid what your views are worth."
            points={CREATOR_POINTS}
            href="/signup"
            cta="Start earning"
            accent
          />
        </div>
      </div>
    </section>
  );
}

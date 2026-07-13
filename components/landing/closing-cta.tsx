import { ArrowRight } from "lucide-react";

const btnPrimary =
  "group inline-flex h-12 items-center justify-center gap-2 bg-accent px-7 text-sm font-bold text-white transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px";
const btnGhost =
  "inline-flex h-12 items-center justify-center gap-2 border border-border px-7 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-muted active:translate-y-px";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[30rem] -translate-y-1/2 bg-[oklch(0.8_0.1_262)]/35 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(100% 100% at 50% 50%, black, transparent 70%)",
        }}
      />

      <div className="container mx-auto py-24 text-center lg:py-32">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
          Close the loop
        </span>
        <h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.03] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
          Stop paying on trust.
          <br />
          Start paying on <span className="text-accent">proof.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground">
          Whether you&rsquo;re funding the campaign or filming it, the money only moves
          when the views are real. Set it up in minutes.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/signup" className={btnPrimary}>
            Start earning
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a href="/signup?role=brand" className={btnGhost}>
            Fund a campaign
          </a>
        </div>
      </div>
    </section>
  );
}

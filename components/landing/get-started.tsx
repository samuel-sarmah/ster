import { ChevronRight } from "lucide-react";
import { Container, btnPrimaryLg, btnSecondaryLg } from "./section";

export function GetStarted() {
  return (
    <section className="border-t border-border bg-[var(--surface)] py-20 lg:py-24">
      <Container className="text-center">
        <h2 className="text-balance text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[40px]">
          Start with a funded campaign
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
          Creators claim a brief and earn on verified views. Brands set a CPM and pay only for views the platform confirms.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/signup" className={btnPrimaryLg}>
            Start earning
            <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a href="/signup?role=brand" className={btnSecondaryLg}>
            Fund a campaign
          </a>
        </div>
      </Container>
    </section>
  );
}

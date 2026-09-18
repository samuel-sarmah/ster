import { ChevronRight } from "lucide-react";
import { TikTokIcon, InstagramIcon, YouTubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { Container, DotGrid, Frame, MockCard, SectionHeader } from "./section";

/* ---------- mocks ---------- */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-xs font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function FundMock() {
  return (
    <MockCard className="w-full max-w-[300px]">
      <p className="text-sm font-semibold text-foreground">New campaign</p>
      <div className="mt-3 space-y-2">
        <Field label="Rate" value="$4.00 / 1,000 views" />
        <Field label="Budget" value="$20,000.00" />
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-[11px] text-muted-foreground">Platforms</span>
          <span className="flex items-center gap-1.5">
            <TikTokIcon className="size-3.5 text-foreground" />
            <InstagramIcon className="size-3.5 text-[#E4405F]" />
            <YouTubeIcon className="size-3.5 text-[#FF0000]" />
          </span>
        </div>
      </div>
      <button
        type="button"
        tabIndex={-1}
        className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-md bg-accent text-[13px] font-semibold text-white"
      >
        Fund in escrow
        <ChevronRight className="size-3.5" />
      </button>
    </MockCard>
  );
}

function ClaimMock() {
  return (
    <div className="w-[228px] overflow-hidden rounded-[36px] border-[8px] border-[#0a0a0a] bg-[var(--surface)] shadow-[0_20px_40px_-20px_rgba(10,10,10,0.35)]">
      <div className="flex justify-center pt-2">
        <span className="h-5 w-16 rounded-full bg-[#0a0a0a]" />
      </div>
      <div className="px-3 pb-4 pt-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground">Luminos Co.</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent-deep)]">
              $4 CPM
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-foreground">Summer Lifestyle</p>
          <p className="text-[10px] text-muted-foreground">$7,600 remaining</p>
        </div>
        <div className="mt-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-[10px] text-muted-foreground">
          tiktok.com/@maya.makes/video/72…
        </div>
        <div className="mt-2 flex h-8 items-center justify-center rounded-md bg-accent text-[12px] font-semibold text-white">
          Submit post
        </div>
      </div>
    </div>
  );
}

const LEDGER = [
  { t: "06:00", text: "Read 1,204,881 views", note: "TikTok API" },
  { t: "12:00", text: "Read 1,231,904 views", note: "+27,023 · verified" },
  { t: "Mon 00:00", text: "Payout $4,000.00", note: "Stripe Connect", ok: true },
];

function LedgerMock() {
  return (
    <MockCard className="w-full max-w-[300px] p-0">
      {LEDGER.map((row, i) => (
        <div key={row.t} className={cn("flex items-center gap-3 px-3.5 py-2.5", i > 0 && "border-t border-border")}>
          <span className="w-[60px] text-[11px] tabular-nums text-muted-foreground">{row.t}</span>
          <div className="min-w-0">
            <p className={cn("text-xs font-semibold", row.ok ? "text-accent" : "text-foreground")}>{row.text}</p>
            <p className="text-[10px] text-muted-foreground">{row.note}</p>
          </div>
        </div>
      ))}
    </MockCard>
  );
}

/* ---------- the three steps ---------- */

const STEPS = [
  {
    kicker: "Brand",
    title: "Fund a campaign",
    body: "Set a CPM, deposit the budget and pick platforms. Money is locked before anyone posts.",
    mock: <FundMock />,
  },
  {
    kicker: "Creator",
    title: "Claim it and post",
    body: "Pick a funded brief, post on your platform and paste the URL.",
    mock: <ClaimMock />,
  },
  {
    kicker: "Sterz",
    title: "Verify and pay",
    body: "Views are read every six hours, checked for fraud and paid through Stripe on Monday.",
    mock: <LedgerMock />,
  },
];

export function Launch() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-[var(--surface)] py-20 lg:py-24">
      <Container>
        <SectionHeader
          eyebrow="How it works"
          title="Three steps from brief to bank"
          subtitle="Nobody reconciles a spreadsheet."
        />

        <Frame className="mt-12 grid bg-background lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className={cn(
                "relative flex min-h-[480px] flex-col p-8 pb-0",
                i < STEPS.length - 1 && "border-b border-dashed border-border lg:border-b-0 lg:border-r"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{s.kicker}</p>
              <h3 className="mt-1 text-lg font-medium leading-8 tracking-[-0.02em] text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">{s.body}</p>
              <div className="relative mt-6 flex flex-1 items-end justify-center pb-8">
                <DotGrid />
                <div className="relative flex w-full justify-center">{s.mock}</div>
              </div>
            </div>
          ))}
        </Frame>
      </Container>
    </section>
  );
}

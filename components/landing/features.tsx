import { ArrowUpRight, Lock } from "lucide-react";
import { TikTokIcon, InstagramIcon, YouTubeIcon, XIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { Container, DotGrid, Frame, MockCard, SectionHeader } from "./section";

/* ---------- the three mocks ---------- */

const API_READ = [
  { Icon: TikTokIcon, cls: "text-foreground", label: "TikTok", value: "1,204,881" },
  { Icon: InstagramIcon, cls: "text-[#E4405F]", label: "Instagram", value: "512,043" },
  { Icon: YouTubeIcon, cls: "text-[#FF0000]", label: "YouTube", value: "740,220" },
  { Icon: XIcon, cls: "text-foreground", label: "X", value: "88,410" },
];

function VerifiedViewsMock() {
  return (
    <MockCard className="w-full max-w-[300px] p-0">
      {API_READ.map((row, i) => (
        <div
          key={row.label}
          className={cn("flex items-center gap-3 px-3.5 py-2.5", i > 0 && "border-t border-border")}
        >
          <row.Icon className={cn("size-4", row.cls)} />
          <span className="text-xs font-semibold text-foreground">{row.label}</span>
          <span className="ml-auto text-xs tabular-nums text-foreground">{row.value}</span>
          <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
            API
          </span>
        </div>
      ))}
    </MockCard>
  );
}

function EscrowMock() {
  return (
    <MockCard className="w-full max-w-[300px]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Summer Lifestyle</p>
        <p className="text-xs text-muted-foreground">Luminos Co.</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">$20,000</p>
      <p className="text-[11px] text-muted-foreground">deposited before launch</p>
      <div className="relative mt-3 h-2 w-full rounded-full bg-muted">
        <div className="h-full w-[62%] rounded-full bg-[#17a6e8]" />
        <span className="absolute -top-2 right-0 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <Lock className="size-3" />
        </span>
      </div>
      <div className="mt-2.5 flex justify-between text-[11px]">
        <span className="font-semibold text-[#17a6e8]">$12,400 released</span>
        <span className="text-muted-foreground">$7,600 locked</span>
      </div>
    </MockCard>
  );
}

const PAYOUTS = [
  { date: "Mon 8 Sep", handle: "@maya.makes", amount: "$4,000.00", status: "Paid", ok: true },
  { date: "Mon 8 Sep", handle: "@deshawn", amount: "$2,960.00", status: "Paid", ok: true },
  { date: "Mon 15 Sep", handle: "@lena.co", amount: "$2,048.00", status: "Scheduled", ok: false },
];

function PayoutsMock() {
  return (
    <MockCard className="w-full max-w-[300px] p-0">
      {PAYOUTS.map((p, i) => (
        <div key={p.handle} className={cn("flex items-center gap-2.5 px-3.5 py-2.5", i > 0 && "border-t border-border")}>
          <span className="w-[68px] text-[11px] text-muted-foreground">{p.date}</span>
          <span className="text-xs font-semibold text-foreground">{p.handle}</span>
          <span className="ml-auto text-xs tabular-nums text-foreground">{p.amount}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em]",
              p.ok ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]" : "bg-muted text-muted-foreground"
            )}
          >
            {p.status}
          </span>
        </div>
      ))}
    </MockCard>
  );
}

/* ---------- the grid ---------- */

const CARDS = [
  {
    title: "Verified views",
    body: "Counts come from each platform's official API on a six-hour schedule. No screenshots.",
    mock: <VerifiedViewsMock />,
  },
  {
    title: "Escrow-backed budgets",
    body: "Funds are deposited before launch and capped. A campaign never pays out more than the brand put in.",
    mock: <EscrowMock />,
  },
  {
    title: "Weekly Stripe payouts",
    body: "Creators onboard once and are paid every Monday, straight to their bank.",
    mock: <PayoutsMock />,
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 lg:py-24">
      <Container>
        <SectionHeader
          eyebrow="Product"
          title="Everything between the post and the payout"
          subtitle="Escrow, verification and payouts in one place, so both sides do the same math."
        />

        <Frame className="mt-12 grid lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              className={cn(
                "group relative flex min-h-[400px] flex-col p-8 pb-0",
                i < CARDS.length - 1 && "border-b border-dashed border-border lg:border-b-0 lg:border-r"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-medium leading-8 tracking-[-0.02em] text-foreground">{card.title}</h3>
                <ArrowUpRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">{card.body}</p>
              <div className="relative mt-6 flex flex-1 items-end justify-center pb-8">
                <DotGrid />
                <div className="relative flex w-full justify-center">{card.mock}</div>
              </div>
            </div>
          ))}
        </Frame>
      </Container>
    </section>
  );
}

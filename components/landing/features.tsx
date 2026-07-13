import { Lock, Gauge, ShieldAlert, Banknote } from "lucide-react";
import { TikTokIcon, InstagramIcon, YouTubeIcon, XIcon } from "@/components/brand-icons";

const API_READ = [
  { icon: <TikTokIcon className="size-4" />, label: "TikTok", value: "1,204,881" },
  { icon: <InstagramIcon className="size-4 text-[#E4405F]" />, label: "Instagram", value: "512,043" },
  { icon: <YouTubeIcon className="size-4 text-[#FF0000]" />, label: "YouTube", value: "740,220" },
  { icon: <XIcon className="size-4" />, label: "X", value: "88,410" },
];

const CELL = "relative bg-card p-7 transition-colors duration-300 hover:bg-muted/40";

export function Features() {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto py-20 lg:py-28">

        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {/* anchor cell — verified views */}
          <div className={`${CELL} sm:col-span-2 lg:col-span-2 lg:row-span-2`}>
            <div className="flex h-full flex-col">
              <span className="flex size-10 items-center justify-center border border-border bg-muted text-accent">
                <Gauge className="size-5" />
              </span>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                Verified views, straight from the source
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                We don&rsquo;t take a creator&rsquo;s word for it and we don&rsquo;t count screenshots.
                View totals are read directly from each platform&rsquo;s official API, then turned
                into earnings at the campaign&rsquo;s CPM.
              </p>

              <div className="mt-8 space-y-px overflow-hidden border border-border bg-border">
                {API_READ.map((row) => (
                  <div key={row.label} className="flex items-center gap-3 bg-muted/50 px-4 py-2.5">
                    <span className="text-foreground/80">{row.icon}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{row.label}</span>
                    <span className="ml-auto font-mono text-xs tabular-nums text-foreground">{row.value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Cell
            icon={<Lock className="size-5" />}
            title="Escrow-backed budgets"
            body="Funds are captured up front and capped. A campaign can never pay out more than the brand deposited."
          />
          <Cell
            icon={<Banknote className="size-5" />}
            title="Stripe Connect payouts"
            body="Creators onboard once and get paid on a rolling schedule — straight to their bank, no invoices."
          />
          <Cell
            icon={<ShieldAlert className="size-5" />}
            title="Fraud-velocity checks"
            body="Suspicious view spikes are flagged before a payout releases, so bot traffic never drains a budget."
          />
          <Cell
            icon={<Gauge className="size-5" />}
            title="Transparent CPM"
            body="Every campaign shows its exact rate and remaining budget. Both sides do the same math."
          />
        </div>
      </div>
    </section>
  );
}

function Cell({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className={CELL}>
      <span className="flex size-10 items-center justify-center border border-border bg-muted text-accent">
        {icon}
      </span>
      <h3 className="mt-6 text-base font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

import { X, Check } from "lucide-react";

const OLD_WAY = [
  "Pay the creator upfront and pray",
  "Chase DMs for screenshot “proof”",
  "Reconcile creator spreadsheets by hand",
  "Invoices, net-30, and slow ghosting",
  "Inflated view counts, zero recourse",
];

const NEW_WAY = [
  "Budget locked in escrow before anyone posts",
  "View counts pulled from the platform’s own API",
  "One live ledger both sides can see",
  "Auto-payout via Stripe the instant views verify",
  "Fraud-velocity checks running in the background",
];

export function Manifesto() {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
            The creator economy runs on IOUs.
            <br className="hidden sm:block" /> Sterz runs on receipts.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {/* the old way */}
          <div className="bg-muted/50 p-7 sm:p-9">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center bg-foreground/10 text-muted-foreground">
                <X className="size-3.5" strokeWidth={3} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                The handshake economy
              </span>
            </div>
            <ul className="space-y-4">
              {OLD_WAY.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-muted-foreground line-through decoration-foreground/20">
                  <span className="mt-1.5 size-1 shrink-0 bg-foreground/25" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* the sterz way */}
          <div className="relative bg-card p-7 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-accent/[0.05]"
            />
            <div className="relative">
              <div className="mb-6 flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center bg-accent text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  The Sterz way
                </span>
              </div>
              <ul className="space-y-4">
                {NEW_WAY.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ITEMS = [
  "ESCROW LOCKED",
  "VIEWS VERIFIED",
  "$4.00 CPM",
  "NO INVOICES",
  "STRIPE PAYOUT",
  "API-SOURCED COUNTS",
  "NO SCREENSHOTS",
  "FRAUD-CHECKED",
  "PAID ON PROOF",
  "NET-ZERO WAITING",
];

/** A stock-ticker strip of the product's principles — reinforces the ledger feel. */
export function ReceiptTicker() {
  return (
    <div className="border-b border-border">
      <div
        className="container mx-auto overflow-hidden py-3"
        style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}
      >
        <div className="flex w-max animate-marquee" style={{ "--marquee-duration": "48s" } as React.CSSProperties}>
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {ITEMS.map((item) => (
              <span key={item} className="flex items-center">
                <span className="px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {item}
                </span>
                <span className="text-accent">/</span>
              </span>
            ))}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

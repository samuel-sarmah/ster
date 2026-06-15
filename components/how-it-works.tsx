import { Briefcase, Clapperboard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  icon: React.ReactNode;
  headline: string;
  body: string;
}

interface HowItWorksProps {
  heading?: string;
  steps?: Step[];
  className?: string;
}

const defaultSteps: Step[] = [
  {
    icon: <Briefcase className="size-5" />,
    headline: "Brand posts a campaign",
    body: "Sets a CPM rate (e.g. $5 per 1,000 views) and deposits the budget into escrow. Funds are locked — creators know they'll be paid before posting a single frame.",
  },
  {
    icon: <Clapperboard className="size-5" />,
    headline: "Creator joins and posts",
    body: "Follows the brief, posts on TikTok, Instagram, YouTube, or X, then submits the URL. No invoicing, no chasing — just create and submit.",
  },
  {
    icon: <ShieldCheck className="size-5" />,
    headline: "Platform verifies and pays",
    body: "View counts are pulled directly from the social platform API. Earnings are calculated as verified views × CPM rate and paid out via Stripe Connect.",
  },
];

export function HowItWorks({
  heading = "How Sterclip works",
  steps = defaultSteps,
  className,
}: HowItWorksProps) {
  return (
    <section id="how-it-works" className={cn("section-padding scroll-mt-20", className)}>
      <div className="w-4/5 mx-auto">
        <div className="mb-10 text-center">
          <span className="badge-dark mb-4">How it works</span>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] sm:text-3xl lg:text-4xl">
            {heading}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="surface-card rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {step.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mb-2 font-bold leading-snug tracking-tight">
                {step.headline}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

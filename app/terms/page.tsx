import type { Metadata } from "next";
import {
  AtSign,
  FileText,
  Hash,
  Megaphone,
  Users,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Campaign brief & terms — Sterz",
  description: "The participation terms every creator agrees to before posting to a Sterz campaign.",
};

const requirements = [
  {
    icon: Users,
    label: "Audience restrictions",
    detail:
      "Your audience must meet the campaign's targeting rules. Views from outside the brief's region, age or niche can be excluded from payout.",
  },
  {
    icon: FileText,
    label: "Read the brief",
    detail:
      "Each campaign brief defines the message, tone and banned claims. Content that contradicts it will not be approved.",
  },
  {
    icon: Hash,
    label: "Tag every video",
    detail:
      "Add the campaign tag and any disclosure tags such as #ad under every post. Untagged posts are not eligible for payout.",
  },
  {
    icon: Video,
    label: "Production quality",
    detail:
      "Clear audio, good lighting and clean edits. Low-effort or re-uploaded content may be rejected in review.",
  },
  {
    icon: AtSign,
    label: "Sterz in your bio",
    detail:
      "Keep a Sterz link in your profile for the length of the campaign so new creators and customers are attributed to you.",
  },
  {
    icon: Megaphone,
    label: "Mention the brand",
    detail:
      "Name and feature the brand inside the video, not only in the caption.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.02em] text-accent">Brief &amp; terms</p>
        <h1 className="mt-2 text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[40px]">
          Campaign participation requirements
        </h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          These apply to every campaign, on top of its individual brief. Breaking them can
          disqualify posts from verified-view payouts.
        </p>
      </header>

      <section className="space-y-3">
        {requirements.map(({ icon: Icon, label, detail }) => (
          <div
            key={label}
            className="flex gap-4 rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent-deep)]">
              <Icon className="size-4" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">{label}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-4 border-t border-border pt-8 text-sm leading-6 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Payout &amp; verification</h2>
        <p>
          Payouts are calculated per verified view at the campaign&rsquo;s posted rate, up to the
          remaining budget. Views are verified against each platform&rsquo;s reported metrics, and
          suspected fraudulent or incentivised views may be excluded.
        </p>
        <p>
          Brands fund campaigns into escrow before they go live. Sterz may withhold payout for
          content that breaches these requirements, the campaign brief, or the platform&rsquo;s terms.
        </p>
        <p>
          By applying you confirm your content will follow these requirements and comply with the
          advertising-disclosure laws in your region.
        </p>
      </section>
    </main>
  );
}

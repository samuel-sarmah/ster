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
  title: "Campaign Brief & Terms — Sterz",
  description:
    "The must-read brief and participation terms every creator must follow before posting to a Sterz campaign.",
};

const requirements = [
  {
    icon: Users,
    label: "Audience restrictions",
    detail:
      "Your audience must meet the campaign's targeting rules. Some campaigns restrict by region, age, or niche. Posting to an audience outside the brief's requirements can void payout for the affected views.",
  },
  {
    icon: FileText,
    label: "Read the brief",
    detail:
      "Every campaign has a brief that defines the message, tone, do's and don'ts, and any banned claims. Read it in full before you create your video — content that contradicts the brief will not be approved.",
  },
  {
    icon: Hash,
    label: "Tag every video",
    detail:
      "Add the required campaign tag (and any disclosure tags such as #ad or #sponsored) under every video you post for the campaign. Untagged posts are not eligible for verified-view payouts.",
  },
  {
    icon: Video,
    label: "High production quality",
    detail:
      "Deliver clear audio, good lighting, and clean edits. Low-effort, blurry, or re-uploaded content may be rejected during review.",
  },
  {
    icon: AtSign,
    label: "Add sterz in your bio",
    detail:
      "Keep a link to sterz in your profile bio for the duration of the campaign so viewers can join directly. This link is how new creators and customers are attributed to your posts.",
  },
  {
    icon: Megaphone,
    label: "Mention the brand directly",
    detail:
      "Name and feature the brand directly within the video — not only in the caption. The brand mention must be clear and unambiguous to count toward the campaign.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
      <header className="mb-10">
        <p className="text-sm font-semibold text-accent">
          Must-read brief &amp; terms
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          Campaign participation requirements
        </h1>
        <p className="mt-3 text-muted-foreground">
          Before you apply to or post for any Sterz campaign, review the
          requirements below. These apply to every campaign in addition to the
          individual brief attached to it. Failing to follow them can disqualify
          your posts from verified-view payouts.
        </p>
      </header>

      <section className="space-y-6">
        {requirements.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex gap-4 rounded-xl border p-5">
            <Icon className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h2 className="text-base font-bold text-foreground">{label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-4 border-t pt-8 text-sm text-muted-foreground">
        <h2 className="text-lg font-bold text-foreground">
          Payout &amp; verification terms
        </h2>
        <p>
          Payouts are calculated per verified view at the campaign&apos;s posted
          rate, up to the remaining campaign budget. Views are verified against
          each platform&apos;s reported metrics; suspected fraudulent,
          incentivized, or bot-driven views may be excluded.
        </p>
        <p>
          Brands fund campaigns into escrow before they go live. Approved
          earnings are released to creators according to the campaign&apos;s
          verification schedule. Sterz may withhold payout for content that
          breaches these requirements, the campaign brief, or the relevant
          platform&apos;s terms of service.
        </p>
        <p>
          By applying to a campaign you confirm that you will follow these
          requirements and the campaign brief, and that your content complies
          with all applicable advertising-disclosure laws in your region.
        </p>
      </section>
    </main>
  );
}

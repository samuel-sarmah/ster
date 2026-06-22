"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  AtSign,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  Hash,
  Loader2,
  Megaphone,
  Users,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { PlatformIcon, PLATFORM_BRAND_CLASS, type PlatformKey } from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { joinCampaign } from "@/app/campaigns/actions";
import type { CampaignCardProps } from "@/components/campaign-card";

/** Where the "must-read brief" links to. Repoint when the terms page lands. */
const BRIEF_TERMS_URL = "/terms";

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
};

function formatRate(cpm: number): string {
  const perMillion = cpm * 1000;
  return `$${perMillion.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

interface CampaignDetailDialogProps {
  campaign: CampaignCardProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  userRole?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

type JoinState =
  | { status: "idle" }
  | { status: "joined"; alreadyApplied: boolean }
  | { status: "error"; message: string };

export function CampaignDetailDialog({
  campaign,
  open,
  onOpenChange,
  isAuthenticated,
  userRole = null,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: CampaignDetailDialogProps) {
  const [joinState, setJoinState] = useState<JoinState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  // Arrow-key navigation between campaigns while the dialog is open.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hasPrev, hasNext, onPrev, onNext]);

  // Reset the join state whenever a different campaign is shown.
  useEffect(() => {
    setJoinState({ status: "idle" });
  }, [campaign?.id]);

  if (!campaign) return null;

  const remaining = campaign.total_budget - campaign.spent_budget;
  const isDemo = campaign.id.startsWith("demo-");
  const campaignId = campaign.id;

  function handleJoin() {
    startTransition(async () => {
      const result = await joinCampaign(campaignId);
      if (result.ok) {
        setJoinState({ status: "joined", alreadyApplied: result.alreadyApplied });
      } else {
        setJoinState({ status: "error", message: result.message });
      }
    });
  }

  const requirements = [
    {
      icon: Users,
      label: "Audience restrictions",
      detail: "Your audience must meet the campaign's targeting rules.",
    },
    {
      icon: FileText,
      label: "Read the brief",
      detail: (
        <>
          Review the{" "}
          <Link
            href={BRIEF_TERMS_URL}
            className="font-medium text-foreground underline underline-offset-2"
          >
            must-read brief &amp; terms
          </Link>{" "}
          before posting.
        </>
      ),
    },
    {
      icon: Hash,
      label: "Tag every video",
      detail: "Add the required campaign tag under each video you post.",
    },
    {
      icon: Video,
      label: "High production quality",
      detail: "Clear audio, good lighting, and clean edits are expected.",
    },
    {
      icon: AtSign,
      label: "Add sterz in bio",
      detail: "Put sterz in your bio so people can join directly.",
    },
    {
      icon: Megaphone,
      label: "Mention the brand",
      detail: "Call out the brand directly within the video.",
    },
  ];

  const benefits = [
    "Get paid per verified view — the more it performs, the more you earn.",
    "Work with real brands and grow your creator portfolio.",
    "Apply in minutes and post on your own schedule.",
  ];

  const ArrowButton = ({
    side,
    onClick,
    disabled,
  }: {
    side: "left" | "right";
    onClick?: () => void;
    disabled: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous campaign" : "Next campaign"}
      className={cn(
        // Anchored just outside the modal card's left/right edges (the popup
        // is the positioned ancestor), sized large for easy tapping.
        "absolute top-1/2 z-50 hidden size-16 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/25 disabled:pointer-events-none disabled:opacity-0 md:flex",
        side === "left" ? "right-full mr-5" : "left-full ml-5",
      )}
    >
      {side === "left" ? (
        <ChevronLeft className="size-9" />
      ) : (
        <ChevronRight className="size-9" />
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/95 supports-backdrop-filter:backdrop-blur-none"
        className="flex max-h-[90vh] flex-col overflow-visible sm:max-w-lg"
      >
        <ArrowButton side="left" onClick={onPrev} disabled={!hasPrev} />
        <ArrowButton side="right" onClick={onNext} disabled={!hasNext} />

        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto pr-1">
        <DialogHeader>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            {campaign.brand_name}
            {isDemo ? (
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-medium">
                Sample
              </span>
            ) : null}
          </p>
          <DialogTitle className="text-xl">{campaign.title}</DialogTitle>
          {campaign.description ? (
            <DialogDescription>{campaign.description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {campaign.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-44 w-full rounded-lg object-cover"
          />
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Pay rate</p>
            <p className="text-lg font-bold">
              {formatRate(campaign.target_cpm)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                / 1M views
              </span>
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Budget remaining</p>
            <p className="text-lg font-bold">{formatMoney(remaining)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {campaign.platforms.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              <PlatformIcon
                platform={p}
                className={cn("size-3.5", PLATFORM_BRAND_CLASS[p as PlatformKey])}
              />
              {PLATFORM_LABELS[p] ?? p}
            </span>
          ))}
        </div>

        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-semibold">Requirements</p>
          <ul className="space-y-3">
            {requirements.map(({ icon: Icon, label, detail }) => (
              <li key={label} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-muted-foreground">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Gift className="size-4 text-accent" />
            Benefits of joining
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        </div>

        {/* Demo cards are illustrative — be upfront rather than faking a join. */}
        {isDemo ? (
          <p className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            This is a sample campaign that shows how the marketplace works. Real
            brand campaigns appear here and can be joined in one click.
          </p>
        ) : joinState.status === "joined" ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" />
            <div>
              <p className="font-semibold text-foreground">
                {joinState.alreadyApplied
                  ? "You've already joined this campaign"
                  : "You're in! Application submitted"}
              </p>
              <p className="text-muted-foreground">
                The brand will review your application. Track its status from
                your dashboard.
              </p>
            </div>
          </div>
        ) : joinState.status === "error" ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {joinState.message}
          </p>
        ) : null}

        <DialogFooter className="pt-2">
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>

          {!isAuthenticated ? (
            <Link
              href={isDemo ? "/signup" : `/signup?redirect=/campaigns/${campaignId}`}
              className={buttonVariants()}
            >
              Sign up to join
            </Link>
          ) : isDemo ? (
            // No real row to join — send them to the live (real) campaign list.
            <Link href="/creator/campaigns" className={buttonVariants()}>
              See live campaigns
            </Link>
          ) : joinState.status === "joined" ? (
            <Link href="/creator/dashboard" className={buttonVariants()}>
              Go to my dashboard
            </Link>
          ) : userRole === "brand" ? (
            <Link href="/brand/campaigns" className={buttonVariants()}>
              Go to your campaigns
            </Link>
          ) : userRole === "creator" || userRole === null ? (
            <Button onClick={handleJoin} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Joining…
                </>
              ) : (
                "Join campaign"
              )}
            </Button>
          ) : (
            <Link href={`/campaigns/${campaignId}`} className={buttonVariants()}>
              View campaign
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

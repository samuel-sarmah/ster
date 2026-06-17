"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AtSign,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  Hash,
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
import { cn } from "@/lib/utils";
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
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function CampaignDetailDialog({
  campaign,
  open,
  onOpenChange,
  isAuthenticated,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: CampaignDetailDialogProps) {
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

  if (!campaign) return null;

  const remaining = campaign.total_budget - campaign.spent_budget;
  const isDemo = campaign.id.startsWith("demo-");

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
          <p className="text-sm font-semibold text-muted-foreground">
            {campaign.brand_name}
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
              className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
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

        <DialogFooter className="pt-2">
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          {isAuthenticated ? (
            <Link
              href={isDemo ? "/creator/campaigns" : `/campaigns/${campaign.id}`}
              className={buttonVariants()}
            >
              {isDemo ? "Browse live campaigns" : "View & apply"}
            </Link>
          ) : (
            <Link
              href={
                isDemo
                  ? "/signup"
                  : `/signup?redirect=/campaigns/${campaign.id}`
              }
              className={buttonVariants()}
            >
              Sign up to apply
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

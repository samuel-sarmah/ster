"use client";

import Link from "next/link";
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
import type { CampaignCardProps } from "@/components/campaign-card";

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
}

export function CampaignDetailDialog({
  campaign,
  open,
  onOpenChange,
  isAuthenticated,
}: CampaignDetailDialogProps) {
  if (!campaign) return null;

  const remaining = campaign.total_budget - campaign.spent_budget;
  const isDemo = campaign.id.startsWith("demo-");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-2 text-sm font-semibold">How to join</p>
          <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Create a free creator account</li>
            <li>Connect your social accounts</li>
            <li>Apply to the campaign and start posting</li>
            <li>Get paid per verified view</li>
          </ol>
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" />}
          >
            Close
          </DialogClose>
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

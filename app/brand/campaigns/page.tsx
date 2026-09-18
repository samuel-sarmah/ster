import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  active: "default",
  paused: "secondary",
  completed: "secondary",
  archived: "outline",
};

export default async function BrandCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, status, total_budget, spent_budget, created_at")
    .eq("brand_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campaigns"
        description="Every brief you've funded, with escrow released so far."
        action={
          <Link href="/brand/campaigns/new" className={buttonVariants()}>
            New campaign
          </Link>
        }
      />

      {(campaigns ?? []).length === 0 && (
        <EmptyState title="No campaigns yet">
          <Link href="/brand/campaigns/new" className="font-semibold text-[var(--accent-deep)] hover:underline">
            Fund your first campaign
          </Link>
        </EmptyState>
      )}

      <div className="space-y-3">
        {(campaigns ?? []).map((campaign) => {
          const pct = campaign.total_budget > 0
            ? Math.round((Number(campaign.spent_budget) / Number(campaign.total_budget)) * 100)
            : 0;
          return (
            <Link
              key={campaign.id}
              href={`/brand/campaigns/${campaign.id}`}
              className="block rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--surface)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">{campaign.title}</div>
                <Badge variant={STATUS_VARIANT[campaign.status] ?? "outline"} className="capitalize">
                  {campaign.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={pct} className="flex-1" />
                <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                  ${Number(campaign.spent_budget).toFixed(2)} / ${Number(campaign.total_budget).toLocaleString()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

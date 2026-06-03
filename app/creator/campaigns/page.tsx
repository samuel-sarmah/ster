import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function CreatorCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, description, platforms, target_cpm, total_budget, spent_budget")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Check which campaigns this creator has already applied to
  const { data: applications } = await supabase
    .from("campaign_applications")
    .select("campaign_id, status")
    .eq("creator_id", user!.id);

  const appliedMap = new Map(
    (applications ?? []).map((a) => [a.campaign_id, a.status])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Active campaigns</h1>

      {(campaigns ?? []).length === 0 && (
        <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
          No active campaigns right now. Check back later.
        </div>
      )}

      <div className="grid gap-4">
        {(campaigns ?? []).map((campaign) => {
          const applicationStatus = appliedMap.get(campaign.id);
          const remaining = Number(campaign.total_budget) - Number(campaign.spent_budget);

          return (
            <div
              key={campaign.id}
              className="border rounded-lg p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{campaign.title}</h3>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">${Number(campaign.target_cpm).toFixed(2)} CPM</div>
                  <div className="text-xs text-muted-foreground">${remaining.toFixed(0)} remaining</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(campaign.platforms as string[]).map((p) => (
                  <Badge key={p} variant="outline" className="capitalize text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/creator/campaigns/${campaign.id}`}
                  className="text-sm underline"
                >
                  View details
                </Link>
                {applicationStatus ? (
                  <Badge variant={applicationStatus === "approved" ? "default" : "secondary"}>
                    {applicationStatus}
                  </Badge>
                ) : (
                  <ApplyButton campaignId={campaign.id} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplyButton({ campaignId }: { campaignId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("campaign_applications").insert({
          campaign_id: campaignId,
          creator_id: user.id,
        });
      }}
    >
      <Button type="submit" size="sm">
        Apply
      </Button>
    </form>
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreatorCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, guidelines, content_requirements, platforms, target_cpm, total_budget, spent_budget, status"
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!campaign) notFound();

  const { data: application } = await supabase
    .from("campaign_applications")
    .select("status")
    .eq("campaign_id", id)
    .eq("creator_id", user!.id)
    .single();

  const remaining = Number(campaign.total_budget) - Number(campaign.spent_budget);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{campaign.title}</h1>
        <div className="flex gap-2 mt-1">
          {(campaign.platforms as string[]).map((p) => (
            <Badge key={p} variant="outline" className="capitalize">
              {p}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Target CPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(campaign.target_cpm).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Budget remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${remaining.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {campaign.description && (
        <div>
          <h2 className="font-semibold mb-2">Brief</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
        </div>
      )}
      {campaign.guidelines && (
        <div>
          <h2 className="font-semibold mb-2">Guidelines</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.guidelines}</p>
        </div>
      )}
      {campaign.content_requirements && (
        <div>
          <h2 className="font-semibold mb-2">Content requirements</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.content_requirements}</p>
        </div>
      )}

      <div>
        {application?.status ? (
          <Badge variant={application.status === "approved" ? "default" : "secondary"}>
            Application {application.status}
          </Badge>
        ) : (
          <ApplyButton campaignId={id} />
        )}
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
      <Button type="submit">Apply</Button>
    </form>
  );
}

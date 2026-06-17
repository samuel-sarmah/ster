import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Progress } from "@/components/ui/progress";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  active: "default",
  paused: "secondary",
  completed: "secondary",
  archived: "outline",
};

export default async function BrandDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, status, total_budget, spent_budget, created_at")
    .eq("brand_id", user!.id)
    .order("created_at", { ascending: false });

  const totalSpent = (campaigns ?? []).reduce((sum, c) => sum + Number(c.spent_budget), 0);
  const totalBudget = (campaigns ?? []).reduce((sum, c) => sum + Number(c.total_budget), 0);
  const activeCampaigns = (campaigns ?? []).filter((c) => c.status === "active").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand dashboard</h1>
        <Link href="/brand/campaigns/new" className={buttonVariants()}>
          New campaign
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Campaigns</h2>
        {(campaigns ?? []).length === 0 && (
          <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
            No campaigns yet.{" "}
            <Link href="/brand/campaigns/new" className="underline">
              Create your first
            </Link>
          </div>
        )}
        {(campaigns ?? []).map((campaign) => {
          const pct = campaign.total_budget > 0
            ? Math.round((Number(campaign.spent_budget) / Number(campaign.total_budget)) * 100)
            : 0;
          return (
            <Link
              key={campaign.id}
              href={`/brand/campaigns/${campaign.id}`}
              className="block border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{campaign.title}</div>
                <Badge variant={STATUS_VARIANT[campaign.status] ?? "outline"}>
                  {campaign.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={pct} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
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

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BrandCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("brand_id", user!.id)
    .single();

  if (!campaign) notFound();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id, platform, post_url, status, submitted_at,
      profiles!creator_id(display_name),
      earnings(verified_views, amount_usd, status)
    `)
    .eq("campaign_id", id)
    .order("submitted_at", { ascending: false });

  const totalViews = (submissions ?? []).reduce((sum, s: any) => {
    return sum + (s.earnings?.[0]?.verified_views ?? 0);
  }, 0);

  const effectiveCpm =
    totalViews > 0
      ? ((Number(campaign.spent_budget) / totalViews) * 1000).toFixed(2)
      : "—";

  const spentPct =
    campaign.total_budget > 0
      ? Math.round((Number(campaign.spent_budget) / Number(campaign.total_budget)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <div className="flex gap-2 mt-1">
            <Badge>{campaign.status}</Badge>
            {(campaign.platforms as string[]).map((p) => (
              <Badge key={p} variant="outline" className="capitalize">
                {p}
              </Badge>
            ))}
          </div>
        </div>
        {campaign.status === "draft" && (
          <Link href={`/brand/campaigns/${id}/fund`} className={buttonVariants()}>
            Fund campaign
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(campaign.total_budget).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(campaign.spent_budget).toFixed(2)}</div>
            <Progress value={spentPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Verified views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Effective CPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${effectiveCpm}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Submissions</h2>
        {(submissions ?? []).length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
            No submissions yet.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Creator</th>
                  <th className="text-left p-3 font-medium">Platform</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Views</th>
                  <th className="text-left p-3 font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(submissions as any[]).map((s) => (
                  <tr key={s.id}>
                    <td className="p-3">{s.profiles?.display_name ?? "—"}</td>
                    <td className="p-3 capitalize">{s.platform}</td>
                    <td className="p-3">
                      <Badge variant="outline">{s.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="p-3">
                      {s.earnings?.[0]?.verified_views?.toLocaleString() ?? "—"}
                    </td>
                    <td className="p-3">
                      {s.earnings?.[0]?.amount_usd
                        ? `$${Number(s.earnings[0].amount_usd).toFixed(2)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
};

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, guidelines, content_requirements, platforms, target_cpm, total_budget, spent_budget, brand_profiles ( company_name )"
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!campaign) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold">Campaign not available</h1>
          <p className="text-muted-foreground text-sm">
            This campaign may have ended or isn&apos;t active yet. Sign up to
            browse and apply for real campaigns.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/signup" className={buttonVariants()}>
              Sign up
            </Link>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Back to marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const brandName =
    (campaign.brand_profiles as unknown as { company_name: string } | null)
      ?.company_name ?? "Unknown Brand";
  const remaining =
    Number(campaign.total_budget) - Number(campaign.spent_budget);

  let role: string | null = null;
  let applicationStatus: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;

    if (role === "creator") {
      const { data: application } = await supabase
        .from("campaign_applications")
        .select("status")
        .eq("campaign_id", id)
        .eq("creator_id", user.id)
        .single();
      applicationStatus = application?.status ?? null;
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{brandName}</p>
          <h1 className="text-3xl font-black">{campaign.title}</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {(campaign.platforms as string[]).map((p) => (
              <Badge key={p} variant="outline" className="capitalize">
                {PLATFORM_LABELS[p] ?? p}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">
                Pay rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(Number(campaign.target_cpm) * 1000).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / 1M views
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">
                Budget remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${remaining.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {campaign.description && (
          <div>
            <h2 className="font-semibold mb-2">About this campaign</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {campaign.description}
            </p>
          </div>
        )}

        {campaign.guidelines && (
          <div>
            <h2 className="font-semibold mb-2">Guidelines</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {campaign.guidelines}
            </p>
          </div>
        )}

        {campaign.content_requirements && (
          <div>
            <h2 className="font-semibold mb-2">Content requirements</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {campaign.content_requirements}
            </p>
          </div>
        )}

        <div className="border-t pt-6">
          {!user && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create a free creator account to apply for this campaign.
              </p>
              <div className="flex gap-3">
                <Link
                  href={`/signup?redirect=/campaigns/${id}`}
                  className={buttonVariants()}
                >
                  Sign up to apply
                </Link>
                <Link
                  href={`/login?redirect=/campaigns/${id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {user && role === "creator" && (
            <>
              {applicationStatus ? (
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      applicationStatus === "approved" ? "default" : "secondary"
                    }
                  >
                    Application {applicationStatus}
                  </Badge>
                  {applicationStatus === "approved" && (
                    <p className="text-sm text-muted-foreground">
                      You can now submit content for this campaign.
                    </p>
                  )}
                </div>
              ) : (
                <ApplyButton campaignId={id} />
              )}
            </>
          )}

          {user && role === "brand" && (
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in as a brand.{" "}
              <Link href="/brand/campaigns" className="underline">
                Go to your campaigns
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function ApplyButton({ campaignId }: { campaignId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("campaign_applications").insert({
          campaign_id: campaignId,
          creator_id: user.id,
        });
      }}
    >
      <Button type="submit">Apply for this campaign</Button>
    </form>
  );
}

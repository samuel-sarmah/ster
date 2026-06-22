import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectPayoutButton } from "./connect-payout-button";

// Disable the shared Card's hover lift/shadow so the dashboard stat cards stay
// still instead of "wiggling" on mouse-over.
const STATIC_CARD = "hover:translate-y-0 hover:shadow-[var(--shadow-soft)]";

export default async function CreatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, display_name")
    .eq("id", user!.id)
    .single();

  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("bio, niche")
    .eq("id", user!.id)
    .single();

  const niches = (creatorProfile?.niche as string[] | null) ?? [];

  const { data: earnings } = await supabase
    .from("earnings")
    .select(`
      id, verified_views, amount_usd, status,
      campaigns!inner(title, target_cpm)
    `)
    .eq("creator_id", user!.id)
    .order("updated_at", { ascending: false });

  // Campaigns this creator has joined (applied to), newest first.
  const { data: joined } = await supabase
    .from("campaign_applications")
    .select(`
      status, applied_at,
      campaigns!inner(id, title, platforms, target_cpm)
    `)
    .eq("creator_id", user!.id)
    .order("applied_at", { ascending: false });

  const APP_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
    approved: "default",
    pending: "secondary",
    rejected: "outline",
  };

  const pending = (earnings ?? [])
    .filter((e: any) => e.status === "pending")
    .reduce((sum, e: any) => sum + Number(e.amount_usd), 0);

  const confirmed = (earnings ?? [])
    .filter((e: any) => e.status === "confirmed")
    .reduce((sum, e: any) => sum + Number(e.amount_usd), 0);

  const paid = (earnings ?? [])
    .filter((e: any) => e.status === "paid")
    .reduce((sum, e: any) => sum + Number(e.amount_usd), 0);

  const EARNINGS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
    pending: "outline",
    confirmed: "secondary",
    paid: "default",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold">Creator dashboard</h1>

      <Card className={STATIC_CARD}>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {profile?.display_name ?? "Your profile"}
            </CardTitle>
            {creatorProfile?.bio ? (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {creatorProfile.bio}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Add a bio so brands know who they&apos;re working with.
              </p>
            )}
          </div>
          <Link href="/onboarding" className="shrink-0 text-sm underline">
            Edit
          </Link>
        </CardHeader>
        <CardContent>
          {niches.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Niches:</span>
              {niches.map((n) => (
                <Badge key={n} variant="secondary" className="text-xs">
                  {n}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No niches set — pick a few to get matched to relevant campaigns.
            </p>
          )}
        </CardContent>
      </Card>

      {!profile?.stripe_account_id ? (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/20">
          <div>
            <div className="font-medium">Payout account not connected</div>
            <div className="text-sm text-muted-foreground">
              Connect your Stripe account to receive payouts.
            </div>
          </div>
          <ConnectPayoutButton />
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div className="font-medium">Payout account connected</div>
          <Badge>Connected</Badge>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className={STATIC_CARD}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className={STATIC_CARD}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${confirmed.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className={STATIC_CARD}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${paid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Campaigns you&apos;ve joined</h2>
          <Link href="/creator/campaigns" className="text-sm underline">
            Find more
          </Link>
        </div>

        {(joined ?? []).length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
            You haven&apos;t joined any campaigns yet.{" "}
            <Link href="/creator/campaigns" className="underline">
              Browse campaigns
            </Link>{" "}
            and apply.
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {(joined as any[]).map((j) => (
              <div
                key={j.campaigns.id}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/creator/campaigns/${j.campaigns.id}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {j.campaigns.title}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1">
                    {(j.campaigns.platforms as string[]).map((p) => (
                      <Badge key={p} variant="outline" className="capitalize text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground">
                    ${Number(j.campaigns.target_cpm).toFixed(2)} CPM
                  </span>
                  <Badge variant={APP_VARIANT[j.status] ?? "secondary"}>
                    {j.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Earnings by campaign</h2>
          <Link href="/creator/campaigns" className="text-sm underline">
            Find campaigns
          </Link>
        </div>

        {(earnings ?? []).length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
            No earnings yet.{" "}
            <Link href="/creator/campaigns" className="underline">
              Browse campaigns
            </Link>{" "}
            to get started.
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {(earnings as any[]).map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{e.campaigns?.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.verified_views.toLocaleString()} verified views
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">${Number(e.amount_usd).toFixed(2)}</span>
                  <Badge variant={EARNINGS_VARIANT[e.status] ?? "outline"}>{e.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

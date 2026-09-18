import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon, PLATFORM_BRAND_CLASS, type PlatformKey } from "@/components/brand-icons";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/utils";
import { ConnectPayoutButton } from "./connect-payout-button";

const APP_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "outline",
};

const EARNINGS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  paid: "default",
};

const panel = "rounded-[10px] border border-border bg-card shadow-[var(--shadow-card)]";

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

  const sumByStatus = (status: string) =>
    (earnings ?? [])
      .filter((e: any) => e.status === status)
      .reduce((sum, e: any) => sum + Number(e.amount_usd), 0);

  const pending = sumByStatus("pending");
  const confirmed = sumByStatus("confirmed");
  const paid = sumByStatus("paid");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Verified views, earnings and the campaigns you've joined."
      />

      {!profile?.stripe_account_id ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-accent bg-[var(--accent-soft)] p-4">
          <div>
            <p className="text-sm font-semibold">Connect a payout account</p>
            <p className="text-sm text-muted-foreground">
              Earnings are released through Stripe every Monday.
            </p>
          </div>
          <ConnectPayoutButton />
        </div>
      ) : (
        <div className={cn(panel, "flex items-center justify-between p-4")}>
          <p className="text-sm font-semibold">Payout account connected</p>
          <Badge>Stripe</Badge>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={`$${pending.toFixed(2)}`} note="awaiting verification" />
        <StatCard label="Confirmed" value={`$${confirmed.toFixed(2)}`} note="next payout run" />
        <StatCard label="Paid out" value={`$${paid.toFixed(2)}`} note="via Stripe" hot />
      </div>

      <section className={cn(panel, "p-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">{profile?.display_name ?? "Your profile"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {creatorProfile?.bio ?? "Add a short bio so brands know who they're working with."}
            </p>
          </div>
          <Link href="/onboarding" className="shrink-0 text-[13px] font-semibold text-[var(--accent-deep)] hover:underline">
            Edit
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {niches.length > 0 ? (
            niches.map((n) => (
              <Badge key={n} variant="secondary">
                {n}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No niches set yet.</p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Joined campaigns</h2>
          <Link href="/creator/campaigns" className="text-[13px] font-semibold text-[var(--accent-deep)] hover:underline">
            Find more
          </Link>
        </div>

        {(joined ?? []).length === 0 ? (
          <EmptyState title="No campaigns joined yet">
            <Link href="/creator/campaigns" className="font-semibold text-[var(--accent-deep)] hover:underline">
              Browse funded campaigns
            </Link>
          </EmptyState>
        ) : (
          <div className={cn(panel, "divide-y divide-border")}>
            {(joined as any[]).map((j) => (
              <div key={j.campaigns.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/creator/campaigns/${j.campaigns.id}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {j.campaigns.title}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {(j.campaigns.platforms as string[]).map((p) => (
                      <span
                        key={p}
                        className="flex size-6 items-center justify-center rounded-full border border-border bg-background"
                      >
                        <PlatformIcon
                          platform={p}
                          className={cn("size-3.5", PLATFORM_BRAND_CLASS[p as PlatformKey])}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums text-muted-foreground">
                    ${Number(j.campaigns.target_cpm).toFixed(2)} CPM
                  </span>
                  <Badge variant={APP_VARIANT[j.status] ?? "secondary"} className="capitalize">
                    {j.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Earnings by campaign</h2>

        {(earnings ?? []).length === 0 ? (
          <EmptyState title="No earnings yet">Verified views on a joined campaign appear here.</EmptyState>
        ) : (
          <div className={cn(panel, "divide-y divide-border")}>
            {(earnings as any[]).map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold">{e.campaigns?.title}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {e.verified_views.toLocaleString()} verified views
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">${Number(e.amount_usd).toFixed(2)}</span>
                  <Badge variant={EARNINGS_VARIANT[e.status] ?? "outline"} className="capitalize">
                    {e.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

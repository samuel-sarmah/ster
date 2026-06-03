import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_review: "outline",
  approved: "secondary",
  tracking: "default",
  paid: "secondary",
  rejected: "destructive",
};

export default async function CreatorSubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id, platform, post_url, status, submitted_at,
      campaigns!inner(title),
      earnings(verified_views, amount_usd, status)
    `)
    .eq("creator_id", user!.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My submissions</h1>
        <Link href="/creator/submissions/new" className={buttonVariants()}>
          New submission
        </Link>
      </div>

      {(submissions ?? []).length === 0 ? (
        <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
          No submissions yet.{" "}
          <Link href="/creator/campaigns" className="underline">
            Find campaigns
          </Link>{" "}
          and get approved first.
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {(submissions as any[]).map((s) => (
            <div key={s.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{s.campaigns?.title}</div>
                <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                  {s.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize">{s.platform}</span>
                <a href={s.post_url} target="_blank" rel="noopener" className="underline truncate max-w-xs">
                  {s.post_url}
                </a>
              </div>
              {s.earnings?.[0] && (
                <div className="text-sm">
                  {s.earnings[0].verified_views.toLocaleString()} views ·{" "}
                  <span className="font-medium">${Number(s.earnings[0].amount_usd).toFixed(2)}</span>
                </div>
              )}
              {s.status === "rejected" && (
                <p className="text-sm text-destructive">{(s as any).rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

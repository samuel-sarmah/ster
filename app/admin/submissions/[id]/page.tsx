import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SubmissionAdminActions } from "./submission-admin-actions";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select(`
      *,
      campaigns!inner(title, target_cpm),
      profiles!creator_id(display_name),
      earnings(verified_views, amount_usd, status)
    `)
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const { data: snapshots } = await supabase
    .from("view_snapshots")
    .select("view_count, fetched_at")
    .eq("submission_id", id)
    .order("fetched_at", { ascending: false })
    .limit(10);

  const { data: flags } = await supabase
    .from("admin_flags")
    .select("reason, resolved, created_at")
    .eq("submission_id", id);

  const s = submission as any;
  const earnings = s.earnings?.[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Submission review</h1>
        <Badge>{s.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="border rounded-lg divide-y">
        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Creator</div>
            <div>{s.profiles?.display_name}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Campaign</div>
            <div>{s.campaigns?.title}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Platform</div>
            <div className="capitalize">{s.platform}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Post URL</div>
            <a href={s.post_url} target="_blank" rel="noopener" className="underline text-primary break-all">
              {s.post_url}
            </a>
          </div>
          {earnings && (
            <>
              <div>
                <div className="text-muted-foreground mb-1">Verified views</div>
                <div>{earnings.verified_views.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Earnings</div>
                <div>${Number(earnings.amount_usd).toFixed(2)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <SubmissionAdminActions submissionId={id} currentStatus={s.status} earningsId={earnings?.id} />

      {(snapshots ?? []).length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">View history</h2>
          <div className="border rounded-lg divide-y text-sm">
            {snapshots!.map((snap) => (
              <div key={snap.fetched_at} className="p-3 flex justify-between">
                <span>{snap.view_count.toLocaleString()} views</span>
                <span className="text-muted-foreground">
                  {new Date(snap.fetched_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(flags ?? []).length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Flags</h2>
          <div className="space-y-2">
            {flags!.map((flag, i) => (
              <div key={i} className="border rounded-lg p-3 text-sm space-y-1">
                <div>{flag.reason}</div>
                <div className="text-muted-foreground text-xs">
                  {new Date(flag.created_at).toLocaleString()} ·{" "}
                  {flag.resolved ? "Resolved" : "Open"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * View Tracker Worker
 * Polls social APIs for view counts on approved submissions.
 * Run on Railway: `npx tsx workers/view-tracker.ts`
 */

import { Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { getAdapter } from "../lib/social";
import type { Platform } from "../lib/supabase/types";
import { decryptToken } from "../lib/crypto/token-cipher";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const VELOCITY_THRESHOLD_VIEWS_PER_HOUR = 500_000;
const PAYOUT_CONFIRMATION_THRESHOLD_VIEWS = 10_000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ViewTrackingJob {
  submission_id: string;
}

const worker = new Worker<ViewTrackingJob>(
  "view-tracking",
  async (job) => {
    const { submission_id } = job.data;

    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select(`
        id, platform, post_platform_id, creator_id, campaign_id, status, approved_at,
        social_accounts!inner(access_token),
        campaigns!inner(target_cpm)
      `)
      .eq("id", submission_id)
      .single();

    if (subErr || !submission) {
      throw new Error(`Submission ${submission_id} not found`);
    }

    if (!["approved", "tracking"].includes(submission.status)) return;

    const s = submission as any;
    const adapter = getAdapter(s.platform as Platform);
    const accessToken = s.social_accounts?.access_token
      ? decryptToken(s.social_accounts.access_token)
      : "";
    const postId = s.post_platform_id;

    if (!postId) throw new Error("No post_platform_id on submission");

    const viewCount = await adapter.fetchViews(postId, accessToken);

    // Insert snapshot
    await supabase.from("view_snapshots").insert({
      submission_id,
      view_count: viewCount,
    });

    // Update submission to tracking if still approved
    if (submission.status === "approved") {
      await supabase
        .from("submissions")
        .update({ status: "tracking" })
        .eq("id", submission_id);
    }

    // Fraud: velocity check using last two snapshots
    const { data: recent } = await supabase
      .from("view_snapshots")
      .select("view_count, fetched_at")
      .eq("submission_id", submission_id)
      .order("fetched_at", { ascending: false })
      .limit(2);

    if (recent && recent.length === 2) {
      const delta = recent[0].view_count - recent[1].view_count;
      const hours =
        (new Date(recent[0].fetched_at).getTime() -
          new Date(recent[1].fetched_at).getTime()) /
        3_600_000;
      const viewsPerHour = hours > 0 ? delta / hours : 0;

      if (viewsPerHour > VELOCITY_THRESHOLD_VIEWS_PER_HOUR) {
        // Flag for admin review
        const { data: existingFlag } = await supabase
          .from("admin_flags")
          .select("id")
          .eq("submission_id", submission_id)
          .eq("resolved", false)
          .limit(1);

        if (!existingFlag?.length) {
          await supabase.from("admin_flags").insert({
            submission_id,
            flagged_by: null, // system-generated velocity flag, not a user report
            reason: `Velocity anomaly: ${Math.round(viewsPerHour).toLocaleString()} views/hour`,
          });
        }
      }
    }

    // Update earnings
    const cpm = Number(s.campaigns?.target_cpm ?? 0);
    const amountUsd = (viewCount / 1000) * cpm;

    const { data: existingEarnings } = await supabase
      .from("earnings")
      .select("id, verified_views")
      .eq("submission_id", submission_id)
      .single();

    if (existingEarnings) {
      const newEarningsStatus =
        viewCount >= PAYOUT_CONFIRMATION_THRESHOLD_VIEWS ? "confirmed" : "pending";

      await supabase
        .from("earnings")
        .update({
          verified_views: viewCount,
          amount_usd: amountUsd,
          status: newEarningsStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEarnings.id);
    }
  },
  { connection: { url: REDIS_URL }, concurrency: 5 }
);

worker.on("completed", (job) => {
  console.log(`[view-tracker] Job ${job.id} completed for submission ${job.data.submission_id}`);
});

worker.on("failed", (job, err) => {
  console.error(`[view-tracker] Job ${job?.id} failed:`, err.message);
});

// Scheduler: enqueue tracking jobs for all active submissions every 6 hours
async function scheduleTracking() {
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id")
    .in("status", ["approved", "tracking"]);

  if (!submissions) return;

  const { viewTrackingQueue } = await import("../lib/workers/queues");

  for (const sub of submissions) {
    await viewTrackingQueue.add(
      "track",
      { submission_id: sub.id },
      { jobId: `track-${sub.id}-${Date.now()}` }
    );
  }

  console.log(`[view-tracker] Enqueued ${submissions.length} tracking jobs`);
}

// Run scheduler on startup, then every 6 hours
scheduleTracking();
setInterval(scheduleTracking, 6 * 60 * 60 * 1000);

console.log("[view-tracker] Worker started");

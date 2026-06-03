/**
 * Payout Processor Worker
 * Processes confirmed earnings and transfers funds to creators via Stripe Connect.
 * Run on Railway: `npx tsx workers/payout-processor.ts`
 */

import { Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const PAYOUT_THRESHOLD_USD = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

interface PayoutJob {
  creator_id?: string; // if absent, processes all eligible creators
}

const worker = new Worker<PayoutJob>(
  "payout",
  async (job) => {
    const { creator_id } = job.data;

    let query = supabase
      .from("earnings")
      .select(`
        id, creator_id, campaign_id, submission_id, amount_usd,
        campaigns!inner(spent_budget, total_budget, stripe_payment_intent_id),
        profiles!creator_id(stripe_account_id)
      `)
      .eq("status", "confirmed")
      .gte("amount_usd", PAYOUT_THRESHOLD_USD);

    if (creator_id) {
      query = query.eq("creator_id", creator_id);
    }

    const { data: earnings, error } = await query;

    if (error) throw error;
    if (!earnings || earnings.length === 0) return;

    for (const earning of earnings as any[]) {
      const stripeAccountId = earning.profiles?.stripe_account_id;
      if (!stripeAccountId) {
        console.warn(`[payout] Creator ${earning.creator_id} has no Stripe account — skipping`);
        continue;
      }

      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(Number(earning.amount_usd) * 100),
          currency: "usd",
          destination: stripeAccountId,
          metadata: {
            submission_id: earning.submission_id,
            earning_id: earning.id,
          },
        });

        // Mark earning as paid
        await supabase
          .from("earnings")
          .update({
            status: "paid",
            stripe_transfer_id: transfer.id,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", earning.id);

        // Update campaign spent_budget
        const newSpent =
          Number(earning.campaigns.spent_budget) + Number(earning.amount_usd);

        await supabase
          .from("campaigns")
          .update({ spent_budget: newSpent })
          .eq("id", earning.campaign_id);

        // Update submission status to paid
        await supabase
          .from("submissions")
          .update({ status: "paid" })
          .eq("id", earning.submission_id);

        console.log(
          `[payout] Transferred $${Number(earning.amount_usd).toFixed(2)} to ${stripeAccountId} (transfer ${transfer.id})`
        );
      } catch (err) {
        console.error(`[payout] Failed transfer for earning ${earning.id}:`, err);
        // Don't rethrow — continue processing other earnings
      }
    }
  },
  { connection: { url: REDIS_URL }, concurrency: 1 } // Serial to avoid double-transfer race conditions
);

worker.on("completed", (job) => {
  console.log(`[payout] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[payout] Job ${job?.id} failed:`, err.message);
});

// Weekly payout scheduler (every Monday at 00:00 UTC)
function msUntilNextMonday(): number {
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay() + 1) % 7 || 7));
  next.setUTCHours(0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

async function scheduleWeeklyPayout() {
  const { payoutQueue } = await import("../lib/workers/queues");
  await payoutQueue.add("weekly-payout", {}, { jobId: `weekly-${Date.now()}` });
  console.log("[payout] Scheduled weekly payout run");
}

setTimeout(async () => {
  await scheduleWeeklyPayout();
  setInterval(scheduleWeeklyPayout, 7 * 24 * 60 * 60 * 1000);
}, msUntilNextMonday());

console.log("[payout] Worker started");

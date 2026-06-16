import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { serverError } from "@/lib/api/error-response";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    rejection_reason: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("override_views"),
    verified_views: z.number().int().nonnegative(),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();

  if (parsed.data.action === "approve") {
    const { error } = await admin
      .from("submissions")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return serverError(error, "admin.submissions.approve");

    // Create earnings row
    const { data: submission } = await admin
      .from("submissions")
      .select("creator_id, campaign_id")
      .eq("id", id)
      .single();

    if (submission) {
      await admin.from("earnings").upsert({
        submission_id: id,
        creator_id: submission.creator_id,
        campaign_id: submission.campaign_id,
      });
    }
  } else if (parsed.data.action === "reject") {
    const { error } = await admin
      .from("submissions")
      .update({
        status: "rejected",
        rejection_reason: parsed.data.rejection_reason ?? null,
      })
      .eq("id", id);
    if (error) return serverError(error, "admin.submissions.reject");
  } else if (parsed.data.action === "override_views") {
    const verifiedViews = parsed.data.verified_views;

    const { data: submission } = await admin
      .from("submissions")
      .select("campaign_id")
      .eq("id", id)
      .single();

    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: campaign } = await admin
      .from("campaigns")
      .select("target_cpm")
      .eq("id", submission.campaign_id)
      .single();

    const amountUsd = campaign
      ? (verifiedViews / 1000) * Number(campaign.target_cpm)
      : 0;

    const { error } = await admin
      .from("earnings")
      .update({
        verified_views: verifiedViews,
        amount_usd: amountUsd,
        updated_at: new Date().toISOString(),
      })
      .eq("submission_id", id);

    if (error) return serverError(error, "admin.submissions.override_views");
  }

  return NextResponse.json({ ok: true });
}

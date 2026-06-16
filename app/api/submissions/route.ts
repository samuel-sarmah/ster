import { getAdapter } from "@/lib/social";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Platform } from "@/lib/supabase/types";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { serverError } from "@/lib/api/error-response";

const createSubmissionSchema = z.object({
  campaign_id: z.string().uuid(),
  social_account_id: z.string().uuid(),
  post_url: z.string().url(),
});

export async function POST(request: Request) {
  const result = await requireActiveUser();
  if ("error" in result) return result.error;
  const { user, supabase } = result;

  const body = await request.json();
  const parsed = createSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { campaign_id, social_account_id, post_url } = parsed.data;

  // Verify creator is approved for this campaign
  const { data: application } = await supabase
    .from("campaign_applications")
    .select("status")
    .eq("campaign_id", campaign_id)
    .eq("creator_id", user.id)
    .single();

  if (application?.status !== "approved") {
    return NextResponse.json(
      { error: "You must be approved for this campaign before submitting" },
      { status: 403 }
    );
  }

  // Verify social account belongs to creator
  const { data: socialAccount } = await supabase
    .from("social_accounts")
    .select("id, platform")
    .eq("id", social_account_id)
    .eq("creator_id", user.id)
    .single();

  if (!socialAccount) {
    return NextResponse.json({ error: "Social account not found" }, { status: 404 });
  }

  // Extract platform post ID
  const adapter = getAdapter(socialAccount.platform as Platform);
  const postPlatformId = adapter.extractPostId(post_url);

  if (!postPlatformId) {
    return NextResponse.json(
      { error: "Could not extract post ID from URL — check the URL format" },
      { status: 400 }
    );
  }

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      campaign_id,
      creator_id: user.id,
      social_account_id,
      platform: socialAccount.platform as Platform,
      post_url,
      post_platform_id: postPlatformId,
      status: "pending_review",
    })
    .select("id")
    .single();

  if (error) return serverError(error, "submissions.create");

  return NextResponse.json({ id: submission.id }, { status: 201 });
}

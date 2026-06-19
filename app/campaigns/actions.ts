"use server";

import { createClient } from "@/lib/supabase/server";

export type JoinResult =
  | { ok: true; alreadyApplied: boolean }
  | { ok: false; reason: "unauthenticated" | "not_creator" | "suspended" | "error"; message: string };

/**
 * Applies the signed-in creator to a campaign straight from the marketplace
 * modal. Mirrors the inline apply action on the campaign detail pages, but
 * returns a structured result so the dialog can render success/error inline
 * instead of navigating away.
 */
export async function joinCampaign(campaignId: string): Promise<JoinResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated", message: "Sign in to join this campaign." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .single();

  if (profile?.is_suspended) {
    return { ok: false, reason: "suspended", message: "Your account is suspended." };
  }
  if (profile?.role !== "creator") {
    return {
      ok: false,
      reason: "not_creator",
      message: "Only creator accounts can join campaigns.",
    };
  }

  // Don't double-insert if they've already applied.
  const { data: existing } = await supabase
    .from("campaign_applications")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (existing) {
    return { ok: true, alreadyApplied: true };
  }

  const { error } = await supabase.from("campaign_applications").insert({
    campaign_id: campaignId,
    creator_id: user.id,
  });

  if (error) {
    return { ok: false, reason: "error", message: "Could not join this campaign. Please try again." };
  }

  return { ok: true, alreadyApplied: false };
}

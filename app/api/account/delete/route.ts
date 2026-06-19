import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { serverError } from "@/lib/api/error-response";

/**
 * Permanently deletes the signed-in user's own account. Deleting the
 * auth.users row cascades to profiles → creator_profiles/brand_profiles,
 * social_accounts and campaign_applications. Campaigns, submissions and
 * earnings reference profiles with `on delete restrict`, so an account that
 * already has those can't be auto-deleted — we surface a 409 in that case.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = await createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("foreign key") || msg.includes("violates") || msg.includes("constraint")) {
        return NextResponse.json(
          {
            error:
              "Your account has active campaigns, submissions, or earnings and can't be deleted automatically. Please contact support.",
          },
          { status: 409 }
        );
      }
      return serverError(error, "account.delete");
    }

    // The auth user is gone — clear the now-invalid session cookies.
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error, "account.delete");
  }
}

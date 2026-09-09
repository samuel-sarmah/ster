import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * OAuth providers have no notion of "sign in only" — exchanging the code always
 * provisions an auth.users row (and, via the handle_new_user trigger, a
 * profiles row) when the provider account is unknown. So a stranger clicking
 * "Continue with Google" on the LOGIN page would silently get an account.
 *
 * The login and signup pages therefore declare their intent in the redirect
 * URL, and a login that turns out to have just created the account is undone
 * here: session dropped, user deleted, and the visitor sent to /signup.
 */
type Intent = "login" | "signup";

/**
 * How recently the auth row must have been created to count as "this exchange
 * made it". The row is inserted during exchangeCodeForSession() moments before
 * this check, so anything but a brand-new account is far outside the window.
 */
const JUST_CREATED_WINDOW_MS = 60_000;

export async function GET(request: Request) {
  const receivedAt = Date.now();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/";
  // Set by the Get Started form when signing up with Google (the OAuth flow
  // can't pass signup metadata, so the role choice rides along here instead).
  const desiredRole = searchParams.get("role");
  // Fall back to inferring intent from `role`, which only the signup page
  // sends, so OAuth round-trips already in flight during a deploy still work.
  const intent: Intent =
    searchParams.get("intent") === "signup"
      ? "signup"
      : searchParams.get("intent") === "login"
        ? "login"
        : desiredRole
          ? "signup"
          : "login";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // One round-trip for everything the routing decision needs: the role and
      // both role-profile rows. Nothing below has to query again.
      const [{ data: profile }, { data: brandRow }, { data: creatorRow }] =
        await Promise.all([
          supabase.from("profiles").select("role").eq("id", data.user.id).single(),
          supabase.from("brand_profiles").select("id").eq("id", data.user.id).maybeSingle(),
          supabase.from("creator_profiles").select("id").eq("id", data.user.id).maybeSingle(),
        ]);
      const onboarded = Boolean(brandRow || creatorRow);

      if (intent === "login" && !onboarded && justCreated(data.user, receivedAt)) {
        await rejectAccidentalSignup(supabase, data.user.id);
        return NextResponse.redirect(`${origin}/signup?error=no_account`);
      }

      let role = profile?.role ?? "creator";

      // First-time Google sign-ups default to 'creator' from the DB trigger.
      // Honour the role picked on the signup form — but only before onboarding
      // is complete, and never elevate to 'admin' (only creator/brand here).
      if (
        (desiredRole === "creator" || desiredRole === "brand") &&
        desiredRole !== role &&
        !onboarded
      ) {
        const { error: roleError } = await supabase
          .from("profiles")
          .update({ role: desiredRole })
          .eq("id", data.user.id);
        if (!roleError) role = desiredRole;
      }

      // Send to onboarding if the role-specific profile is missing. Already
      // fetched above, so this costs nothing.
      if (!(role === "brand" ? brandRow : creatorRow)) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

/** True when this OAuth exchange is what created the auth row. */
function justCreated(user: User, receivedAt: number): boolean {
  const createdAt = Date.parse(user.created_at);
  return Number.isFinite(createdAt) && receivedAt - createdAt < JUST_CREATED_WINDOW_MS;
}

/**
 * Undo an account the login flow created by accident: drop the session, then
 * delete the auth row (profiles cascades from it) so the next attempt isn't
 * mistaken for a returning user.
 */
async function rejectAccidentalSignup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  await supabase.auth.signOut();

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;
  } catch (err) {
    // The visitor is signed out either way, so this attempt is still refused.
    // But the orphaned auth row would look like a returning account next time,
    // so this needs to be loud.
    console.error(
      `[callback] failed to delete accidentally-created user ${userId}:`,
      err instanceof Error ? err.message : err
    );
  }
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/";
  // Set by the Get Started form when signing up with Google (the OAuth flow
  // can't pass signup metadata, so the role choice rides along here instead).
  const desiredRole = searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      let role = profile?.role ?? "creator";

      // First-time Google sign-ups default to 'creator' from the DB trigger.
      // Honour the role picked on the signup form — but only before onboarding
      // is complete, and never elevate to 'admin' (only creator/brand here).
      if (
        (desiredRole === "creator" || desiredRole === "brand") &&
        desiredRole !== role
      ) {
        const [{ data: brandRow }, { data: creatorRow }] = await Promise.all([
          supabase.from("brand_profiles").select("id").eq("id", data.user.id).maybeSingle(),
          supabase.from("creator_profiles").select("id").eq("id", data.user.id).maybeSingle(),
        ]);

        if (!brandRow && !creatorRow) {
          const { error: roleError } = await supabase
            .from("profiles")
            .update({ role: desiredRole })
            .eq("id", data.user.id);
          if (!roleError) role = desiredRole;
        }
      }

      // Send to onboarding if profile is incomplete
      const { data: roleProfile } = await supabase
        .from(role === "brand" ? "brand_profiles" : "creator_profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!roleProfile) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

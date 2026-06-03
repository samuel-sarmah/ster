import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role ?? "creator";

      // Send to onboarding if profile is incomplete
      const { data: roleProfile } = await supabase
        .from(role === "brand" ? "brand_profiles" : "creator_profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!roleProfile) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

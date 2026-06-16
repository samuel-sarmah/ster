import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the authenticated user for an API route and rejects suspended
 * accounts. Middleware enforces this for page routes, but its matcher only
 * gates `/brand`, `/creator`, `/admin` path prefixes — API routes need their
 * own check.
 */
export async function requireActiveUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .single();

  if (profile?.is_suspended) {
    return { error: NextResponse.json({ error: "Account suspended" }, { status: 403 }) } as const;
  }

  return { user, profile, supabase } as const;
}

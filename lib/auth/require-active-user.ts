import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the authenticated user for an API route and rejects suspended
 * accounts. proxy.ts (Next 16's middleware) enforces this for page routes, but
 * its matcher only gates `/brand`, `/creator`, `/admin` path prefixes — API
 * routes need their own check.
 */
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type ActiveUserProfile = { role: string | null; is_suspended: boolean | null };

/** Discriminated so `if ("error" in result)` narrows cleanly at call sites. */
export type RequireActiveUserResult =
  | { error: NextResponse }
  | {
      user: NonNullable<
        Awaited<ReturnType<SupabaseServerClient["auth"]["getUser"]>>["data"]["user"]
      >;
      profile: ActiveUserProfile | null;
      supabase: SupabaseServerClient;
    };

export async function requireActiveUser(): Promise<RequireActiveUserResult> {
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

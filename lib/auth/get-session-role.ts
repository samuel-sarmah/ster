import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the signed-in user and their canonical role from `profiles`.
 *
 * `profiles.role` is the single source of truth for a user's role: email
 * sign-ups seed it from signup metadata and OAuth sign-ups from the DB trigger
 * (and the /callback route honours the chosen brand/creator role). Reading
 * `user_metadata.role` instead silently breaks OAuth users, whose metadata
 * never carries a role — so anything that routes by role must use this helper.
 */
export async function getSessionRole() {
  const supabase = await createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — treat as an anonymous visitor.
    return { user: null, role: null } as const;
  }

  if (!user) return { user: null, role: null } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, role: (profile?.role as string | null) ?? null } as const;
}

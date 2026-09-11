import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for GoTrue admin operations (`auth.admin.*`).
 *
 * Deliberately NOT the cookie-bound `createAdminClient()` in ./server: that one
 * is built on @supabase/ssr, so it picks the caller's session cookie up and
 * sends the user's JWT — which the admin endpoints reject. This client carries
 * the secret key and nothing else, and must never be handed a user's input.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY for service-role client"
    );
  }

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

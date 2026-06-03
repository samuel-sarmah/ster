import { createClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/social";
import { NextResponse } from "next/server";
import type { Platform } from "@/lib/supabase/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/creator/settings/socials?error=oauth_denied`);
  }

  const [userId] = state.split(":");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/${platform}/callback`;
  const adapter = getAdapter(platform as Platform);

  try {
    const tokenData = await adapter.exchangeCode(code, redirectUri);

    await supabase.from("social_accounts").upsert({
      creator_id: user.id,
      platform: platform as Platform,
      platform_user_id: tokenData.user_id,
      handle: tokenData.handle,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      token_expires_at: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      follower_count: tokenData.follower_count ?? null,
      is_active: true,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/creator/settings/socials?connected=${platform}`
    );
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/creator/settings/socials?error=oauth_failed`
    );
  }
}

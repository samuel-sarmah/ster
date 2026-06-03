import { createClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/social";
import { NextResponse } from "next/server";
import type { Platform } from "@/lib/supabase/types";

const VALID_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform } = await params;
  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const state = `${user.id}:${platform}`;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/${platform}/callback`;
  const adapter = getAdapter(platform as Platform);
  const oauthUrl = adapter.getOAuthUrl(state, redirectUri);

  return NextResponse.redirect(oauthUrl);
}

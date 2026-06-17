import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import type { Platform } from "@/lib/supabase/types";

const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X (Twitter)",
};

export default async function SocialsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, platform, handle, follower_count, is_active, connected_at")
    .eq("creator_id", user!.id);

  const connectedPlatforms = new Set((accounts ?? []).map((a) => a.platform));

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Linked social accounts</h1>

      {connected && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          {PLATFORM_LABELS[connected as Platform]} connected successfully.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          Failed to connect account. Please try again.
        </div>
      )}

      <div className="space-y-3">
        {PLATFORMS.map((platform) => {
          const account = (accounts ?? []).find((a) => a.platform === platform);

          return (
            <div
              key={platform}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{PLATFORM_LABELS[platform]}</div>
                {account ? (
                  <div className="text-sm text-muted-foreground mt-0.5">
                    @{account.handle}
                    {account.follower_count != null &&
                      ` · ${account.follower_count.toLocaleString()} followers`}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Not connected</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {account ? (
                  <>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Link
                      href={`/api/social/${platform}/connect`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Reconnect
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/api/social/${platform}/connect`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Connect
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

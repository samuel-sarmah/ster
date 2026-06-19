import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProfileSection, PasswordSection } from "@/components/settings/profile-section";
import { DeleteAccountSection } from "@/components/settings/delete-account";

export default async function CreatorAccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <ProfileSection
        initialDisplayName={profile?.display_name ?? ""}
        email={user?.email ?? ""}
      />

      <PasswordSection />

      <section className="rounded-lg border p-4 space-y-3">
        <div>
          <h2 className="font-semibold">Connected accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Link the social platforms you post on so views can be tracked.
          </p>
        </div>
        <Link
          href="/creator/settings/socials"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Manage social accounts
        </Link>
      </section>

      <DeleteAccountSection />
    </div>
  );
}

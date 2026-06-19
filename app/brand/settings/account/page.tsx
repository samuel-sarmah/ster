import { createClient } from "@/lib/supabase/server";
import { ProfileSection, PasswordSection } from "@/components/settings/profile-section";
import { DeleteAccountSection } from "@/components/settings/delete-account";

export default async function BrandAccountSettingsPage() {
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

      <DeleteAccountSection />
    </div>
  );
}

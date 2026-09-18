import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";

const NAV = [
  { href: "/creator/dashboard", label: "Dashboard" },
  { href: "/creator/campaigns", label: "Campaigns" },
  { href: "/creator/submissions", label: "Submissions" },
  { href: "/creator/settings/socials", label: "Socials" },
  { href: "/creator/settings/account", label: "Settings" },
];

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  async function signOut() {
    "use server";

    const serverClient = await createClient();
    await serverClient.auth.signOut();
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creator") redirect("/login");

  return (
    <AppShell nav={NAV} displayName={profile?.display_name} signOut={signOut}>
      {children}
    </AppShell>
  );
}

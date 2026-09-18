import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (profile?.role !== "admin") redirect("/login");

  return (
    <AppShell nav={NAV} displayName={profile?.display_name} signOut={signOut}>
      {children}
    </AppShell>
  );
}

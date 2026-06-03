import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/submissions", label: "Submissions" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/20 flex flex-col p-4 gap-1 shrink-0">
        <div className="font-semibold text-sm mb-4 px-2">Sterclip Admin</div>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            {label}
          </Link>
        ))}
        <div className="mt-auto text-xs text-muted-foreground px-2">
          {profile?.display_name}
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

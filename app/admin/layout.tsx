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
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full border-b bg-muted/20 p-4 md:w-56 md:shrink-0 md:border-b-0 md:border-r md:flex md:flex-col md:gap-1">
        <Link href="/" className="mb-3 block px-2 text-sm font-semibold tracking-tight hover:text-primary transition-colors">
          Sterclip Admin
        </Link>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors md:flex"
          >
            {label}
          </Link>
        ))}
        <div className="mt-3 flex items-center justify-between px-2 md:mt-auto">
          <span className="text-xs text-muted-foreground">{profile?.display_name}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-muted-foreground underline hover:text-foreground">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}

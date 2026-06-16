import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/creator/dashboard", label: "Dashboard" },
  { href: "/creator/campaigns", label: "Campaigns" },
  { href: "/creator/submissions", label: "Submissions" },
  { href: "/creator/settings/socials", label: "Socials" },
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
    <div className="mx-auto max-w-7xl space-y-6 min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="font-semibold tracking-tight hover:text-primary transition-colors">
              Sterz
            </Link>
            <nav className="flex flex-wrap gap-3 sm:gap-4">
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm hover:underline">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{profile?.display_name}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-muted-foreground underline hover:text-foreground">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}

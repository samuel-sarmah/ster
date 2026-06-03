import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/brand/dashboard", label: "Dashboard" },
  { href: "/brand/campaigns", label: "Campaigns" },
];

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "brand") redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Sterclip</span>
          <nav className="flex gap-4">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-sm text-muted-foreground">{profile?.display_name}</span>
      </header>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    redirect(`/${profile?.role ?? "creator"}/dashboard`);
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-semibold text-lg tracking-tight">Sterclip</span>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Pay for views,<br />not promises.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Brands deposit escrow. Creators post. Views are verified on-chain via
          platform APIs. Creators get paid — automatically, per CPM.
        </p>
        <div className="flex gap-4 mt-2">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Start for free
          </Link>
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 pb-24 max-w-4xl mx-auto w-full">
        {[
          {
            title: "Escrow-backed campaigns",
            body: "Brands lock funds upfront. Creators know they'll get paid before they ever hit post.",
          },
          {
            title: "Verified view counts",
            body: "Views are pulled directly from TikTok, Instagram, YouTube, and X — no self-reporting.",
          },
          {
            title: "Automatic payouts",
            body: "Earnings accrue as views roll in and transfer to creator bank accounts weekly via Stripe.",
          },
        ].map(({ title, body }) => (
          <div key={title} className="space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sterclip. All rights reserved.
      </footer>
    </main>
  );
}

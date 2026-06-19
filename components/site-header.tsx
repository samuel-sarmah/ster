import { CircleHelp, Handshake, LayoutGrid, ShieldCheck } from "lucide-react";
import { Navbar1 } from "@/components/navbar1";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string | undefined;
  const dashboardUrl =
    role === "creator" ? "/creator/dashboard"
    : role === "brand" ? "/brand/dashboard"
    : role === "admin" ? "/admin/dashboard"
    : "/";

  return (
    <Navbar1
      isLoggedIn={!!user}
      dashboardUrl={dashboardUrl}
      className="sticky top-0 z-30 border-b border-border/80 bg-background py-3"
      logo={{
        url: "/",
        src: "/logo.svg",
        alt: "Sterz logo",
        title: "Sterz",
      }}
      menu={[
        { title: "Home", url: "/" },
        {
          title: "Platform",
          url: "/#marketplace",
          items: [
            {
              title: "Browse Campaigns",
              description: "Explore active brand campaigns sorted by payout rate.",
              icon: <LayoutGrid className="size-5 shrink-0" />,
              url: "/#marketplace",
            },
            {
              title: "How It Works",
              description: "Escrow funding, creator submissions, and verified payouts in one flow.",
              icon: <Handshake className="size-5 shrink-0" />,
              url: "/#how-it-works",
            },
            {
              title: "Verified Payouts",
              description: "View counts are validated via social platform APIs before payouts release.",
              icon: <ShieldCheck className="size-5 shrink-0" />,
              url: "/#how-it-works",
            },
          ],
        },
        {
          title: "Company",
          url: "/#testimonials",
          items: [
            {
              title: "Testimonials",
              description: "See how brands and creators are scaling with Sterz.",
              icon: <CircleHelp className="size-5 shrink-0" />,
              url: "/#testimonials",
            },
          ],
        },
      ]}
      auth={{
        login: { title: "Sign in", url: "/login" },
        signup: { title: "Get started", url: "/signup" },
      }}
    />
  );
}

import { BadgeCheck, LayoutGrid, Lock, Route } from "lucide-react";
import { Navbar1 } from "@/components/navbar1";
import { getSessionRole } from "@/lib/auth/get-session-role";

export async function SiteHeader() {
  const { user, role } = await getSessionRole();
  const dashboardUrl =
    role === "creator" ? "/creator/dashboard"
    : role === "brand" ? "/brand/dashboard"
    : role === "admin" ? "/admin/dashboard"
    : "/";

  return (
    <Navbar1
      isLoggedIn={!!user}
      dashboardUrl={dashboardUrl}
      className="sticky top-0 z-30 border-b border-border bg-background/85 py-3 backdrop-blur-md"
      logo={{
        url: "/",
        src: "/logo.svg",
        alt: "Sterz logo",
        title: "Sterz",
      }}
      menu={[
        {
          title: "Product",
          url: "/#features",
          items: [
            {
              title: "Verified views",
              description: "Counts read from each platform's API.",
              icon: <BadgeCheck className="size-5 shrink-0" />,
              url: "/#features",
            },
            {
              title: "Escrow & payouts",
              description: "Budgets locked up front, paid weekly via Stripe.",
              icon: <Lock className="size-5 shrink-0" />,
              url: "/#features",
            },
            {
              title: "How it works",
              description: "Fund, post, verify, pay.",
              icon: <Route className="size-5 shrink-0" />,
              url: "/#how-it-works",
            },
            {
              title: "Campaigns",
              description: "Funded briefs, sorted by rate.",
              icon: <LayoutGrid className="size-5 shrink-0" />,
              url: "/#marketplace",
            },
          ],
        },
        { title: "Creators", url: "/signup" },
        { title: "Brands", url: "/signup?role=brand" },
        { title: "Campaigns", url: "/#marketplace" },
      ]}
      auth={{
        login: { title: "Sign in", url: "/login" },
        signup: { title: "Get started", url: "/signup" },
      }}
    />
  );
}

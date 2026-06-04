import { BookOpen, Briefcase, CircleHelp, Handshake, ShieldCheck } from "lucide-react";
import { Navbar1 } from "@/components/navbar1";

export function SiteHeader() {
  return (
    <Navbar1
      className="sticky top-0 z-30 border-b border-border/80 bg-background/92 py-3 backdrop-blur-md"
      logo={{
        url: "/",
        src: "/favicon.ico",
        alt: "Sterclip logo",
        title: "Sterclip",
      }}
      menu={[
        { title: "Home", url: "/" },
        {
          title: "Platform",
          url: "/#hero",
          items: [
            {
              title: "How It Works",
              description: "Escrow funding, creator submissions, and verified payouts in one flow.",
              icon: <Handshake className="size-5 shrink-0" />,
              url: "/#hero",
            },
            {
              title: "Trust Layer",
              description: "View counts are validated using platform signals before payouts are released.",
              icon: <ShieldCheck className="size-5 shrink-0" />,
              url: "/#logos",
            },
            {
              title: "Case Gallery",
              description: "Explore examples of brand campaigns and creator content collaborations.",
              icon: <BookOpen className="size-5 shrink-0" />,
              url: "/#gallery",
            },
          ],
        },
        {
          title: "Company",
          url: "/#contact",
          items: [
            {
              title: "Pricing",
              description: "Choose the best operating mode for your team and campaign volume.",
              icon: <Briefcase className="size-5 shrink-0" />,
              url: "/#pricing",
            },
            {
              title: "Testimonials",
              description: "See how brands and creators are scaling with Sterclip.",
              icon: <CircleHelp className="size-5 shrink-0" />,
              url: "/#testimonials",
            },
          ],
        },
        { title: "Contact", url: "/#contact" },
      ]}
      auth={{
        login: { title: "Sign in", url: "/login" },
        signup: { title: "Get started", url: "/signup" },
      }}
    />
  );
}

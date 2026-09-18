import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth/get-session-role";
import { CampaignMarketplace } from "@/components/campaign-marketplace";
import { LandingHero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Launch } from "@/components/landing/launch";
import { GetStarted } from "@/components/landing/get-started";
import { Container, SectionHeader } from "@/components/landing/section";
import type { CampaignCardProps } from "@/components/campaign-card";

async function fetchPixabayImage(query: string): Promise<string | null> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&per_page=3&safesearch=true`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.hits?.[0]?.webformatURL as string) ?? null;
  } catch {
    return null;
  }
}

/** The homepage shows a taste of the marketplace, not the catalogue. */
const HOME_CAMPAIGN_LIMIT = 20;

type Placeholder = Omit<CampaignCardProps, "imageUrl" | "description"> & { image: string };

const PLACEHOLDER_CAMPAIGNS: Placeholder[] = [
  { id: "demo-1", title: "Summer Lifestyle Collection", target_cpm: 2.5, total_budget: 4000, spent_budget: 800, platforms: ["instagram", "tiktok"], brand_name: "Luminos Co.", ends_at: "2026-08-31", image: "lifestyle summer" },
  { id: "demo-2", title: "Peak Performance Q3", target_cpm: 1.8, total_budget: 2500, spent_budget: 900, platforms: ["youtube", "tiktok"], brand_name: "AthleteX", ends_at: "2026-09-15", image: "fitness workout" },
  { id: "demo-3", title: "Glow Season Campaign", target_cpm: 3.0, total_budget: 3500, spent_budget: 200, platforms: ["instagram"], brand_name: "Velour Beauty", ends_at: "2026-07-20", image: "beauty skincare" },
  { id: "demo-4", title: "Home Chef Series", target_cpm: 1.5, total_budget: 2000, spent_budget: 1000, platforms: ["youtube", "instagram"], brand_name: "Harvest Table", ends_at: "2026-10-01", image: "cooking food" },
  { id: "demo-5", title: "Tech Drop Fall 2026", target_cpm: 3.5, total_budget: 4000, spent_budget: 1200, platforms: ["youtube", "x"], brand_name: "NovaTech", ends_at: "2026-11-30", image: "technology" },
  { id: "demo-6", title: "Explore with Us", target_cpm: 2.0, total_budget: 3000, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "Wanderbound", ends_at: "2026-09-30", image: "travel adventure" },
  { id: "demo-7", title: "Morning Brew Launch", target_cpm: 2.8, total_budget: 3500, spent_budget: 2000, platforms: ["instagram", "tiktok"], brand_name: "Café Oro", ends_at: "2026-08-15", image: "coffee shop" },
  { id: "demo-8", title: "Streetwear Drop Vol 3", target_cpm: 3.2, total_budget: 4000, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "Axis Collective", ends_at: "2026-07-30", image: "streetwear fashion" },
  { id: "demo-9", title: "Pet Wellness Push", target_cpm: 1.2, total_budget: 1500, spent_budget: 600, platforms: ["instagram", "youtube"], brand_name: "Paws & Co.", ends_at: "2026-09-01", image: "pets dogs" },
  { id: "demo-10", title: "Pro Gamer Series", target_cpm: 4.0, total_budget: 4000, spent_budget: 1200, platforms: ["youtube", "tiktok", "x"], brand_name: "Titan Gaming", ends_at: "2026-12-15", image: "gaming setup" },
  { id: "demo-11", title: "Plant Based Revolution", target_cpm: 2.0, total_budget: 3000, spent_budget: 1200, platforms: ["instagram", "youtube"], brand_name: "GreenRoot", ends_at: "2026-10-20", image: "plant based food" },
  { id: "demo-12", title: "Luxury Fragrance Edit", target_cpm: 4.0, total_budget: 4000, spent_budget: 1000, platforms: ["instagram"], brand_name: "Maison Noire", ends_at: "2026-08-01", image: "perfume luxury" },
  { id: "demo-13", title: "Back to School Tech", target_cpm: 2.2, total_budget: 3000, spent_budget: 1400, platforms: ["youtube", "tiktok"], brand_name: "Pencil+", ends_at: "2026-08-25", image: "office supplies" },
  { id: "demo-14", title: "Fitness App Challenge", target_cpm: 2.5, total_budget: 3500, spent_budget: 700, platforms: ["tiktok", "instagram"], brand_name: "SweatLab", ends_at: "2026-09-10", image: "gym fitness" },
  { id: "demo-15", title: "Eco Home Goods", target_cpm: 1.5, total_budget: 2000, spent_budget: 600, platforms: ["instagram", "youtube"], brand_name: "Terra Nest", ends_at: "2026-11-01", image: "eco friendly home" },
  { id: "demo-16", title: "Summer Music Fest", target_cpm: 2.8, total_budget: 4000, spent_budget: 2200, platforms: ["tiktok", "instagram", "x"], brand_name: "SunStage", ends_at: "2026-07-25", image: "music festival" },
  { id: "demo-17", title: "Road Trip Ready", target_cpm: 1.8, total_budget: 2500, spent_budget: 800, platforms: ["youtube", "instagram"], brand_name: "DriveFree", ends_at: "2026-09-20", image: "road trip car" },
  { id: "demo-18", title: "Minimalist Wardrobe", target_cpm: 2.5, total_budget: 3000, spent_budget: 100, platforms: ["instagram", "tiktok"], brand_name: "Studio Basic", ends_at: "2026-08-10", image: "clothing minimalist" },
  { id: "demo-19", title: "Gourmet Snack Box", target_cpm: 1.2, total_budget: 1500, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "BiteSociety", ends_at: "2026-10-05", image: "snack food" },
  { id: "demo-20", title: "Yoga Retreat 2026", target_cpm: 2.0, total_budget: 3500, spent_budget: 1700, platforms: ["instagram", "youtube"], brand_name: "ZenVista", ends_at: "2026-08-20", image: "yoga meditation" },
];

export default async function Home() {
  const supabase = await createClient();

  const { user, role: userRole } = await getSessionRole();

  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, target_cpm, total_budget, spent_budget, platforms, ends_at, brand_profiles ( company_name )",
    )
    .eq("status", "active")
    .order("target_cpm", { ascending: false })
    .limit(HOME_CAMPAIGN_LIMIT);

  const rows = data ?? [];

  let campaigns: CampaignCardProps[];

  if (rows.length > 0) {
    const imageUrls = await Promise.all(
      rows.map((row: any) => fetchPixabayImage(row.title as string)),
    );
    campaigns = rows.map((row: any, i) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | null,
      target_cpm: row.target_cpm as number,
      total_budget: row.total_budget as number,
      spent_budget: row.spent_budget as number,
      platforms: row.platforms as string[],
      ends_at: row.ends_at as string | null,
      brand_name:
        (row.brand_profiles as { company_name: string } | null)?.company_name ??
        "Unknown Brand",
      imageUrl: imageUrls[i],
    }));
  } else {
    const demo = PLACEHOLDER_CAMPAIGNS.slice(0, HOME_CAMPAIGN_LIMIT);
    const imageUrls = await Promise.all(demo.map((c) => fetchPixabayImage(c.image)));
    campaigns = demo.map(({ image: _image, ...c }, i) => ({
      ...c,
      description: "",
      imageUrl: imageUrls[i],
    }));
  }

  return (
    <main className="text-foreground">
      <LandingHero />
      <Features />
      <Launch />

      <section id="marketplace" className="scroll-mt-20 py-20 lg:py-24">
        <Container>
          <SectionHeader
            eyebrow="Campaigns"
            title="Paying out right now"
            subtitle="Every card is a funded, escrow-backed brief."
          />
        </Container>
        <CampaignMarketplace
          initialCampaigns={campaigns}
          isAuthenticated={!!user}
          userRole={userRole}
        />
        <p className="mt-10 text-center">
          <a
            href="/creator/campaigns"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--accent-deep)] hover:underline"
          >
            Browse every live campaign
            <ChevronRight className="size-3.5" />
          </a>
        </p>
      </section>

      <GetStarted />
    </main>
  );
}

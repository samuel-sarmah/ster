import { createClient } from "@/lib/supabase/server";
import { CampaignMarketplace } from "@/components/campaign-marketplace";
import { Testimonial8 } from "@/components/testimonial8";
import type { CampaignCardProps } from "@/components/campaign-card";

const testimonials = [
  {
    id: "1",
    name: "Amelia Ward",
    role: "Head of Growth, Beam Brands",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    content:
      "Sterclip gave our team one source of truth for approvals and payout readiness. We stopped reconciling creator spreadsheets manually after the first week.",
  },
  {
    id: "2",
    name: "Kian Morales",
    role: "Creator Partnerships Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    content:
      "Verification snapshots made payout conversations simple. Creators trust the process because they can see exactly how campaign performance maps to earnings.",
  },
  {
    id: "3",
    name: "Nora El-Sayed",
    role: "Operations Manager, BrightCart",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400&auto=format&fit=crop",
    content:
      "We launched across multiple channels without adding extra ops headcount. Sterclip handled queueing, status tracking, and payout flow end to end.",
  },
  {
    id: "4",
    name: "Jalen Brooks",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    content:
      "As a creator, I like knowing funds are escrowed before I publish. It removed uncertainty and helped me prioritize the right partnerships.",
  },
  {
    id: "5",
    name: "Priya Narang",
    role: "Brand Marketing Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    content:
      "Our finance and marketing teams finally work from the same campaign ledger. Visibility into spend and release timing is excellent.",
  },
  {
    id: "6",
    name: "Rafael Costa",
    role: "Campaign Analyst",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=400&auto=format&fit=crop",
    content:
      "The platform made it easy to compare creator cohorts by verified CPM and adjust campaign strategy in real time.",
  },
];

async function fetchPixabayVideo(query: string): Promise<string | null> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(query)}&per_page=3&safesearch=true`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.hits?.[0]?.videos?.tiny?.url as string) ?? null;
  } catch {
    return null;
  }
}

const PLACEHOLDER_CAMPAIGNS: Omit<CampaignCardProps, "videoUrl">[] = [
  {
    id: "demo-1",
    title: "Summer Lifestyle Collection",
    description: "Showcase our new summer line with authentic lifestyle content. Casual, sun-drenched, aspirational.",
    target_cpm: 8.5,
    total_budget: 15000,
    spent_budget: 3200,
    platforms: ["instagram", "tiktok"],
    brand_name: "Luminos Co.",
    ends_at: "2026-08-31",
  },
  {
    id: "demo-2",
    title: "Peak Performance Q3",
    description: "We want creators pushing limits — gym, trail, court. Show what peak looks like to your audience.",
    target_cpm: 6.0,
    total_budget: 22000,
    spent_budget: 7800,
    platforms: ["youtube", "tiktok"],
    brand_name: "AthleteX",
    ends_at: "2026-09-15",
  },
  {
    id: "demo-3",
    title: "Glow Season Campaign",
    description: "Skincare + confidence. We need authentic before/after routines and honest reviews.",
    target_cpm: 10.0,
    total_budget: 18500,
    spent_budget: 1100,
    platforms: ["instagram"],
    brand_name: "Velour Beauty",
    ends_at: "2026-07-20",
  },
  {
    id: "demo-4",
    title: "Home Chef Series",
    description: "Weeknight recipes, elevated. Feature our cookware in real home kitchens — no staged studio shots.",
    target_cpm: 5.5,
    total_budget: 9000,
    spent_budget: 4400,
    platforms: ["youtube", "instagram"],
    brand_name: "Harvest Table",
    ends_at: "2026-10-01",
  },
  {
    id: "demo-5",
    title: "Tech Drop Fall 2026",
    description: "Unbox, review, and integrate our latest device into your daily workflow. Honest takes preferred.",
    target_cpm: 12.0,
    total_budget: 30000,
    spent_budget: 9600,
    platforms: ["youtube", "x"],
    brand_name: "NovaTech",
    ends_at: "2026-11-30",
  },
  {
    id: "demo-6",
    title: "Explore with Us",
    description: "Travel content that feels real. Capture the destination, the food, the unexpected moments.",
    target_cpm: 7.0,
    total_budget: 12000,
    spent_budget: 2000,
    platforms: ["tiktok", "instagram"],
    brand_name: "Wanderbound",
    ends_at: "2026-09-30",
  },
];

const PLACEHOLDER_VIDEO_QUERIES = [
  "lifestyle summer",
  "fitness workout",
  "beauty skincare",
  "cooking food",
  "technology",
  "travel adventure",
];

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, target_cpm, total_budget, spent_budget, platforms, ends_at, brand_profiles ( company_name )",
    )
    .eq("status", "active")
    .order("target_cpm", { ascending: false });

  const rows = data ?? [];

  let campaigns: CampaignCardProps[];

  if (rows.length > 0) {
    const videoUrls = await Promise.all(
      rows.map((row: any) => fetchPixabayVideo(row.title as string)),
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
      videoUrl: videoUrls[i],
    }));
  } else {
    const videoUrls = await Promise.all(
      PLACEHOLDER_VIDEO_QUERIES.map(fetchPixabayVideo),
    );
    campaigns = PLACEHOLDER_CAMPAIGNS.map((c, i) => ({
      ...c,
      videoUrl: videoUrls[i],
    }));
  }

  return (
    <main>
      <CampaignMarketplace initialCampaigns={campaigns} />

      <section id="testimonials" className="scroll-mt-20">
        <Testimonial8
          heading="What brands and creators say"
          description=""
          testimonials={testimonials}
        />
      </section>
    </main>
  );
}

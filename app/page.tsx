import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth/get-session-role";
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
      "Sterz gave our team one source of truth for approvals and payout readiness. We stopped reconciling creator spreadsheets manually after the first week.",
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
      "We launched across multiple channels without adding extra ops headcount. Sterz handled queueing, status tracking, and payout flow end to end.",
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

const PLACEHOLDER_CAMPAIGNS: Omit<CampaignCardProps, "imageUrl">[] = [
  { id: "demo-1", title: "Summer Lifestyle Collection", description: "", target_cpm: 2.5, total_budget: 4000, spent_budget: 800, platforms: ["instagram", "tiktok"], brand_name: "Luminos Co.", ends_at: "2026-08-31" },
  { id: "demo-2", title: "Peak Performance Q3", description: "", target_cpm: 1.8, total_budget: 2500, spent_budget: 900, platforms: ["youtube", "tiktok"], brand_name: "AthleteX", ends_at: "2026-09-15" },
  { id: "demo-3", title: "Glow Season Campaign", description: "", target_cpm: 3.0, total_budget: 3500, spent_budget: 200, platforms: ["instagram"], brand_name: "Velour Beauty", ends_at: "2026-07-20" },
  { id: "demo-4", title: "Home Chef Series", description: "", target_cpm: 1.5, total_budget: 2000, spent_budget: 1000, platforms: ["youtube", "instagram"], brand_name: "Harvest Table", ends_at: "2026-10-01" },
  { id: "demo-5", title: "Tech Drop Fall 2026", description: "", target_cpm: 3.5, total_budget: 4000, spent_budget: 1200, platforms: ["youtube", "x"], brand_name: "NovaTech", ends_at: "2026-11-30" },
  { id: "demo-6", title: "Explore with Us", description: "", target_cpm: 2.0, total_budget: 3000, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "Wanderbound", ends_at: "2026-09-30" },
  { id: "demo-7", title: "Morning Brew Launch", description: "", target_cpm: 2.8, total_budget: 3500, spent_budget: 2000, platforms: ["instagram", "tiktok"], brand_name: "Café Oro", ends_at: "2026-08-15" },
  { id: "demo-8", title: "Streetwear Drop Vol 3", description: "", target_cpm: 3.2, total_budget: 4000, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "Axis Collective", ends_at: "2026-07-30" },
  { id: "demo-9", title: "Pet Wellness Push", description: "", target_cpm: 1.2, total_budget: 1500, spent_budget: 600, platforms: ["instagram", "youtube"], brand_name: "Paws & Co.", ends_at: "2026-09-01" },
  { id: "demo-10", title: "Pro Gamer Series", description: "", target_cpm: 4.0, total_budget: 4000, spent_budget: 1200, platforms: ["youtube", "tiktok", "x"], brand_name: "Titan Gaming", ends_at: "2026-12-15" },
  { id: "demo-11", title: "Plant Based Revolution", description: "", target_cpm: 2.0, total_budget: 3000, spent_budget: 1200, platforms: ["instagram", "youtube"], brand_name: "GreenRoot", ends_at: "2026-10-20" },
  { id: "demo-12", title: "Luxury Fragrance Edit", description: "", target_cpm: 4.0, total_budget: 4000, spent_budget: 1000, platforms: ["instagram"], brand_name: "Maison Noire", ends_at: "2026-08-01" },
  { id: "demo-13", title: "Back to School Tech", description: "", target_cpm: 2.2, total_budget: 3000, spent_budget: 1400, platforms: ["youtube", "tiktok"], brand_name: "Pencil+", ends_at: "2026-08-25" },
  { id: "demo-14", title: "Fitness App Challenge", description: "", target_cpm: 2.5, total_budget: 3500, spent_budget: 700, platforms: ["tiktok", "instagram"], brand_name: "SweatLab", ends_at: "2026-09-10" },
  { id: "demo-15", title: "Eco Home Goods", description: "", target_cpm: 1.5, total_budget: 2000, spent_budget: 600, platforms: ["instagram", "youtube"], brand_name: "Terra Nest", ends_at: "2026-11-01" },
  { id: "demo-16", title: "Summer Music Fest", description: "", target_cpm: 2.8, total_budget: 4000, spent_budget: 2200, platforms: ["tiktok", "instagram", "x"], brand_name: "SunStage", ends_at: "2026-07-25" },
  { id: "demo-17", title: "Road Trip Ready", description: "", target_cpm: 1.8, total_budget: 2500, spent_budget: 800, platforms: ["youtube", "instagram"], brand_name: "DriveFree", ends_at: "2026-09-20" },
  { id: "demo-18", title: "Minimalist Wardrobe", description: "", target_cpm: 2.5, total_budget: 3000, spent_budget: 100, platforms: ["instagram", "tiktok"], brand_name: "Studio Basic", ends_at: "2026-08-10" },
  { id: "demo-19", title: "Gourmet Snack Box", description: "", target_cpm: 1.2, total_budget: 1500, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "BiteSociety", ends_at: "2026-10-05" },
  { id: "demo-20", title: "Yoga Retreat 2026", description: "", target_cpm: 2.0, total_budget: 3500, spent_budget: 1700, platforms: ["instagram", "youtube"], brand_name: "ZenVista", ends_at: "2026-08-20" },
  { id: "demo-21", title: "Coffee Subscription Launch", description: "", target_cpm: 2.5, total_budget: 3000, spent_budget: 900, platforms: ["instagram", "tiktok"], brand_name: "BrewPost", ends_at: "2026-09-25" },
  { id: "demo-22", title: "Sustainable Denim Line", description: "", target_cpm: 2.8, total_budget: 4000, spent_budget: 1400, platforms: ["instagram", "youtube"], brand_name: "Loop Denim", ends_at: "2026-10-15" },
  { id: "demo-23", title: "Gadget Gift Guide", description: "", target_cpm: 3.5, total_budget: 4000, spent_budget: 600, platforms: ["youtube", "x"], brand_name: "GizmoHub", ends_at: "2026-11-20" },
  { id: "demo-24", title: "Skincare for Men", description: "", target_cpm: 2.2, total_budget: 2500, spent_budget: 500, platforms: ["tiktok", "instagram"], brand_name: "RuggedSkin", ends_at: "2026-08-05" },
  { id: "demo-25", title: "Family Board Game Night", description: "", target_cpm: 1.2, total_budget: 1500, spent_budget: 700, platforms: ["youtube", "instagram"], brand_name: "TableTop Co.", ends_at: "2026-12-01" },
  { id: "demo-26", title: "Zero Proof Cocktails", description: "", target_cpm: 1.8, total_budget: 2000, spent_budget: 300, platforms: ["tiktok", "instagram"], brand_name: "Dry Bar", ends_at: "2026-07-15" },
  { id: "demo-27", title: "Winter Gear Pre-Order", description: "", target_cpm: 1.5, total_budget: 2500, spent_budget: 200, platforms: ["youtube", "instagram"], brand_name: "Alpine Kit", ends_at: "2026-10-30" },
  { id: "demo-28", title: "Crypto Wallet Campaign", description: "", target_cpm: 4.0, total_budget: 4000, spent_budget: 1800, platforms: ["x", "youtube"], brand_name: "BlockVault", ends_at: "2026-11-15" },
  { id: "demo-29", title: "Haircare Refresh", description: "", target_cpm: 2.5, total_budget: 3000, spent_budget: 1200, platforms: ["instagram", "tiktok"], brand_name: "Strand", ends_at: "2026-09-05" },
  { id: "demo-30", title: "Outdoor Gear Test", description: "", target_cpm: 2.0, total_budget: 2500, spent_budget: 1000, platforms: ["youtube", "tiktok"], brand_name: "Wilder Goods", ends_at: "2026-08-28" },
  { id: "demo-31", title: "Daily Desk Setup", description: "", target_cpm: 2.0, total_budget: 2000, spent_budget: 400, platforms: ["instagram", "tiktok"], brand_name: "WorkForm", ends_at: "2026-09-12" },
  { id: "demo-32", title: "Matcha & Mindfulness", description: "", target_cpm: 1.5, total_budget: 2000, spent_budget: 900, platforms: ["instagram", "tiktok"], brand_name: "ZenCha", ends_at: "2026-08-18" },
  { id: "demo-33", title: "Sneaker Culture Vol 2", description: "", target_cpm: 3.5, total_budget: 4000, spent_budget: 2200, platforms: ["tiktok", "instagram", "x"], brand_name: "Kick Collective", ends_at: "2026-10-10" },
  { id: "demo-34", title: "Organic Baby Line", description: "", target_cpm: 1.0, total_budget: 1500, spent_budget: 500, platforms: ["instagram", "youtube"], brand_name: "Little Sprout", ends_at: "2026-09-28" },
  { id: "demo-35", title: "E-Bike City Series", description: "", target_cpm: 2.5, total_budget: 4000, spent_budget: 1800, platforms: ["youtube", "tiktok"], brand_name: "Volt Cycles", ends_at: "2026-11-05" },
  { id: "demo-36", title: "Kitchen Gadget Blitz", description: "", target_cpm: 1.5, total_budget: 2000, spent_budget: 800, platforms: ["tiktok", "instagram"], brand_name: "SmartPan", ends_at: "2026-07-28" },
  { id: "demo-37", title: "Tattoo Art Spotlight", description: "", target_cpm: 2.8, total_budget: 2000, spent_budget: 600, platforms: ["instagram"], brand_name: "InkWell", ends_at: "2026-09-22" },
  { id: "demo-38", title: "Craft Beer Release", description: "", target_cpm: 1.8, total_budget: 2500, spent_budget: 1100, platforms: ["instagram", "tiktok"], brand_name: "Hops & Co.", ends_at: "2026-08-12" },
  { id: "demo-39", title: "Vintage Furniture Pop-Up", description: "", target_cpm: 1.2, total_budget: 1500, spent_budget: 600, platforms: ["instagram", "x"], brand_name: "RetroForm", ends_at: "2026-10-08" },
  { id: "demo-40", title: "Language App Campaign", description: "", target_cpm: 2.0, total_budget: 3000, spent_budget: 1300, platforms: ["tiktok", "youtube"], brand_name: "Lingua", ends_at: "2026-09-18" },
  { id: "demo-41", title: "Sustainable Swimwear", description: "", target_cpm: 3.0, total_budget: 3000, spent_budget: 400, platforms: ["instagram", "tiktok"], brand_name: "ReefWear", ends_at: "2026-07-10" },
  { id: "demo-42", title: "Podcast Gear Launch", description: "", target_cpm: 2.5, total_budget: 3500, spent_budget: 1500, platforms: ["youtube", "x", "tiktok"], brand_name: "MicDrop", ends_at: "2026-10-22" },
  { id: "demo-43", title: "Festival Fashion Edit", description: "", target_cpm: 3.0, total_budget: 3500, spent_budget: 1000, platforms: ["instagram", "tiktok"], brand_name: "Rave On", ends_at: "2026-08-08" },
  { id: "demo-44", title: "Home Workout Setup", description: "", target_cpm: 1.8, total_budget: 2500, spent_budget: 1100, platforms: ["youtube", "tiktok"], brand_name: "Iron Room", ends_at: "2026-11-10" },
  { id: "demo-45", title: "Digital Art Tools", description: "", target_cpm: 2.2, total_budget: 2500, spent_budget: 200, platforms: ["instagram", "youtube"], brand_name: "PixelForge", ends_at: "2026-09-08" },
  { id: "demo-46", title: "Cold Brew Variety Pack", description: "", target_cpm: 1.5, total_budget: 2000, spent_budget: 800, platforms: ["tiktok", "instagram"], brand_name: "BrewCold", ends_at: "2026-08-14" },
  { id: "demo-47", title: "Adventure Watches", description: "", target_cpm: 3.5, total_budget: 4000, spent_budget: 1800, platforms: ["youtube", "x", "instagram"], brand_name: "Summit Time", ends_at: "2026-12-10" },
  { id: "demo-48", title: "Plant Parent Club", description: "", target_cpm: 1.0, total_budget: 1500, spent_budget: 300, platforms: ["instagram", "tiktok"], brand_name: "Foliage Fam", ends_at: "2026-10-12" },
  { id: "demo-49", title: "Smart Home Setup", description: "", target_cpm: 2.5, total_budget: 4000, spent_budget: 1800, platforms: ["youtube", "tiktok"], brand_name: "HausBot", ends_at: "2026-09-30" },
  { id: "demo-50", title: "Chocolate Tasting Box", description: "", target_cpm: 1.2, total_budget: 1500, spent_budget: 600, platforms: ["instagram", "tiktok"], brand_name: "Cacao Lab", ends_at: "2026-07-22" },
  { id: "demo-51", title: "Running Shoe Review", description: "", target_cpm: 2.0, total_budget: 3000, spent_budget: 1200, platforms: ["youtube", "tiktok"], brand_name: "Stride Co.", ends_at: "2026-10-05" },
  { id: "demo-52", title: "Zero Waste Home Kit", description: "", target_cpm: 1.5, total_budget: 1500, spent_budget: 200, platforms: ["instagram", "youtube"], brand_name: "NoTrace", ends_at: "2026-08-30" },
  { id: "demo-53", title: "Indie Game Spotlight", description: "", target_cpm: 3.0, total_budget: 3500, spent_budget: 1000, platforms: ["youtube", "tiktok", "x"], brand_name: "Pixels & Pints", ends_at: "2026-11-25" },
  { id: "demo-54", title: "Essential Oil Collection", description: "", target_cpm: 2.0, total_budget: 2000, spent_budget: 600, platforms: ["instagram", "tiktok"], brand_name: "Aura Mist", ends_at: "2026-09-14" },
  { id: "demo-55", title: "Graduation Gift Guide", description: "", target_cpm: 1.5, total_budget: 2000, spent_budget: 900, platforms: ["instagram", "tiktok"], brand_name: "GradBox", ends_at: "2026-08-22" },
  { id: "demo-56", title: "Trail Running Series", description: "", target_cpm: 2.0, total_budget: 3500, spent_budget: 1500, platforms: ["youtube", "instagram"], brand_name: "TrailBlaze", ends_at: "2026-10-18" },
  { id: "demo-57", title: "Sourdough Starter Kit", description: "", target_cpm: 1.0, total_budget: 1000, spent_budget: 400, platforms: ["tiktok", "instagram"], brand_name: "Bread Head", ends_at: "2026-09-02" },
  { id: "demo-58", title: "Vegan Protein Launch", description: "", target_cpm: 2.5, total_budget: 4000, spent_budget: 2200, platforms: ["instagram", "youtube"], brand_name: "PlantFuel", ends_at: "2026-11-08" },
  { id: "demo-59", title: "Drone Photography", description: "", target_cpm: 2.8, total_budget: 3000, spent_budget: 600, platforms: ["youtube", "instagram"], brand_name: "SkyFrame", ends_at: "2026-10-25" },
  { id: "demo-60", title: "Holiday Decor Preview", description: "", target_cpm: 1.8, total_budget: 2500, spent_budget: 100, platforms: ["instagram", "tiktok"], brand_name: "Festive Home", ends_at: "2026-12-01" },
];

const PLACEHOLDER_IMAGE_QUERIES = [
  "lifestyle summer", "fitness workout", "beauty skincare", "cooking food", "technology",
  "travel adventure", "coffee shop", "streetwear fashion", "pets dogs", "gaming setup",
  "plant based food", "perfume luxury", "office supplies", "gym fitness", "eco friendly home",
  "music festival", "road trip car", "clothing minimalist", "snack food", "yoga meditation",
  "coffee beans", "denim jeans", "gadgets tech", "men skincare", "board games",
  "cocktail drink", "winter jacket", "bitcoin crypto", "haircare", "camping outdoors",
  "desk workspace", "matcha tea", "sneakers shoes", "baby organic", "electric bike",
  "kitchen tools", "tattoo art", "beer craft", "vintage furniture", "language learning",
  "swimwear beach", "microphone podcast", "festival outfit", "home gym", "digital art tablet",
  "cold brew coffee", "wristwatch", "indoor plants", "smart home", "chocolate dessert",
  "running shoes", "zero waste", "video game indie", "essential oil", "graduation cap",
  "trail running", "sourdough bread", "protein powder", "drone sky", "christmas decoration",
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
    .order("target_cpm", { ascending: false });

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
    const imageUrls = await Promise.all(
      PLACEHOLDER_IMAGE_QUERIES.map(fetchPixabayImage),
    );
    campaigns = PLACEHOLDER_CAMPAIGNS.map((c, i) => ({
      ...c,
      imageUrl: imageUrls[i],
    }));
  }

  return (
    <main className="section-dark bg-black">
      <CampaignMarketplace
        initialCampaigns={campaigns}
        isAuthenticated={!!user}
        userRole={userRole}
      />

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

/**
 * Seed real, joinable demo campaigns.
 *
 * The landing marketplace shows in-memory placeholder cards when the database
 * has no active campaigns. Those placeholders can't be joined — a
 * `campaign_applications` row needs a real `campaigns` row to point at. This
 * script creates a small set of demo brands (auth users + brand_profiles) and
 * publishes one active campaign for each, so creators can actually join them
 * from the marketplace modal and see them on their dashboard.
 *
 * Usage:
 *   npm run seed          # create/refresh demo campaigns (idempotent)
 *   npm run seed:reset    # delete the demo brands and their campaigns
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (service role) in
 * .env.local — the service key bypasses RLS and can use the auth admin API.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// --- minimal .env.local loader (tsx scripts don't auto-load it) ---
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const i = trimmed.indexOf("=");
      const key = trimmed.slice(0, i).trim();
      const val = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // fall back to whatever is already in process.env
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const EMAIL_DOMAIN = "demo.sterz.test";

interface DemoCampaign {
  brand: string;
  title: string;
  description: string;
  guidelines: string;
  content_requirements: string;
  target_cpm: number;
  total_budget: number;
  spent_budget: number;
  platforms: string[];
  ends_at: string;
}

const CAMPAIGNS: DemoCampaign[] = [
  { brand: "Luminos Co.", title: "Summer Lifestyle Collection", description: "Show off our summer drop in everyday moments — beach, brunch, golden hour. Authentic lifestyle content that feels like you.", guidelines: "Keep it bright and natural. No heavy filters. Feature at least one product clearly.", content_requirements: "1 Reel or TikTok, 15–30s, product visible in first 3 seconds.", target_cpm: 2.5, total_budget: 4000, spent_budget: 800, platforms: ["instagram", "tiktok"], ends_at: "2026-08-31" },
  { brand: "AthleteX", title: "Peak Performance Q3", description: "Document a real training session using AthleteX gear. We want sweat, effort, and results.", guidelines: "Tag the workout type. Show the product in use, not just unboxing.", content_requirements: "1 YouTube short or TikTok, 30–60s.", target_cpm: 1.8, total_budget: 2500, spent_budget: 900, platforms: ["youtube", "tiktok"], ends_at: "2026-09-15" },
  { brand: "Velour Beauty", title: "Glow Season Campaign", description: "A get-ready-with-me featuring the Glow Season line. Soft, dewy, confident.", guidelines: "Daytime lighting preferred. Show application steps.", content_requirements: "1 Instagram Reel, 20–40s.", target_cpm: 3.0, total_budget: 3500, spent_budget: 200, platforms: ["instagram"], ends_at: "2026-07-20" },
  { brand: "NovaTech", title: "Tech Drop Fall 2026", description: "First-impressions review of our new device. Honest takes welcome — show the features that matter.", guidelines: "Cover at least two standout features. Screen-record where useful.", content_requirements: "1 YouTube video (2–5 min) or X thread with clip.", target_cpm: 3.5, total_budget: 4000, spent_budget: 1200, platforms: ["youtube", "x"], ends_at: "2026-11-30" },
  { brand: "Café Oro", title: "Morning Brew Launch", description: "Your morning ritual, our coffee. Cozy, slow, aesthetic.", guidelines: "Show the brewing process. Mention the flavor notes.", content_requirements: "1 Reel or TikTok, 15–30s.", target_cpm: 2.8, total_budget: 3500, spent_budget: 2000, platforms: ["instagram", "tiktok"], ends_at: "2026-08-15" },
  { brand: "Axis Collective", title: "Streetwear Drop Vol 3", description: "Style our Vol 3 pieces your way. Fit checks, transitions, street energy.", guidelines: "At least one full-outfit shot. Tag the pieces worn.", content_requirements: "1 TikTok, 15–30s, trending audio encouraged.", target_cpm: 3.2, total_budget: 4000, spent_budget: 500, platforms: ["tiktok", "instagram"], ends_at: "2026-07-30" },
  { brand: "Titan Gaming", title: "Pro Gamer Series", description: "Gameplay or setup tour featuring Titan gear. Show the performance edge.", guidelines: "Real gameplay footage. Mention specs that matter to gamers.", content_requirements: "1 YouTube video or TikTok, 30s+.", target_cpm: 4.0, total_budget: 4000, spent_budget: 1200, platforms: ["youtube", "tiktok", "x"], ends_at: "2026-12-15" },
  { brand: "GreenRoot", title: "Plant Based Revolution", description: "Cook something delicious with our plant-based range. Make veggies look irresistible.", guidelines: "Show the finished dish. Keep it appetizing and well-lit.", content_requirements: "1 Reel or short, 20–45s.", target_cpm: 2.0, total_budget: 3000, spent_budget: 1200, platforms: ["instagram", "youtube"], ends_at: "2026-10-20" },
  { brand: "Maison Noire", title: "Luxury Fragrance Edit", description: "An elevated, cinematic moment with our signature scent. Mood over message.", guidelines: "Premium aesthetic. Slow, intentional shots.", content_requirements: "1 Instagram Reel, 15–25s.", target_cpm: 4.0, total_budget: 4000, spent_budget: 1000, platforms: ["instagram"], ends_at: "2026-08-01" },
  { brand: "SweatLab", title: "Fitness App Challenge", description: "Take the 7-day SweatLab challenge on camera and share your progress.", guidelines: "Show the app screen at least once. Be real about the effort.", content_requirements: "1 TikTok or Reel, 30–60s.", target_cpm: 2.5, total_budget: 3500, spent_budget: 700, platforms: ["tiktok", "instagram"], ends_at: "2026-09-10" },
  { brand: "Wanderbound", title: "Explore With Us", description: "Take us along on your next trip. Wanderbound gear in the wild.", guidelines: "Show the destination and the gear in use.", content_requirements: "1 TikTok or Reel, 20–45s.", target_cpm: 2.0, total_budget: 3000, spent_budget: 500, platforms: ["tiktok", "instagram"], ends_at: "2026-09-30" },
  { brand: "SkyFrame", title: "Drone Photography", description: "Capture breathtaking aerials with SkyFrame. Show the world from above.", guidelines: "Highlight footage quality. A short before/after is a plus.", content_requirements: "1 YouTube short or Reel, 20–40s.", target_cpm: 2.8, total_budget: 3000, spent_budget: 600, platforms: ["youtube", "instagram"], ends_at: "2026-10-25" },
];

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function emailFor(brand: string): string {
  return `brand-${slug(brand)}@${EMAIL_DOMAIN}`;
}

/** Build an email → user id map across all auth pages. */
async function loadUserMap(sb: SupabaseClient): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) if (u.email) map.set(u.email.toLowerCase(), u.id);
    if (data.users.length < 200) break;
  }
  return map;
}

async function ensureBrand(
  sb: SupabaseClient,
  userMap: Map<string, string>,
  brand: string,
): Promise<string> {
  const email = emailFor(brand);
  let userId = userMap.get(email.toLowerCase());

  if (!userId) {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { role: "brand", display_name: brand },
    });
    if (error || !data.user) throw error ?? new Error("createUser returned no user");
    userId = data.user.id;
    userMap.set(email.toLowerCase(), userId);
  }

  // The handle_new_user trigger creates the profile; ensure the brand_profile.
  await sb.from("brand_profiles").upsert({ id: userId, company_name: brand });
  return userId;
}

async function seed() {
  const sb = createClient(URL!, KEY!, { auth: { persistSession: false } });
  const userMap = await loadUserMap(sb);

  let created = 0;
  let skipped = 0;
  for (const c of CAMPAIGNS) {
    const brandId = await ensureBrand(sb, userMap, c.brand);

    const { data: existing } = await sb
      .from("campaigns")
      .select("id")
      .eq("brand_id", brandId)
      .eq("title", c.title)
      .maybeSingle();

    if (existing) {
      // Keep it active in case it was paused/edited.
      await sb.from("campaigns").update({ status: "active" }).eq("id", existing.id);
      skipped++;
      continue;
    }

    const { error } = await sb.from("campaigns").insert({
      brand_id: brandId,
      title: c.title,
      description: c.description,
      guidelines: c.guidelines,
      content_requirements: c.content_requirements,
      target_cpm: c.target_cpm,
      total_budget: c.total_budget,
      spent_budget: c.spent_budget,
      platforms: c.platforms,
      status: "active",
      starts_at: new Date().toISOString(),
      ends_at: new Date(c.ends_at).toISOString(),
    });
    if (error) throw error;
    created++;
  }

  console.log(`✓ Seed complete — ${created} created, ${skipped} already present (${CAMPAIGNS.length} total demo campaigns active).`);
}

async function reset() {
  const sb = createClient(URL!, KEY!, { auth: { persistSession: false } });
  const userMap = await loadUserMap(sb);
  let deleted = 0;
  for (const c of CAMPAIGNS) {
    const id = userMap.get(emailFor(c.brand).toLowerCase());
    if (!id) continue;
    // Deleting the auth user cascades to profile → brand_profile → campaigns
    // → applications.
    const { error } = await sb.auth.admin.deleteUser(id);
    if (!error) deleted++;
    userMap.delete(emailFor(c.brand).toLowerCase());
  }
  console.log(`✓ Reset complete — removed ${deleted} demo brand(s) and their campaigns.`);
}

const isReset = process.argv.includes("--reset");
(isReset ? reset() : seed()).catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});

import { createClient } from "@/lib/supabase/server";
import { CampaignBrowser, type BrowserCampaign } from "./campaign-browser";

export default async function CreatorCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, description, platforms, categories, target_cpm, total_budget, spent_budget")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // The niches this creator picked at onboarding — used to pre-set the filter.
  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("niche")
    .eq("id", user!.id)
    .single();

  // Which campaigns this creator has already applied to.
  const { data: applications } = await supabase
    .from("campaign_applications")
    .select("campaign_id, status")
    .eq("creator_id", user!.id);

  const appliedStatus: Record<string, string> = Object.fromEntries(
    (applications ?? []).map((a) => [a.campaign_id, a.status]),
  );

  const browserCampaigns: BrowserCampaign[] = (campaigns ?? []).map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    platforms: (c.platforms as string[]) ?? [],
    categories: (c.categories as string[]) ?? [],
    target_cpm: Number(c.target_cpm),
    total_budget: Number(c.total_budget),
    spent_budget: Number(c.spent_budget),
  }));

  return (
    <CampaignBrowser
      campaigns={browserCampaigns}
      appliedStatus={appliedStatus}
      creatorNiches={(creatorProfile?.niche as string[] | null) ?? []}
    />
  );
}

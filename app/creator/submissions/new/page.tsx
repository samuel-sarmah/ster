import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewSubmissionForm } from "./new-submission-form";

export default async function NewSubmissionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Approved campaigns for this creator
  const { data: approvedApps } = await supabase
    .from("campaign_applications")
    .select(`
      campaign_id,
      campaigns!inner(id, title, platforms, target_cpm)
    `)
    .eq("creator_id", user.id)
    .eq("status", "approved");

  // Creator's linked social accounts
  const { data: socialAccounts } = await supabase
    .from("social_accounts")
    .select("id, platform, handle")
    .eq("creator_id", user.id)
    .eq("is_active", true);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Submit a post</h1>
      <NewSubmissionForm
        approvedCampaigns={(approvedApps ?? []).map((a: any) => a.campaigns)}
        socialAccounts={socialAccounts ?? []}
      />
    </div>
  );
}

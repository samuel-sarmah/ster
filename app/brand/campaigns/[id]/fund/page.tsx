import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EscrowCheckout } from "./escrow-checkout";

export default async function FundCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, total_budget, status, brand_id")
    .eq("id", id)
    .single();

  if (!campaign || campaign.brand_id !== user?.id) notFound();

  if (campaign.status !== "draft") {
    return (
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Campaign already funded</h1>
        <p className="text-muted-foreground">
          This campaign has status <strong>{campaign.status}</strong> and is already active.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fund campaign</h1>
        <p className="text-muted-foreground mt-1">
          Deposit ${Number(campaign.total_budget).toLocaleString()} into escrow to activate{" "}
          <strong>{campaign.title}</strong>.
        </p>
      </div>
      <EscrowCheckout campaignId={campaign.id} totalBudget={Number(campaign.total_budget)} />
    </div>
  );
}

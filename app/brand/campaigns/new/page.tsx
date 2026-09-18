import { CampaignWizard } from "@/components/campaign-wizard";

export default function NewCampaignPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-[-0.025em] mb-6">New campaign</h1>
      <CampaignWizard />
    </div>
  );
}

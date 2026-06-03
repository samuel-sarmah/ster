import { CampaignWizard } from "@/components/campaign-wizard";

export default function NewCampaignPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">New campaign</h1>
      <CampaignWizard />
    </div>
  );
}

import { DeleteAccountSection } from "@/components/settings/delete-account";

export default function CreatorAccountSettingsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Account settings</h1>
      <DeleteAccountSection />
    </div>
  );
}

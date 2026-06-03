"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Campaign {
  id: string;
  title: string;
  platforms: string[];
  target_cpm: number;
}

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
}

export function NewSubmissionForm({
  approvedCampaigns,
  socialAccounts,
}: {
  approvedCampaigns: Campaign[];
  socialAccounts: SocialAccount[];
}) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState("");
  const [socialAccountId, setSocialAccountId] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCampaign = approvedCampaigns.find((c) => c.id === campaignId);

  const compatibleAccounts = selectedCampaign
    ? socialAccounts.filter((sa) =>
        selectedCampaign.platforms.includes(sa.platform)
      )
    : socialAccounts;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: campaignId,
        social_account_id: socialAccountId,
        post_url: postUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to submit");
      setLoading(false);
      return;
    }

    router.push("/creator/submissions");
  }

  if (approvedCampaigns.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg">
        You have no approved campaign applications yet.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="campaign">Campaign</Label>
        <select
          id="campaign"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={campaignId}
          onChange={(e) => { setCampaignId(e.target.value); setSocialAccountId(""); }}
          required
        >
          <option value="">Select a campaign…</option>
          {approvedCampaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} — ${Number(c.target_cpm).toFixed(2)} CPM
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="socialAccount">Social account</Label>
        <select
          id="socialAccount"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={socialAccountId}
          onChange={(e) => setSocialAccountId(e.target.value)}
          required
          disabled={!campaignId}
        >
          <option value="">Select account…</option>
          {compatibleAccounts.map((sa) => (
            <option key={sa.id} value={sa.id}>
              {sa.platform} — @{sa.handle}
            </option>
          ))}
        </select>
        {compatibleAccounts.length === 0 && campaignId && (
          <p className="text-xs text-muted-foreground">
            No linked accounts for this campaign&apos;s platforms.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="postUrl">Post URL</Label>
        <Input
          id="postUrl"
          type="url"
          placeholder="https://www.tiktok.com/@handle/video/..."
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading || !campaignId || !socialAccountId}>
        {loading ? "Submitting…" : "Submit post"}
      </Button>
    </form>
  );
}

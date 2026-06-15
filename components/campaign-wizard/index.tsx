"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Platform } from "@/lib/supabase/types";

type Step = "basics" | "guidelines" | "platforms" | "budget" | "review";
const STEPS: Step[] = ["basics", "guidelines", "platforms", "budget", "review"];
const STEP_LABELS: Record<Step, string> = {
  basics: "Basics",
  guidelines: "Guidelines",
  platforms: "Platforms",
  budget: "Budget",
  review: "Review",
};

const ALL_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "x"];

interface FormData {
  title: string;
  description: string;
  guidelines: string;
  content_requirements: string;
  platforms: Platform[];
  target_cpm: string;
  total_budget: string;
  starts_at: string;
  ends_at: string;
}

const EMPTY: FormData = {
  title: "",
  description: "",
  guidelines: "",
  content_requirements: "",
  platforms: [],
  target_cpm: "",
  total_budget: "",
  starts_at: "",
  ends_at: "",
};

export function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePlatform(p: Platform) {
    set(
      "platforms",
      form.platforms.includes(p)
        ? form.platforms.filter((x) => x !== p)
        : [...form.platforms, p]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        target_cpm: parseFloat(form.target_cpm),
        total_budget: parseFloat(form.total_budget),
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to create campaign");
      setLoading(false);
      return;
    }

    router.push(`/brand/campaigns/${data.id}/fund`);
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= stepIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="text-sm text-muted-foreground">{STEP_LABELS[step]}</div>

      {step === "basics" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign title</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Summer launch campaign"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell creators about this campaign…"
            />
          </div>
        </div>
      )}

      {step === "guidelines" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Creator guidelines</Label>
            <textarea
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.guidelines}
              onChange={(e) => set("guidelines", e.target.value)}
              placeholder="How should creators integrate your product…"
            />
          </div>
          <div className="space-y-2">
            <Label>Content requirements</Label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.content_requirements}
              onChange={(e) => set("content_requirements", e.target.value)}
              placeholder="Minimum duration, hashtags, disclosures…"
            />
          </div>
        </div>
      )}

      {step === "platforms" && (
        <div className="space-y-4">
          <Label>Allowed platforms</Label>
          <div className="grid grid-cols-2 gap-3">
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`rounded-lg border p-4 text-left capitalize transition-colors ${
                  form.platforms.includes(p)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "budget" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target CPM ($ per 1,000 verified views)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                type="number"
                min={0.01}
                max={4}
                step={0.01}
                className="pl-7"
                value={form.target_cpm}
                onChange={(e) => set("target_cpm", e.target.value)}
                placeholder="2.50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Total budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                type="number"
                min={100}
                step={1}
                className="pl-7"
                value={form.total_budget}
                onChange={(e) => set("total_budget", e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start date (optional)</Label>
              <Input
                type="date"
                value={form.starts_at}
                onChange={(e) => set("starts_at", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End date (optional)</Label>
              <Input
                type="date"
                value={form.ends_at}
                onChange={(e) => set("ends_at", e.target.value)}
              />
            </div>
          </div>
          {form.target_cpm && form.total_budget && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Max views: </span>
                {((parseFloat(form.total_budget) / parseFloat(form.target_cpm)) * 1000).toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">CPM: </span>
                ${parseFloat(form.target_cpm).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4 text-sm">
          <div className="border rounded-lg divide-y">
            {[
              ["Title", form.title],
              ["Description", form.description],
              ["Platforms", form.platforms.join(", ")],
              ["Target CPM", `$${parseFloat(form.target_cpm || "0").toFixed(2)}`],
              ["Total budget", `$${parseFloat(form.total_budget || "0").toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="p-3 flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value || "—"}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            After creation you&apos;ll be taken to deposit the escrow budget via Stripe.
            The campaign goes live once payment succeeds.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={stepIndex === 0}
          onClick={() => setStep(STEPS[stepIndex - 1])}
        >
          Back
        </Button>
        {step !== "review" ? (
          <Button
            onClick={() => setStep(STEPS[stepIndex + 1])}
            disabled={
              (step === "basics" && !form.title) ||
              (step === "platforms" && form.platforms.length === 0) ||
              (step === "budget" && (!form.target_cpm || !form.total_budget))
            }
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create campaign"}
          </Button>
        )}
      </div>
    </div>
  );
}

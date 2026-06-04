"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/lib/supabase/types";

const NICHES = ["Lifestyle", "Gaming", "Fashion", "Tech", "Food", "Travel", "Fitness", "Beauty", "Finance", "Education"];

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brand fields
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");

  // Creator fields
  const [bio, setBio] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setRole((user.user_metadata?.role as UserRole) ?? "creator");
      setCompanyName(user.user_metadata?.display_name ?? "");
    });
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function toggleNiche(niche: string) {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !role) return;
    setLoading(true);
    setError(null);

    const body =
      role === "brand"
        ? { role, company_name: companyName, website, industry }
        : { role, bio, niche: selectedNiches };

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/${role}/dashboard`);
  }

  if (!role) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b sm:px-6">
        <Link href="/" className="font-semibold tracking-tight hover:text-primary transition-colors">
          Sterclip
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Log out
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Complete your profile</CardTitle>
              <CardDescription>
                {role === "brand"
                  ? "Tell creators about your brand"
                  : "Tell brands what you create"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {role === "brand" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g. Fashion, Tech, Food"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Tell brands about yourself…"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content niches</Label>
                      <div className="flex flex-wrap gap-2">
                        {NICHES.map((niche) => (
                          <button
                            key={niche}
                            type="button"
                            onClick={() => toggleNiche(niche)}
                            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                              selectedNiches.includes(niche)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-muted-foreground/50"
                            }`}
                          >
                            {niche}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving…" : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

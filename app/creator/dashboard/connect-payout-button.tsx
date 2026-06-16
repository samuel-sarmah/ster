"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConnectPayoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start payout setup");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start payout setup");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting…" : "Set up payouts"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

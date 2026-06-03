"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function EscrowCheckout({
  campaignId,
  totalBudget,
}: {
  campaignId: string;
  totalBudget: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeposit() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/escrow/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: campaignId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to initiate payment");
      setLoading(false);
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) { setError("Stripe failed to load"); setLoading(false); return; }

    const { error: stripeError } = await stripe.confirmPayment({
      clientSecret: data.client_secret,
      confirmParams: {
        return_url: `${window.location.origin}/brand/campaigns/${campaignId}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Escrow deposit</span>
          <span className="font-medium">${totalBudget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Platform fee</span>
          <span className="font-medium">Included</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>${totalBudget.toLocaleString()}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Funds are held in escrow and released to creators as views are verified.
        Unused budget is refunded when the campaign closes.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleDeposit} disabled={loading} className="w-full">
        {loading ? "Redirecting…" : `Deposit $${totalBudget.toLocaleString()}`}
      </Button>
    </div>
  );
}

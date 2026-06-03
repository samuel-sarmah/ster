import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const campaignId = pi.metadata.campaign_id;
    if (!campaignId) return NextResponse.json({ ok: true });

    await supabase
      .from("campaigns")
      .update({ status: "active" })
      .eq("stripe_payment_intent_id", pi.id)
      .eq("status", "draft");
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const campaignId = pi.metadata.campaign_id;
    if (!campaignId) return NextResponse.json({ ok: true });

    // Clear payment intent so brand can retry
    await supabase
      .from("campaigns")
      .update({ stripe_payment_intent_id: null })
      .eq("id", campaignId);
  }

  return NextResponse.json({ ok: true });
}

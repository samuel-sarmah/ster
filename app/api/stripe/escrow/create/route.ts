import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaign_id } = await request.json();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, total_budget, status, brand_id")
    .eq("id", campaign_id)
    .single();

  if (!campaign || campaign.brand_id !== user.id) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "draft") {
    return NextResponse.json({ error: "Campaign already funded" }, { status: 400 });
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(campaign.total_budget) * 100),
    currency: "usd",
    customer: customerId,
    metadata: { campaign_id: campaign.id, brand_id: user.id },
    description: `Sterclip escrow — ${campaign.title}`,
    automatic_payment_methods: { enabled: true },
  });

  await supabase
    .from("campaigns")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", campaign.id);

  return NextResponse.json({ client_secret: paymentIntent.client_secret });
}

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { serverError } from "@/lib/api/error-response";

export async function POST() {
  const stripe = getStripeClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, stripe_account_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creator") {
    return NextResponse.json({ error: "Only creators can set up payout accounts" }, { status: 403 });
  }

  let accountId = profile?.stripe_account_id;

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      accountId = account.id;

      await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/settings/socials`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/dashboard`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    return serverError(error, "stripe.connect.create");
  }
}

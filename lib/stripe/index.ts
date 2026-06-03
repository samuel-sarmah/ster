import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });

  return stripeClient;
}

export async function createEscrowPaymentIntent({
  amountUsd,
  campaignId,
  customerId,
}: {
  amountUsd: number;
  campaignId: string;
  customerId: string;
}) {
  const stripe = getStripeClient();
  return stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100), // cents
    currency: "usd",
    customer: customerId,
    metadata: { campaign_id: campaignId },
    description: `Sterclip escrow deposit for campaign ${campaignId}`,
    automatic_payment_methods: { enabled: true },
  });
}

export async function refundPaymentIntent(
  paymentIntentId: string,
  amountCents: number
) {
  const stripe = getStripeClient();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
  });
}

export async function transferToCreator({
  amountUsd,
  stripeAccountId,
  submissionId,
}: {
  amountUsd: number;
  stripeAccountId: string;
  submissionId: string;
}) {
  const stripe = getStripeClient();
  return stripe.transfers.create({
    amount: Math.round(amountUsd * 100),
    currency: "usd",
    destination: stripeAccountId,
    metadata: { submission_id: submissionId },
  });
}

"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    title: "Starter",
    price: { monthly: 49, annually: 39 },
    description: "For teams launching their first creator campaign.",
    cta: "Get started",
    recommended: false,
    features: [
      "3 active campaigns",
      "Up to 250k verified views/mo",
      "Creator payout automation",
      "Escrow campaign creation",
      "Creator onboarding tools",
      "Standard support",
    ],
  },
  {
    title: "Growth",
    price: { monthly: 149, annually: 129 },
    description: "For growing teams scaling across multiple channels.",
    cta: "Get started",
    recommended: false,
    features: [
      "15 active campaigns",
      "Up to 2M verified views/mo",
      "Creator submission moderation",
      "Creator payout automation",
      "Multi-channel support",
      "Priority support",
    ],
  },
  {
    title: "Scale",
    price: { monthly: 399, annually: 349 },
    description: "For high-volume brands with automation requirements.",
    cta: "Get started",
    recommended: true,
    features: [
      "50 active campaigns",
      "Up to 10M verified views/mo",
      "Verification automation",
      "Payout readiness controls",
      "Custom compliance (add-on)",
      "Dedicated account manager",
    ],
  },
  {
    title: "Enterprise",
    price: { monthly: null, annually: null },
    description: "Custom rollout with policy and compliance workflows.",
    cta: "Talk to us",
    recommended: false,
    features: [
      "Unlimited campaigns",
      "Custom verified view volume",
      "Custom compliance workflow",
      "Dedicated migration support",
      "SSO & policy controls",
      "SLA-backed support",
    ],
  },
];

interface Pricing11Props {
  className?: string;
}

const Pricing11 = ({ className }: Pricing11Props) => {
  const [billing, setBilling] = useState<"monthly" | "annually">("monthly");

  return (
    <section className={cn("section-padding border-t border-border/60", className)}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl lg:text-5xl">
              Simple, transparent plans
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground lg:text-lg">
              Choose a plan that matches your campaign volume and verification requirements. No hidden fees.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
                billing === "monthly"
                  ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annually")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
                billing === "annually"
                  ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annually
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-soft-hover)]",
                plan.recommended
                  ? "border-foreground/40 shadow-[var(--shadow-soft)]"
                  : "border-border/60"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-background">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">{plan.title}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  {plan.price[billing] !== null ? (
                    <>
                      <span className="text-4xl font-extrabold tracking-[-0.03em] text-foreground">
                        ${plan.price[billing]}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">
                      Custom
                    </span>
                  )}
                </div>
                {billing === "annually" && plan.price.annually !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Billed ${(plan.price.annually * 12).toLocaleString()}/year
                  </p>
                )}
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <Button
                className="mb-6 w-full rounded-xl"
                variant={plan.recommended ? "default" : "outline"}
                render={<a href="/signup" />}
                nativeButton={false}
              >
                {plan.cta}
              </Button>

              <ul className="mt-auto space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-foreground/70" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Enterprise plans include custom onboarding, SSO, dedicated migration support, and policy controls.{" "}
          <a href="/#contact" className="underline underline-offset-2 hover:text-foreground">
            Talk to us
          </a>
        </p>
      </div>
    </section>
  );
};

export { Pricing11 };

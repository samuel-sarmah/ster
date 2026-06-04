"use client";

import { Check, ChevronDown, Info, X } from "lucide-react";
import { Fragment, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const plans = [
  {
    title: "Starter",
    price: { monthly: "$49", annually: "$39" },
    href: "#",
    recommended: false,
  },
  {
    title: "Growth",
    price: { monthly: "$149", annually: "$129" },
    href: "#",
    recommended: false,
  },
  {
    title: "Scale",
    price: { monthly: "$399", annually: "$349" },
    href: "#",
    recommended: true,
  },
  {
    title: "Enterprise",
    price: { monthly: "Custom", annually: "Custom" },
    href: "#",
    recommended: false,
  },
];

const featureMatrix = [
  {
    title: "Overview",
    features: [
      {
        title: "Core workflow",
        inclusions: [
          {
            plan: "Starter",
            content: "Escrow campaign creation and creator onboarding",
          },
          {
            plan: "Growth",
            content: "Escrow workflows plus creator submission moderation",
          },
          {
            plan: "Scale",
            content: "Verification automation and payout readiness controls",
          },
          {
            plan: "Enterprise",
            content: "Custom rollout with policy and compliance workflows",
          },
        ],
      },
      {
        title: "Active campaigns",
        info: "Total campaigns that can run at the same time.",
        inclusions: [
          { plan: "Starter", content: "3" },
          { plan: "Growth", content: "15" },
          { plan: "Scale", content: "50" },
          { plan: "Enterprise", content: "Unlimited" },
        ],
      },
      {
        title: "Monthly verified views",
        info: "View verification volume before overage pricing.",
        inclusions: [
          { plan: "Starter", content: "Up to 250k" },
          { plan: "Growth", content: "Up to 2M" },
          { plan: "Scale", content: "Up to 10M" },
          { plan: "Enterprise", content: "Custom" },
        ],
      },
    ],
  },
  {
    title: "Other features",
    features: [
      {
        title: "Creator payout automation",
        inclusions: [
          {
            plan: "Starter",
            content: <Check className="size-4 lg:size-5" />,
          },
          {
            plan: "Growth",
            content: <Check className="size-4 lg:size-5" />,
          },
          {
            plan: "Scale",
            content: <Check className="size-4 lg:size-5" />,
          },
          {
            plan: "Enterprise",
            content: <Check className="size-4 lg:size-5" />,
          },
        ],
      },
      {
        title: "Dedicated migration support",
        info: "Assistance onboarding brands and creators into Sterclip.",
        inclusions: [
          {
            plan: "Starter",
            content: <X className="size-4 text-muted-foreground lg:size-5" />,
          },
          {
            plan: "Growth",
            content: <X className="size-4 text-muted-foreground lg:size-5" />,
          },
          {
            plan: "Scale",
            content: <X className="size-4 text-muted-foreground lg:size-5" />,
          },
          {
            plan: "Enterprise",
            content: <Check className="size-5" />,
          },
        ],
      },
      {
        title: "Custom compliance workflow",
        info: "Rule-based approval and settlement constraints.",
        inclusions: [
          {
            plan: "Starter",
            content: <X className="size-4 text-muted-foreground lg:size-5" />,
          },
          {
            plan: "Growth",
            content: <X className="size-4 text-muted-foreground lg:size-5" />,
          },
          {
            plan: "Scale",
            content: <Badge>Add-on</Badge>,
          },
          {
            plan: "Enterprise",
            content: <Badge>Add-on</Badge>,
          },
        ],
      },
    ],
  },
];

interface Pricing11Props {
  className?: string;
}

const Pricing11 = ({ className }: Pricing11Props) => {
  const [billing, setBilling] = useState<"monthly" | "annually">("monthly");
  return (
    <section className={cn("section-padding", className)}>
      <div className="container mb-8 lg:mb-0">
        <div className="grid grid-cols-2 gap-y-12 md:gap-y-16">
          <div className="col-span-2 flex flex-col lg:col-span-1">
            <h2 className="my-6 text-3xl font-bold text-pretty tracking-[-0.02em] md:text-4xl xl:text-5xl">
              Sterclip Pricing
            </h2>
            <p className="max-w-xl text-muted-foreground lg:text-lg lg:leading-8">
              Choose a plan that matches your campaign volume and verification requirements.
            </p>
          </div>
        </div>
        <div className="lg:sticky lg:top-20">
          <div className="mb-8 pt-8">
            <div className="grid grid-cols-2 items-end gap-4 rounded-2xl border border-border/90 bg-card/80 p-4 shadow-[var(--shadow-soft)] lg:grid-cols-6 lg:gap-6 lg:p-6">
              <div className="col-span-2">
                <div className="flex h-full flex-col justify-end">
                  <span className="mb-2 text-xs font-medium text-muted-foreground">
                    Billing
                  </span>
                  <Tabs
                    value={billing}
                    onValueChange={setBilling as (value: string) => void}
                  >
                    <TabsList>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="annually">Annually</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  className={cn(
                    "rounded-xl border border-border/90 bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] 2xl:p-4",
                    plan.recommended && "border-primary/40 ring-1 ring-primary/20"
                  )}
                >
                  <h3 className="mb-1 text-xl font-semibold xl:text-2xl">
                    {plan.title}
                  </h3>
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    {plan.price[billing]}
                    <span className="hidden 2xl:inline"> / month</span>
                  </p>
                  <Button
                    variant={plan.recommended ? "default" : "outline"}
                    className="w-full"
                  >
                    <span className="2xl:hidden">Choose plan</span>
                    <span className="hidden 2xl:inline">Start with {plan.title}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-8 lg:space-y-14">
          {featureMatrix.map((category) => (
            <div key={category.title}>
              <h3 className="mb-6 text-lg font-semibold lg:mb-3">
                {category.title}
              </h3>
              <div className="space-y-4 lg:space-y-0">
                <TooltipProvider>
                  {category.features.map((feature) => (
                    <Fragment key={feature.title}>
                      <dl className="hidden grid-cols-6 gap-6 border-b border-border/80 lg:grid">
                        <dt className="col-span-2 justify-between py-4 pb-4">
                          <Tooltip>
                            <h4 className="group flex min-h-6 items-center gap-x-1 font-medium">
                              {feature.title}{" "}
                              {feature.info && (
                                <TooltipTrigger render={<Info className="ml-2 size-4 cursor-pointer text-muted-foreground group-hover:text-accent-foreground" />}></TooltipTrigger>
                              )}
                            </h4>
                            {feature.info && (
                              <TooltipContent>{feature.info}</TooltipContent>
                            )}
                          </Tooltip>
                        </dt>
                        {feature.inclusions.map((inclusion) => (
                          <dd
                            key={inclusion.plan}
                            className="hidden py-4 text-sm text-muted-foreground lg:block"
                          >
                            {inclusion.content}
                          </dd>
                        ))}
                      </dl>
                      <Collapsible
                        className="group lg:hidden"
                        defaultOpen={false}
                      >
                        <dl
                          key={feature.title}
                          className="rounded-lg border-b border-border/80"
                        >
                          <CollapsibleTrigger className="w-full">
                            <dt className="flex items-center justify-between pb-4">
                              <Tooltip>
                                <TooltipTrigger render={<h4 className="group flex items-center gap-x-1 text-sm font-medium md:text-base" />}>{feature.title}{feature.info && (
                                                                                    <Info className="ml-2 size-4 cursor-pointer text-muted-foreground group-hover:text-accent-foreground" />
                                                                                  )}</TooltipTrigger>
                                {feature.info && (
                                  <TooltipContent>
                                    {feature.info}
                                  </TooltipContent>
                                )}
                              </Tooltip>

                              <ChevronDown className='size-5 transition-transform group-data-[state="open"]:rotate-180' />
                            </dt>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            {feature.inclusions.map((inclusion) => (
                              <dd
                                key={inclusion.plan}
                                className="flex items-center border-b border-border/70 py-3 text-xs text-muted-foreground last:border-b-0 md:py-3.5"
                              >
                                <div className="w-1/2 md:w-1/4">
                                  {inclusion.plan}
                                </div>
                                {inclusion.content}
                              </dd>
                            ))}
                          </CollapsibleContent>
                        </dl>
                      </Collapsible>
                    </Fragment>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 hidden text-xs text-muted-foreground md:block">
          * Enterprise plans include custom onboarding, SSO, and policy controls.
        </p>
      </div>
    </section>
  );
};

export { Pricing11 };

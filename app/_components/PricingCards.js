"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { selectOrganizationSubscriptionPlan } from "@/app/_lib/action";

// -- Helpers Restored --

function formatPrice(amount, currency = "NGN") {
  if (amount == null) return "$0";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function buildFeatures(plan) {
  const items = [];
  if (Number(plan?.maxOrganizations) > 0)
    items.push(`${plan.maxOrganizations} organization${plan.maxOrganizations === 1 ? "" : "s"}`);
  if (Number(plan?.maxProperties) > 0)
    items.push(`${plan.maxProperties} propert${plan.maxProperties === 1 ? "y" : "ies"}`);
  if (Number(plan?.maxBuildings) > 0)
    items.push(`${plan.maxBuildings} building${plan.maxBuildings === 1 ? "" : "s"}`);
  if (Number(plan?.maxUnits) > 0)
    items.push(`${plan.maxUnits} unit${plan.maxUnits === 1 ? "" : "s"}`);
    
  if (items.length === 0) items.push("Full platform access");
  items.push("Priority customer support");
  items.push("Advanced analytics");
  
  return items;
}

// -- Component --

export default function PricingCards({ plans, selectedPlan, returnTo, canClaimTrial }) {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="w-full">
      {/* Interactive Toggle */}
      <div className="mb-12 flex items-center justify-center gap-4 text-sm font-semibold">
        <span 
          className={`transition-colors duration-200 ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-400"}`}
        >
          Bill Monthly
        </span>
        
        <button
          type="button"
          role="switch"
          aria-checked={billingCycle === "yearly"}
          onClick={() => setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
          className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-primary/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-primary shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
              billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        
        <div className="flex items-center gap-2">
          <span 
            className={`transition-colors duration-200 ${billingCycle === "yearly" ? "text-gray-900" : "text-gray-400"}`}
          >
            Bill Yearly
          </span>
          
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid w-full max-w-5xl mx-auto gap-6 md:grid-cols-3 lg:gap-8">
        {plans.map((plan, index) => {
          const { id, name, planType, currency, monthlyPrice, yearlyPrice, quarterlyPrice } = plan;
          const selected = selectedPlan === id;
          const isPopular = planType === "PREMIUM" || planType === "STANDARD" || (plans.length === 3 && index === 1);
          
          // Determine price based on toggle state
          let priceToShow = monthlyPrice;
          let intervalLabel = "/ Month";
          
          if (billingCycle === "yearly") {
            priceToShow = yearlyPrice;
            intervalLabel = "/ Year";
          } else if (billingCycle === "quarterly" && quarterlyPrice) {
            priceToShow = quarterlyPrice;
            intervalLabel = "/ Quarter";
          }

          const features = buildFeatures(plan);

          return (
            <article
              key={id}
              className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all duration-200 ${
                isPopular 
                  ? "ring-2 ring-primary shadow-xl shadow-primary/10" 
                  : "ring-gray-200 hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div className={`relative px-8 pb-10 pt-8 ${isPopular ? "bg-primary" : "bg-[#2B303B]"}`}>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">{name}</h2>
                  {isPopular && (
                    <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {priceToShow && Number(priceToShow) > 0 
                      ? formatPrice(priceToShow, currency) 
                      : "Free"}
                  </span>
                  <span className="ml-2 text-sm font-medium text-white/70">{intervalLabel}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col px-8 pb-8 pt-8">
                <ul className="flex-1 space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 
                        className={`h-5 w-5 shrink-0 ${isPopular ? "text-primary" : "text-gray-400"}`} 
                        strokeWidth={2}
                      />
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <form action={selectOrganizationSubscriptionPlan} className="mt-8">
                  <input type="hidden" name="planId" value={id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="billingCycle" value={billingCycle} />
                  
                  <button
                    type="submit"
                    className={`w-full rounded-full px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      isPopular
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-blue-50 text-primary hover:bg-blue-100"
                    }`}
                  >
                    {selected ? "Selected" : canClaimTrial ? "Start Free Trial" : "Purchase Plan"}
                  </button>
                </form>
                
                {canClaimTrial && !selected && (
                  <p className="mt-3 text-center text-[11px] font-medium text-gray-400">
                    7 days free, cancel anytime
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
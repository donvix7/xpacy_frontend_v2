import Link from "next/link";
import { Check, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { getSubscriptionList, getTrialPlans } from "../_lib/data-services"; // Import getTrial
import PricingCards from "./PricingCards";

function normalizePlans(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.plans)) return payload.data.plans;
  if (Array.isArray(payload?.plans)) return payload.plans;
  return [];
}

export default async function OrganizationSubscriptionPlans({
  returnTo,
  selectedPlan,
  showBackToDashboard = false,
  hasError = false,
}) {
  // Fetch both plans and trial status concurrently
  const [rawPlans, trialData] = await Promise.all([
    getSubscriptionList(),
    getTrialPlans(), 
  ]);

  const plans = normalizePlans(rawPlans).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const selectedPlanName = plans.find((p) => p.id === selectedPlan)?.name;
  
  // Safely extract the trial flag (fallback to false if the API fails or returns null)
  const canClaimTrial = trialData?.canClaimTrial ?? false;

  if (plans.length === 0) {
    // ... (keep empty state as is) ...
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <CreditCard className="h-3.5 w-3.5" /> Organization plans
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
          Choose the plan that fits your team
        </h1>
        {/* Dynamic Subtitle based on trial eligibility */}
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
          {canClaimTrial 
            ? "Start your 7-day free trial today. No credit card required." 
            : "Your organization details stay saved. Change or upgrade your plan anytime."}
        </p>
      </div>

      {/* ... (keep error and selected banners) ... */}

      {/* Render the Client Component with Data */}
      <PricingCards 
        plans={plans} 
        selectedPlan={selectedPlan} 
        returnTo={returnTo} 
        canClaimTrial={canClaimTrial} // Pass the flag down
      />

      {/* Footer - Plan Selection Note */}
      <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6 max-w-5xl mx-auto">
        <h2 className="font-bold text-primary flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> About plan selection
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {canClaimTrial 
            ? "You are eligible for a 7-day free trial. Selecting a plan will start your trial, and you will not be charged until it ends."
            : "Selecting a plan saves your choice and returns you to organization setup. Online payment checkout is not connected yet, so this step records your plan choice and does not charge you."}
        </p>
      </div>

      {/* ... (keep footer navigation) ... */}
    </main>
  );
}
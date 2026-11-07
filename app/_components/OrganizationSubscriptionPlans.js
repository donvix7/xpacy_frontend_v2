import Link from "next/link";
import { Check, CreditCard, Building2, Sparkles, Users } from "lucide-react";
import { selectOrganizationSubscriptionPlan } from "@/app/_lib/action";

const plans = [
  {
    id: "core",
    name: "Core",
    summary: "A clear starting point for organizing your property business.",
    icon: Building2,
    features: ["Organization profile", "Property and listing management", "Booking overview"],
  },
  {
    id: "growth",
    name: "Growth",
    summary: "For teams managing a growing portfolio and daily operations.",
    icon: Users,
    featured: true,
    features: ["Everything in Core", "Manager collaboration", "Multi-property operations"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary: "A flexible option for larger or more complex organizations.",
    icon: Sparkles,
    features: ["Everything in Growth", "Organization-level insights", "Tailored onboarding"],
  },
];

export default function OrganizationSubscriptionPlans({ returnTo, selectedPlan, showBackToDashboard = false, hasError = false }) {
  const selectedPlanName = plans.find((plan) => plan.id === selectedPlan)?.name;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-9 text-white shadow-lg sm:px-10 sm:py-12">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-100">
            <CreditCard className="h-4 w-4" /> Organization plans
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Choose a plan to set up your organization</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Select the plan that fits your team. Your organization details stay saved while you choose.
          </p>
        </div>
      </section>

      {hasError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Choose one of the available plans to continue.</p>}

      {selectedPlanName && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span className="font-bold">{selectedPlanName} is selected.</span> You can change your selection below.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map(({ id, name, summary, icon: Icon, featured, features }) => {
          const selected = selectedPlan === id;
          return (
            <article key={id} className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition ${selected ? "border-secondary ring-2 ring-secondary/30" : featured ? "border-primary" : "border-gray-200"}`}>
              {featured && <span className="absolute -top-3 right-5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary-900">Recommended</span>}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary"><Icon className="h-5 w-5" /></div>
              <h2 className="mt-5 text-xl font-bold text-primary">{name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-gray-600">{summary}</p>
              <div className="my-5 border-t border-gray-100" />
              <ul className="mb-7 flex-1 space-y-3 text-sm text-gray-700">
                {features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{feature}</li>)}
              </ul>
              <form action={selectOrganizationSubscriptionPlan}>
                <input type="hidden" name="planId" value={id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button type="submit" className={`w-full rounded-lg px-4 py-3 text-sm font-bold transition ${selected ? "border border-primary bg-primary-50 text-primary hover:bg-primary-100" : featured ? "bg-primary text-white hover:bg-primary-900" : "border border-primary text-primary hover:bg-primary-50"}`}>
                  {selected ? `Continue with ${name}` : `Choose ${name}`}
                </button>
              </form>
            </article>
          );
        })}
      </div>

      <section className="rounded-2xl border border-secondary/40 bg-secondary-100 p-5 sm:p-6">
        <h2 className="font-bold text-primary">About plan selection</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          Selecting a plan saves your choice and returns you to organization setup. Online payment checkout is not connected yet, so this step records your plan choice and does not charge you.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
        {showBackToDashboard && <Link href="/dashboard/user" className="text-sm font-semibold text-gray-600 hover:text-primary">Back to dashboard</Link>}
        <Link href={returnTo} className="ml-auto text-sm font-semibold text-primary hover:underline">Return to organization setup</Link>
      </div>
    </main>
  );
}

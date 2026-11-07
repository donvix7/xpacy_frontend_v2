"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import EmptyState from "../_components/EmptyState";
import SectionLayout from "../_components/SectionLayout";

import image1 from "@/public/image1.png";
import image2 from "@/public/image2.png";
import image3 from "@/public/image3.png";

/* -------------------------------------------------------------------------- */
/*                                  DATA                                      */
/* -------------------------------------------------------------------------- */
const comparisonFeatures = [
  ];

const includedFeatures = [
  
];

const testimonials = [

];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function ComparisonCell({ value }) {
  if (value === true) {
    return <span className="text-primary text-lg font-bold">✓</span>;
  }
  if (value === false) {
    return <span className="text-gray-300 text-lg">—</span>;
  }
  return (
    <span className="font-mono text-sm text-primary font-semibold">
      {value}
    </span>
  );
}

/**
 * Normalize whatever the API returns into the shape our UI expects.
 * Adjust the field mapping below to match your actual API response shape.
 */
function normalizePlans(rawPlans) {
  if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
    return [];
  }

  return rawPlans.map((p, idx) => ({
    name: p.name ?? p.title ?? `Plan ${idx + 1}`,
    tagline: p.tagline ?? p.description ?? "",
    monthly: p.monthly ?? p.priceMonthly ?? p.price ?? null,
    yearly: p.yearly ?? p.priceYearly ?? null,
    features: Array.isArray(p.features)
      ? p.features.map((f) => (typeof f === "string" ? f : f.name ?? ""))
      : [],
    cta: p.cta ?? (p.monthly == null ? "Talk to Sales" : "Start Free Trial"),
    highlight: p.highlight ?? p.isPopular ?? idx === 1,
  }));
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function SubscriptionClient({ subscriptionPlans, header, footer, faqSection }) {
  const [billing, setBilling] = useState("monthly");

  const plans = normalizePlans(subscriptionPlans);

  return (
    <>
      {header}
      <main>
        {/* ============================================================ */}
        {/* HERO: Value proposition + Billing toggle                    */}
        {/* ============================================================ */}
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-6 md:px-[7%] bg-gradient-to-b from-primary-50 to-white overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary font-mono text-sm font-semibold">
              Simple, Transparent Pricing
            </span>
            <h1 className="font-bold font-sans text-primary md:text-5xl text-3xl leading-tight tracking-tight">
              A Plan for Every Property Manager
            </h1>
            <p className="text-base md:text-lg font-mono text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Whether you manage 5 doors or 5,000, Xpacy grows with you. Pick
              the plan that fits your portfolio — upgrade or downgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span
                className={`font-mono text-sm font-semibold ${
                  billing === "monthly" ? "text-primary" : "text-gray-500"
                }`}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() =>
                  setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
                }
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                  billing === "yearly" ? "bg-primary" : "bg-gray-300"
                }`}
                aria-label="Toggle billing period"
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    billing === "yearly" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`font-mono text-sm font-semibold flex items-center gap-2 ${
                  billing === "yearly" ? "text-primary" : "text-gray-500"
                }`}
              >
                Yearly
             
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PLAN CARDS                                                   */}
        {/* ============================================================ */}
        <section className="py-16 md:py-24 px-6 md:px-[7%] max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="font-bold font-sans text-primary md:text-4xl text-3xl tracking-tight">
              Choose Your Plan
            </h2>
           
          </div>

          {plans.length === 0 ? (
            <EmptyState message="No subscription plans are available right now." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
              const price = billing === "monthly" ? plan.monthly : plan.yearly;
              const period = billing === "monthly" ? "/month" : "/year";

              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    plan.highlight
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                      : "bg-white border-primary-100 text-primary"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-primary-900 text-xs font-bold font-mono shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="font-bold font-sans text-2xl">
                      {plan.name}
                    </h3>
                    <p
                      className={`font-mono text-sm mt-1 ${
                        plan.highlight ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="mb-6">
                    {price !== null && price !== undefined ? (
                      <div className="flex items-end gap-1">
                        <span className="font-bold font-sans text-4xl">
                          ${price}
                        </span>
                        <span
                          className={`font-mono text-sm mb-1 ${
                            plan.highlight ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {period}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold font-sans text-4xl">
                        Custom
                      </span>
                    )}
                  </div>

                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span
                          className={`mt-1 text-lg leading-none ${
                            plan.highlight ? "text-secondary" : "text-primary"
                          }`}
                        >
                          ✓
                        </span>
                        <span className="font-mono text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.monthly == null ? "/contact" : "/signup"}
                    className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-6 py-3 text-sm font-bold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                      plan.highlight
                        ? "bg-secondary hover:bg-secondary-500 text-primary-900 shadow-primary/40"
                        : "bg-gradient-to-r from-primary to-primary-700 text-white shadow-primary/40"
                    }`}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">{plan.cta}</span>
                  </Link>
                </div>
              );
              })}
            </div>
          )}
        </section>

       

        {/* ============================================================ */}
        {/* INCLUDED IN EVERY PLAN                                       */}
        {/* ============================================================ */}
        <section className="py-16 md:py-24 px-6 md:px-[7%] max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="font-bold font-sans text-primary md:text-4xl text-3xl tracking-tight">
              Included in Every Plan
            </h2>
            <p className="font-mono text-gray-600 text-base max-w-xl mx-auto">
              The essentials that come standard with Xpacy — no hidden add-ons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {includedFeatures.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-start p-6 rounded-2xl border border-primary-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-2xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold font-sans text-primary text-lg mb-2">
                  {f.title}
                </h3>
                <p className="font-mono text-sm text-gray-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

       

        {/* ============================================================ */}
        {/* FAQ + "Still have questions?" CARD                           */}
        {/* ============================================================ */}
        <SectionLayout
          heading={"Subscription FAQs"}
          subheading={
            "Everything you need to know about billing, upgrades, and plan changes."
          }
          bgColor={true}
        >
          <div className="space-y-16">
            {faqSection}

            <section className="flex flex-col p-8 gap-6 bg-primary rounded-2xl shadow-md">
              <div className="flex items-center justify-center">
                <div className="flex -space-x-2">
                  <Image
                    src={image1}
                    alt=""
                    className="rounded-full w-12 h-12 border-2 border-white"
                  />
                  <Image
                    src={image2}
                    alt=""
                    className="rounded-full w-12 h-12 -translate-y-2 border-2 border-white"
                  />
                  <Image
                    src={image3}
                    alt=""
                    className="rounded-full w-12 h-12 border-2 border-white"
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-white md:text-xl text-lg font-bold font-sans">
                  Still have questions?
                </p>
                <p className="font-mono text-white/90 md:text-base text-sm max-w-md mx-auto">
                  Can’t find the answer you’re looking for? Speak directly to our
                  team about the right plan for your portfolio.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-secondary hover:bg-secondary-500 text-primary-900 text-base font-mono rounded-xl font-bold transition-colors shadow-sm"
                >
                  Talk to Sales
                </Link>
              </div>
            </section>
          </div>
        </SectionLayout>
      </main>
      {footer}
    </>
  );
}

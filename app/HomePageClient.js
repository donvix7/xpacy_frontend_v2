"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SectionLayout from "./_components/SectionLayout";

import image1 from "@/public/image1.png";
import image2 from "@/public/image2.png";
import image3 from "@/public/image3.png";

/* -------------------------------------------------------------------------- */
/*                                  DATA                                      */
/* -------------------------------------------------------------------------- */

const plans = [
  {
    name: "Starter",
    tagline: "For independent landlords",
    monthly: 29,
    yearly: 279,
    features: [
      "Up to 10 units",
      "Tenant screening",
      "Online rent collection",
      "Maintenance requests",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Professional",
    tagline: "For growing PM teams",
    monthly: 79,
    yearly: 759,
    features: [
      "Up to 100 units",
      "Everything in Starter",
      "Automated lease renewals",
      "Owner reporting portal",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    tagline: "For large portfolios",
    monthly: null,
    yearly: null,
    features: [
      "Unlimited units",
      "Everything in Professional",
      "Dedicated account manager",
      "API access & integrations",
      "SLA-backed uptime",
      "Custom onboarding",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

const comparisonFeatures = [
  { name: "Units included", starter: "10", pro: "100", ent: "Unlimited" },
  { name: "Tenant screening", starter: true, pro: true, ent: true },
  { name: "Online rent collection", starter: true, pro: true, ent: true },
  { name: "Maintenance requests", starter: true, pro: true, ent: true },
  { name: "Automated lease renewals", starter: false, pro: true, ent: true },
  { name: "Owner reporting portal", starter: false, pro: true, ent: true },
  { name: "Custom branding", starter: false, pro: true, ent: true },
  { name: "Dedicated account manager", starter: false, pro: false, ent: true },
  { name: "API access", starter: false, pro: false, ent: true },
  { name: "Priority support", starter: false, pro: true, ent: true },
];

const includedFeatures = [
  {
    icon: "🔒",
    title: "Bank-Grade Security",
    description:
      "Your data and your tenants' data are protected with industry-leading encryption and SOC 2 compliance.",
  },
  {
    icon: "📱",
    title: "Mobile App Access",
    description:
      "Manage your portfolio on the go. Native iOS and Android apps included with every plan.",
  },
  {
    icon: "🔄",
    title: "Free Data Migration",
    description:
      "Switching from another platform? Our team migrates your data at no cost on any paid plan.",
  },
  {
    icon: "💬",
    title: "Real Human Support",
    description:
      "No chatbots. Reach real property management experts by chat, email, or phone.",
  },
];

const testimonials = [
  {
    quote:
      "We scaled from 40 to 250 doors in a year. Xpacy's Professional plan never got in our way.",
    name: "Adaeze O.",
    role: "Portfolio Manager, Lagos",
    avatar: image1,
  },
  {
    quote:
      "The renewals automation alone saves us 12 hours a month. Worth every naira.",
    name: "Daniel K.",
    role: "Property Owner, Abuja",
    avatar: image2,
  },
  {
    quote:
      "Enterprise onboarding was white-glove. They migrated 800 units in a week without a hitch.",
    name: "Fatima B.",
    role: "Head of Operations, Port Harcourt",
    avatar: image3,
  },
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

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function HomePageClient({ header, footer, faqSection }) {
  const [billing, setBilling] = useState("monthly");

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
                <span className="px-2 py-0.5 text-xs bg-secondary text-primary-900 rounded-full font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PLAN CARDS: Starter / Professional / Enterprise              */}
        {/* ============================================================ */}
        <section className="py-16 md:py-24 px-6 md:px-[7%] max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="font-bold font-sans text-primary md:text-4xl text-3xl tracking-tight">
              Choose Your Plan
            </h2>
            <p className="font-mono text-gray-600 text-base max-w-xl mx-auto">
              14-day free trial on all plans. No credit card required.
            </p>
          </div>

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
                    {price !== null ? (
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
                    href={plan.monthly === null ? "/contact" : "/signup"}
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
        </section>

        {/* ============================================================ */}
        {/* FEATURE COMPARISON TABLE                                     */}
        {/* ============================================================ */}
        <section className="py-16 md:py-24 px-6 md:px-[7%] bg-primary-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <h2 className="font-bold font-sans text-primary md:text-4xl text-3xl tracking-tight">
                Compare Plans
              </h2>
              <p className="font-mono text-gray-600 text-base max-w-xl mx-auto">
                A full breakdown of what each plan includes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-primary-100 bg-white shadow-sm">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-4 font-sans text-sm font-bold">Feature</th>
                    <th className="p-4 font-sans text-sm font-bold text-center">
                      Starter
                    </th>
                    <th className="p-4 font-sans text-sm font-bold text-center">
                      Professional
                    </th>
                    <th className="p-4 font-sans text-sm font-bold text-center">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, i) => (
                    <tr
                      key={f.name}
                      className={i % 2 === 0 ? "bg-white" : "bg-primary-50/40"}
                    >
                      <td className="p-4 font-mono text-sm text-gray-700">
                        {f.name}
                      </td>
                      <td className="p-4 text-center">
                        <ComparisonCell value={f.starter} />
                      </td>
                      <td className="p-4 text-center">
                        <ComparisonCell value={f.pro} />
                      </td>
                      <td className="p-4 text-center">
                        <ComparisonCell value={f.ent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
        {/* TESTIMONIALS                                                 */}
        {/* ============================================================ */}
        <section className="py-16 md:py-24 px-6 md:px-[7%] bg-primary-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <h2 className="font-bold font-sans text-primary md:text-4xl text-3xl tracking-tight">
                Trusted by Property Managers
              </h2>
              <p className="font-mono text-gray-600 text-base max-w-xl mx-auto">
                Join hundreds of PMs who've simplified their operations with
                Xpacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-primary-100 shadow-sm"
                >
                  <p className="font-mono text-sm text-gray-700 leading-relaxed flex-1">
                    “{t.quote}”
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-primary-100">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-sans text-sm font-bold text-primary">
                        {t.name}
                      </p>
                      <p className="font-mono text-xs text-gray-500">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FAQ + "Still have questions?" CARD (mirrors homepage)       */}
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

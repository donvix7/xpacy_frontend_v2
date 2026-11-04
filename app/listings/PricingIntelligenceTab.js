"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Home,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
  Search,
} from "lucide-react";
import { formatCurrency } from "@/app/_lib/utils";

export default function PricingIntelligenceTab() {
  const [filterCategory, setFilterCategory] = useState("sale");
  const [filterType, setFilterType] = useState("house");
  const [filterLocality, setFilterLocality] = useState("");

  const pricingKpis = [/*
    {
      label: "Median house sale",
      value: "₦157.1M",
      change: "-0.8% YoY",
      isPositive: false,
      subtext: "Across tracked residential homes",
    },
    {
      label: "Median 2-bed rent",
      value: "₦2.0M/yr",
      change: "-5.9% YoY",
      isPositive: false,
      subtext: "National benchmark for flats",
    },
    {
      label: "Listings tracked",
      value: "204,191",
      change: "Across 225 areas",
      isPositive: true,
      subtext: "Live data aggregation",
    },
    {
      label: "Top growth state",
      value: "Lagos",
      change: "+41.3% YoY",
      isPositive: true,
      subtext: "Leading capital appreciation",
    },*/
  ];

  // Most expensive vs most affordable for houses
  const housesMostExpensive = [/*
    { rank: 1, state: "Lagos", price: "₦455.2M" },
    { rank: 2, state: "Abuja", price: "₦388.0M" },
    { rank: 3, state: "Delta", price: "₦226.6M" },
    { rank: 4, state: "Enugu", price: "₦184.9M" },*/
  ];

  const housesMostAffordable = [/*
    { rank: 1, state: "Osun", price: "₦43.0M" },
    { rank: 2, state: "Akwa Ibom", price: "₦61.7M" },
    { rank: 3, state: "Ondo", price: "₦71.3M" },
    { rank: 4, state: "Kwara", price: "₦76.4M" },*/
  ];

  // Most expensive vs most affordable for flats
  const flatsMostExpensive = [/*
    { rank: 1, state: "Lagos", price: "₦295.2M" },
    { rank: 2, state: "Abuja", price: "₦161.5M" },
    { rank: 3, state: "Rivers", price: "₦113.4M" },
    { rank: 4, state: "Oyo", price: "₦73.6M" },*/
  ];

  const flatsMostAffordable = [/*
    { rank: 1, state: "Ogun", price: "₦50.7M" },
    { rank: 2, state: "Oyo", price: "₦73.5M" },
    { rank: 3, state: "Kwara", price: "₦76.4M" },
    { rank: 4, state: "Kaduna", price: "₦82.0M" },*/
  ];

  // Three patterns shaping value this month (Direct NPC reference from frame 018)
  const patterns = [/*
    {
      title: "Lagos houses cost 10× Osun",
      description:
        "Median house sale price in Lagos is ₦404.6M, representing ten times the median entry in Osun state (₦43.0M), highlighting high commercial density and investor concentration.",
      linkText: "Explore Lagos price trends",
      badge: "Regional Gap",
    },
    {
      title: "Rents easing year on year",
      description:
        "Median 2-bed rent is down 5.9% year on year nationwide. This represents a softer, more sustainable adjustment compared to high-end sales inflation.",
      linkText: "Track rental yields",
      badge: "Yield Trend",
    },
    {
      title: "Lagos is the value play",
      description:
        "Lagos residential assets experienced a +41.3% YoY capital appreciation, outpacing inflation and attracting strong diaspora and institutional capital.",
      linkText: "Analyze capital gains",
      badge: "Capital Growth",
    },*/
  ];

  return (
    <div className="space-y-6">
      {/* Dark Navy Hero Filter Bar - Direct NPC reference from frame 020 */}
      <div className="rounded-2xl bg-[#203645] text-white p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 mb-3 backdrop-blur-xs">
            Market Intelligence • Updated Monthly
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight">
            Average property prices in Nigeria
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-300">
            Median sale and rental prices across every state and locality — calculated from real listings on Xpacy.
          </p>
        </div>

        {/* Filter Strip */}
        <div className="mt-6 bg-white rounded-xl p-3 sm:p-4 text-gray-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-lg">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="State or locality..."
              value={filterLocality}
              onChange={(e) => setFilterLocality(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium py-1.5 px-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="shortlet">Short Let</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
            >
              <option value="house">House</option>
              <option value="flat">Flat / Apartment</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Bedrooms
            </label>
            <select className="w-full text-xs sm:text-sm font-medium py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800">
              <option value="any">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4+">4+</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-[#e13b30] hover:bg-[#c72f25] text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
              <Search className="w-3.5 h-3.5" />
              <span>View prices</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Benchmark KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pricingKpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <span className="p-2 bg-gray-50 rounded-lg text-primary">
                {idx === 0 ? <Home className="w-4 h-4" /> : idx === 1 ? <Building className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              </span>
            </div>
            <div className="my-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                {kpi.value}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-semibold ${
                  kpi.isPositive ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {kpi.change}
              </span>
              <span className="text-gray-400 text-[11px]">{kpi.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Price Comparison Matrices: Houses for Sale vs Flats for Sale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Houses for Sale */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary-700" />
              <div>
                <h3 className="text-base font-bold text-gray-900 font-sans">
                  Houses for Sale
                </h3>
                <p className="text-xs text-gray-500">Benchmark median asking prices</p>
              </div>
            </div>
            <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
              All states →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Most expensive */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                ~ Most expensive
              </span>
              <div className="space-y-3">
                {housesMostExpensive.map((item) => (
                  <div
                    key={item.state}
                    className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.rank}. {item.state}
                    </span>
                    <span className="text-gray-900 font-extrabold font-mono">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most affordable */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                ~ Most affordable
              </span>
              <div className="space-y-3">
                {housesMostAffordable.map((item) => (
                  <div
                    key={item.state}
                    className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.rank}. {item.state}
                    </span>
                    <span className="text-emerald-700 font-extrabold font-mono">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flats for Sale */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-700" />
              <div>
                <h3 className="text-base font-bold text-gray-900 font-sans">
                  Flats for Sale
                </h3>
                <p className="text-xs text-gray-500">Benchmark median asking prices</p>
              </div>
            </div>
            <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
              All states →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Most expensive */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                ~ Most expensive
              </span>
              <div className="space-y-3">
                {flatsMostExpensive.map((item) => (
                  <div
                    key={item.state}
                    className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.rank}. {item.state}
                    </span>
                    <span className="text-gray-900 font-extrabold font-mono">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most affordable */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                ~ Most affordable
              </span>
              <div className="space-y-3">
                {flatsMostAffordable.map((item) => (
                  <div
                    key={item.state}
                    className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.rank}. {item.state}
                    </span>
                    <span className="text-emerald-700 font-extrabold font-mono">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three patterns shaping value this month (From frame 018) */}
      <div>
        <h3 className="text-base font-bold text-gray-900 font-sans mb-3">
          Three patterns shaping value this month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patterns.map((pattern, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between hover:border-primary-200 transition-colors"
            >
              <div>
                <span className="inline-block text-[11px] font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-md mb-2">
                  {pattern.badge}
                </span>
                <h4 className="text-sm font-bold text-gray-900 font-sans">
                  {pattern.title}
                </h4>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  {pattern.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button className="text-xs font-bold text-primary hover:text-primary-700 inline-flex items-center gap-1">
                  <span>{pattern.linkText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How we measure price explanation card (From frame 008 & 018) */}
      <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-lg bg-primary text-white shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-primary font-sans">
            How we measure price
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            Every quarter, we calculate the median asking price of every active listing published across Xpacy and verified partner portals, grouped by category, property type, bedrooms, state, and locality. The <strong>median</strong> (not the mean) is used so an individual luxury mansion or ultra-low listing cannot skew an entire neighborhood&apos;s baseline.
          </p>
          <p className="text-[11px] text-gray-500">
            Areas and property categories with fewer than 10 active listings are excluded from public index reporting to ensure statistical accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}


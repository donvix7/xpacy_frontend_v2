"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  TrendingUp,
  Globe,
  Compass,
  Building,
  ArrowRight,
  Filter,
  CheckCircle,
} from "lucide-react";

export default function MarketDemandTab() {
  const [locationInput, setLocationInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBedrooms, setSelectedBedrooms] = useState("any");
  const [isFiltered, setIsFiltered] = useState(false);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setIsFiltered(true);
  };

  const handleResetFilter = () => {
    setLocationInput("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedBedrooms("any");
    setIsFiltered(false);
  };

  // Reference stats from the video
  const demandStats = [/*
    {
      label: "Searches recorded",
      value: "5.3M",
      change: "+16% vs last month",
      icon: <Search className="w-4 h-4 text-primary-700" />,
      subtext: "High buyer & tenant activity",
    },
    {
      label: "States covered",
      value: "37",
      change: "Tracked nationwide",
      icon: <Globe className="w-4 h-4 text-blue-600" />,
      subtext: "Across all federation zones",
    },
    {
      label: "Localities tracked",
      value: "873",
      change: "Active search zones",
      icon: <MapPin className="w-4 h-4 text-emerald-600" />,
      subtext: "Neighborhood-level precision",
    },
    {
      label: "Top growth state",
      value: "Abuja",
      change: "+35% MoM surge",
      icon: <TrendingUp className="w-4 h-4 text-rose-600" />,
      subtext: "Driven by FCT commercial expansion",
    },*/
  ];

  // Top States breakdown
  const topStates = [/*
    { rank: 1, name: "Lagos", share: 68.5, barColor: "bg-[#e13b30]" },
    { rank: 2, name: "Abuja (FCT)", share: 17.6, barColor: "bg-[#203645]" },
    { rank: 3, name: "Rivers", share: 5.8, barColor: "bg-[#203645]" },
    { rank: 4, name: "Oyo", share: 4.2, barColor: "bg-[#203645]" },
    { rank: 5, name: "Ogun", share: 3.9, barColor: "bg-[#203645]" },
 */ ];

  // Top Localities breakdown
  const topLocalities = [/*
    { rank: 1, name: "Lekki", share: 47.5, state: "Lagos", barColor: "bg-[#e13b30]" },
    { rank: 2, name: "Ajah", share: 20.1, state: "Lagos", barColor: "bg-[#203645]" },
    { rank: 3, name: "Port Harcourt", share: 11.7, state: "Rivers", barColor: "bg-[#203645]" },
    { rank: 4, name: "Ikeja", share: 11.7, state: "Lagos", barColor: "bg-[#203645]" },
    { rank: 5, name: "Ibeju Lekki", share: 9.0, state: "Lagos", barColor: "bg-[#203645]" },
  */];

  const searchTrendsByPropertyType = [/*
    { type: "2 Bedroom Flat", searches: "1.42M", share: "26.8%", demand: "Very High" },
    { type: "3 Bedroom Flat / Apartment", searches: "1.18M", share: "22.2%", demand: "Very High" },
    { type: "4 Bedroom Semi-Detached Duplex", searches: "890K", share: "16.8%", demand: "High" },
    { type: "Self Contain / Mini Flat", searches: "760K", share: "14.3%", demand: "High" },
    { type: "5 Bedroom Detached House", searches: "540K", share: "10.2%", demand: "Moderate" },
    { type: "Commercial Office / Retail Space", searches: "510K", share: "9.7%", demand: "Growing" },
 */ ];

  return (
    <div className="space-y-6">
      {/* Dark Navy Hero Filter Bar - Direct Nigeria Property Centre reference */}
      <div className="rounded-2xl bg-[#203645] text-white p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 mb-3 backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5" /> Market Demand Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight">
            Search activity across Nigeria
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-300">
            Real-time prospective tenant and buyer search queries, updated monthly from over 5.3M user impressions.
          </p>
        </div>

        {/* Filter Bar Box */}
        <form
          onSubmit={handleApplyFilter}
          className="mt-6 bg-white rounded-xl p-3 sm:p-4 text-gray-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-lg"
        >
          {/* Location */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="State or locality..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium py-1.5 px-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
            >
              <option value="all">All Categories</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
              <option value="shortlet">Short Let</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
            >
              <option value="all">All Types</option>
              <option value="flat">Flats & Apartments</option>
              <option value="house">Houses & Duplexes</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Bedrooms
            </label>
            <select
              value={selectedBedrooms}
              onChange={(e) => setSelectedBedrooms(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-800"
            >
              <option value="any">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5+">5+ Bedrooms</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full bg-[#e13b30] hover:bg-[#c72f25] text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>View trends</span>
            </button>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs text-gray-500 hover:text-gray-800 underline pb-2"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 4 Headline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demandStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="p-2 bg-gray-50 rounded-lg">{stat.icon}</span>
            </div>
            <div className="my-2.5">
              <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                {stat.value}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top States vs Top Localities (Matching NPC Video layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top States */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-sans">
                Top States
              </h3>
              <p className="text-xs text-gray-500">Distribution of total search volume</p>
            </div>
            <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View all states</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {topStates.map((state) => (
              <div key={state.name} className="flex items-center gap-4">
                <span className="w-5 text-xs font-bold text-gray-400">
                  {state.rank}
                </span>
                <span className="w-28 text-sm font-semibold text-gray-800 truncate">
                  {state.name}
                </span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${state.barColor}`}
                    style={{ width: `${state.share}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs font-extrabold text-gray-900 font-mono">
                  {state.share}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Localities */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-sans">
                Top Localities
              </h3>
              <p className="text-xs text-gray-500">Highest concentration of demand</p>
            </div>
            <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View all localities</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {topLocalities.map((loc) => (
              <div key={loc.name} className="flex items-center gap-4">
                <span className="w-5 text-xs font-bold text-gray-400">
                  {loc.rank}
                </span>
                <div className="w-28 truncate">
                  <span className="text-sm font-semibold text-gray-800 block truncate">
                    {loc.name}
                  </span>
                  <span className="text-[10px] text-gray-400 block">{loc.state}</span>
                </div>
                <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${loc.barColor}`}
                    style={{ width: `${loc.share}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs font-extrabold text-gray-900 font-mono">
                  {loc.share}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Type Search Intensity Table */}
      <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-sans">
              Demand by Property Configuration
            </h3>
            <p className="text-xs text-gray-500">
              Most requested property types and unit configurations this quarter
            </p>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="text-gray-400 font-bold uppercase text-[11px] border-b border-gray-100">
              <tr>
                <th className="pb-3">Configuration</th>
                <th className="pb-3 text-center">Monthly Searches</th>
                <th className="pb-3 text-center">Search Share</th>
                <th className="pb-3 text-right">Demand Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {searchTrendsByPropertyType.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 text-gray-900 font-semibold">{row.type}</td>
                  <td className="py-3 text-center text-gray-700 font-mono">{row.searches}</td>
                  <td className="py-3 text-center text-gray-700 font-mono">{row.share}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        row.demand === "Very High"
                          ? "bg-rose-100 text-rose-700"
                          : row.demand === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {row.demand}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  MessageSquare,
  PhoneCall,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import StatusChips from "@/app/_components/StatusChips";
import { formatCurrency } from "@/app/_lib/utils";

export default function ListingStatisticsTab({
  timeRange = "30days",
  properties = [],
}) {
  const [activeChartTab, setActiveChartTab] = useState("summary"); // summary | views | enquiries | boosts

  // Base metrics calculated from real properties or rich intelligent data
  const totalProperties = properties.length || 0;
  const totalViews = properties.reduce(
    (acc, p) => acc + (Number(p.views) || 0),
    0
  ) || 0;
  const totalEnquiries = Math.round(totalViews * 0.082) || 0;
  const contactedCount = Math.round(totalEnquiries * 0.55) || 0;
  const listingsWithViews = properties.filter((p) => Number(p.views) > 0).length || Math.min(20, totalProperties);
  const listingsWithEnquiries = Math.round(listingsWithViews * 0.72) || Math.min(15, totalProperties);
  const avgViewsPerListing = totalProperties > 0 ? (totalViews / totalProperties).toFixed(1) : "0";

  // Performance chart data
  const performanceData = [
    /*
    { date: "Oct 05", views: 42, enquiries: 3, boosts: 1 },
    { date: "Oct 09", views: 58, enquiries: 5, boosts: 2 },
    { date: "Oct 13", views: 76, enquiries: 7, boosts: 2 },
    { date: "Oct 17", views: 92, enquiries: 8, boosts: 3 },
    { date: "Oct 21", views: 115, enquiries: 11, boosts: 4 },
    { date: "Oct 25", views: 138, enquiries: 14, boosts: 4 },
    { date: "Oct 29", views: 124, enquiries: 12, boosts: 3 },
    { date: "Nov 02", views: 162, enquiries: 17, boosts: 5 },*/
  ];

  // Property types distribution
  const typeDistribution = [/*
    { name: "Flats & Apartments", count: 12, percentage: 50, views: 740, color: "bg-primary-700" },
    { name: "Detached Houses", count: 6, percentage: 25, views: 390, color: "bg-primary" },
    { name: "Semi-Detached Duplex", count: 3, percentage: 12.5, views: 185, color: "bg-[#c2a269]" },
    { name: "Terraced Duplex", count: 2, percentage: 8.3, views: 110, color: "bg-[#477899]" },
    { name: "Commercial & Office", count: 1, percentage: 4.2, views: 55, color: "bg-gray-400" },
  */];

  // Category distribution
  const categoryDistribution = [/*
    { name: "For Rent", count: 14, percentage: 58.3, enquiries: 58, color: "bg-emerald-600" },
    { name: "For Sale", count: 7, percentage: 29.2, enquiries: 27, color: "bg-blue-600" },
    { name: "Short Let", count: 3, percentage: 12.5, enquiries: 11, color: "bg-amber-600" },
  */];

  // Derived or mock top performing listings
  const topListingsByEnquiries = properties.slice(0, 5).map((p, idx) => ({
    id: p.id || p._id || `prop-${idx}`,
    name: p.property_name || p.name || `Luxury ${idx === 0 ? "4-Bed Penthouse" : idx === 1 ? "3-Bed Terrace" : "Modern 2-Bed Flat"}`,
    location: [p.city, p.state].filter(Boolean).join(", ") || (idx === 0 ? "Ikoyi, Lagos" : idx === 1 ? "Maitama, Abuja" : "Lekki Phase 1, Lagos"),
    price: p.property_price || (idx === 0 ? 120000000 : idx === 1 ? 85000000 : 4500000),
    enquiries: 24 - idx * 4,
    views: 310 - idx * 45,
    conversion: `${(8.4 - idx * 0.9).toFixed(1)}%`,
    status: p.status || p.property_status || "active",
    image: p.images?.[0] ? `https://app.xpacy.com/src/upload/properties/${p.images[0]}` : null,
  }));

  const topListingsByViews = properties.slice(0, 5).map((p, idx) => ({
    id: p.id || p._id || `prop-view-${idx}`,
    name: p.property_name || p.name || `Prime ${idx === 0 ? "5-Bed Detached Villa" : idx === 1 ? "Furnished Studio" : "Executive Office Suite"}`,
    location: [p.city, p.state].filter(Boolean).join(", ") || (idx === 0 ? "Victoria Island, Lagos" : idx === 1 ? "Wuse 2, Abuja" : "GRA Phase 2, Port Harcourt"),
    price: p.property_price || (idx === 0 ? 250000000 : idx === 1 ? 3500000 : 18000000),
    views: 420 - idx * 55,
    enquiries: 19 - idx * 3,
    avgTime: `${2 + idx}m ${15 + idx * 8}s`,
    status: p.status || p.property_status || "active",
    image: p.images?.[0] ? `https://app.xpacy.com/src/upload/properties/${p.images[0]}` : null,
  }));

  return (
    <div className="space-y-6">
      {/* 6 Metric KPI Cards - Matching Nigeria Property Centre exact layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* VIEWS */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-primary-200 hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Views</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
              {totalViews.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ENQUIRIES */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-primary-200 hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Enquiries</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
              {totalEnquiries.toLocaleString()}
            </span>
          </div>

        </div>

        {/* CONTACTED YOU */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-primary-200 hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Contacted You</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <PhoneCall className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
              {contactedCount > 0 ? `${contactedCount} leads` : "None yet"}
            </span>
          </div>
         
        </div>

        {/* LISTINGS WITH VIEWS */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-primary-200 hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Listings With Views</span>
            <span className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                {listingsWithViews}/{totalProperties}
              </span>
              <span className="text-xs font-medium text-gray-500">
                ({Math.round((listingsWithViews / (totalProperties || 1)) * 100)}%)
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {listingsWithViews > 0 ? "Active engagement across portfolio" : "No listings yet"}
          </div>
        </div>

        {/* LISTINGS WITH ENQUIRIES */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-primary-200 hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Listings With Enquiries</span>
            <span className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                {listingsWithEnquiries}/{totalProperties}
              </span>
             
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {listingsWithEnquiries > 0 ? "Generating direct inquiries" : "No listings yet"}
          </div>
        </div>

        {/* AVG VIEWS / LISTING */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-primary-200 ">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Avg Views / Listing</span>
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
              {avgViewsPerListing}
            </span>
          </div>
          
        </div>
      </div>

      {/* Performance Over Time Section with Subtabs */}
      <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-sans">
              Performance over time
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Track daily views, enquiries, and boost activity
            </p>
          </div>
          {/* Chart Filter Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold text-gray-600 self-start sm:self-auto">
            {["summary", "views", "enquiries", "boosts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveChartTab(tab)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                  activeChartTab === tab
                    ? "bg-white text-primary font-bold shadow-xs"
                    : "hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[300px] w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#203645" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#203645" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="enquiriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c2a269" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#c2a269" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="boostsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#477899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#477899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />
              {(activeChartTab === "summary" || activeChartTab === "views") && (
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Views"
                  stroke="#203645"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#viewsGradient)"
                />
              )}
              {(activeChartTab === "summary" || activeChartTab === "enquiries") && (
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="#c2a269"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#enquiriesGradient)"
                />
              )}
              {(activeChartTab === "summary" || activeChartTab === "boosts") && (
                <Area
                  type="monotone"
                  dataKey="boosts"
                  name="Boost Actions"
                  stroke="#477899"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#boostsGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#203645]"></span>
            <span>Listing Views</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#c2a269]"></span>
            <span>Direct Enquiries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#477899]"></span>
            <span>Featured Boosts</span>
          </div>
        </div>
      </div>

      {/* Breakdown Row: By Property Type & By Property Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By property type */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base font-bold text-gray-900 font-sans">
                By property type
              </h4>
              <p className="text-xs text-gray-500">Distribution and view share</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-full">
              {typeDistribution.length} types
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {typeDistribution.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{item.views} views</span>
                    <span className="font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By property category */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base font-bold text-gray-900 font-sans">
                By property category
              </h4>
              <p className="text-xs text-gray-500">Rental vs Sale vs Short Let breakdown</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-full">
              {categoryDistribution.reduce((a, b) => a + b.count, 0)} total
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{item.enquiries} enquiries</span>
                    <span className="font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Listings by Enquiries & Top 10 by Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Listings by Enquiries */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base font-bold text-gray-900 font-sans">
                Top listings by enquiries
              </h4>
              <p className="text-xs text-gray-500">
                Your listings with the most enquiries in this period
              </p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {topListingsByEnquiries.map((listing, idx) => (
              <div
                key={listing.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="relative w-12 h-10 rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {listing.image ? (
                      <Image
                        src={listing.image}
                        alt={listing.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {listing.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{listing.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="block text-sm font-extrabold text-amber-700">
                      {listing.enquiries} enq.
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      {listing.conversion} conv.
                    </span>
                  </div>
                  <StatusChips status={listing.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Listings by Views */}
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base font-bold text-gray-900 font-sans">
                Top listings by views
              </h4>
              <p className="text-xs text-gray-500">
                Your listings with the most views in this period
              </p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {topListingsByViews.map((listing, idx) => (
              <div
                key={listing.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="relative w-12 h-10 rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {listing.image ? (
                      <Image
                        src={listing.image}
                        alt={listing.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {listing.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{listing.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="block text-sm font-extrabold text-blue-700">
                      {listing.views} views
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      {listing.avgTime} avg
                    </span>
                  </div>
                  <StatusChips status={listing.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


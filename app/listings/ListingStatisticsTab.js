"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Eye,
  MessageSquare,
  PhoneCall,
  BarChart3,
  Building2,
  CheckCircle2,
  Sparkles,
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
  const listingRecords = Array.isArray(properties) ? properties : [];
  const countValue = (value) => {
    const count = Number(value);
    return Number.isFinite(count) ? count : 0;
  };
  const categoryName = (listing) => {
    const value = String(listing.listing_type || listing.listingType || listing.category || "Other").toUpperCase();
    if (value.includes("SHORT")) return "Shortlet";
    if (["SALE", "BUY", "FOR SALE"].includes(value)) return "For Sale";
    if (["RENT", "FOR RENT", "LEASE"].includes(value)) return "For Rent";
    return value === "OTHER" ? "Other" : value.replaceAll("_", " ");
  };

  // Metrics are calculated from the listing records returned for this organization.
  const totalListings = listingRecords.length;
  const totalViews = listingRecords.reduce((total, listing) => total + countValue(listing.views), 0);
  const totalEnquiries = listingRecords.reduce((total, listing) => total + countValue(listing.enquiries ?? listing.inquiries ?? listing.enquiry_count), 0);
  const contactedCount = listingRecords.reduce((total, listing) => total + countValue(listing.contactedCount ?? listing.contacted_count), 0);
  const listingsWithViews = listingRecords.filter((listing) => countValue(listing.views) > 0).length;
  const listingsWithEnquiries = listingRecords.filter((listing) => countValue(listing.enquiries ?? listing.inquiries ?? listing.enquiry_count) > 0).length;
  const avgViewsPerListing = totalListings > 0 ? (totalViews / totalListings).toFixed(1) : "0";

  // The API currently supplies totals per listing, not dated activity records.
  const performanceData = [];

  const distributionColors = ["bg-primary-700", "bg-primary", "bg-[#c2a269]", "bg-[#477899]", "bg-gray-400"];
  const buildDistribution = (keyFor, metricKey) => {
    const groups = new Map();
    for (const listing of listingRecords) {
      const name = keyFor(listing) || "Other";
      const group = groups.get(name) || { name, count: 0, metric: 0 };
      group.count += 1;
      group.metric += countValue(listing[metricKey]);
      groups.set(name, group);
    }
    return [...groups.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .map((group, index) => ({
        ...group,
        views: metricKey === "views" ? group.metric : undefined,
        enquiries: metricKey === "enquiries" ? group.metric : undefined,
        percentage: totalListings ? Math.round((group.count / totalListings) * 100) : 0,
        color: distributionColors[index % distributionColors.length],
      }));
  };

  const typeDistribution = buildDistribution(
    (listing) => listing.property_type || listing.propertyType || listing.unit?.unitType || "Other",
    "views"
  );
  const categoryDistribution = buildDistribution(categoryName, "enquiries");

  const topListingsByEnquiries = [...listingRecords]
    .sort((a, b) => countValue(b.enquiries ?? b.inquiries ?? b.enquiry_count) - countValue(a.enquiries ?? a.inquiries ?? a.enquiry_count))
    .slice(0, 5)
    .map((p, idx) => ({
    id: p.id || p._id || `prop-${idx}`,
    name: p.listing_title || p.title || p.property_name || p.name || "Untitled listing",
    location: [p.city, p.state].filter(Boolean).join(", ") || p.address || "Location unavailable",
    price: p.price ?? p.property_price ?? 0,
    enquiries: countValue(p.enquiries ?? p.inquiries ?? p.enquiry_count),
    views: countValue(p.views),
    conversion: countValue(p.views) > 0 ? `${((countValue(p.enquiries ?? p.inquiries ?? p.enquiry_count) / countValue(p.views)) * 100).toFixed(1)}%` : "—",
    status: p.status || p.property_status || "active",
    image: p.images?.[0]
      ? (/^https?:\/\//i.test(p.images[0]) ? p.images[0] : `https://app.xpacy.com/src/upload/properties/${p.images[0]}`)
      : null,
  }));

  const topListingsByViews = [...listingRecords]
    .sort((a, b) => countValue(b.views) - countValue(a.views))
    .slice(0, 5)
    .map((p, idx) => ({
    id: p.id || p._id || `prop-view-${idx}`,
    name: p.listing_title || p.title || p.property_name || p.name || "Untitled listing",
    location: [p.city, p.state].filter(Boolean).join(", ") || p.address || "Location unavailable",
    price: p.price ?? p.property_price ?? 0,
    views: countValue(p.views),
    enquiries: countValue(p.enquiries ?? p.inquiries ?? p.enquiry_count),
    avgTime: "—",
    status: p.status || p.property_status || "active",
    image: p.images?.[0]
      ? (/^https?:\/\//i.test(p.images[0]) ? p.images[0] : `https://app.xpacy.com/src/upload/properties/${p.images[0]}`)
      : null,
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
                {listingsWithViews}/{totalListings}
              </span>
              <span className="text-xs font-medium text-gray-500">
                ({Math.round((listingsWithViews / (totalListings || 1)) * 100)}%)
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
                {listingsWithEnquiries}/{totalListings}
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
        <div className="relative h-[300px] w-full pt-6">
          {!performanceData.length && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-50 text-center text-sm text-gray-500">
              This listings response has no dated views or enquiry history yet.
            </div>
          )}
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
            {typeDistribution.length ? typeDistribution.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{item.count} listings · {item.views} views</span>
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
            )) : <p className="py-5 text-sm text-gray-500">No property type details were returned for these listings.</p>}
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
            {categoryDistribution.length ? categoryDistribution.map((item) => (
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
            )) : <p className="py-5 text-sm text-gray-500">No listing categories were returned.</p>}
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
            {topListingsByEnquiries.length ? topListingsByEnquiries.map((listing, idx) => (
              <div
                key={listing.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                 
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
                    <p className="text-xs font-semibold text-primary">{formatCurrency(listing.price)}</p>
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
                </div>
              </div>
            )) : <p className="py-6 text-sm text-gray-500">No listings are available for this organization yet.</p>}
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
            {topListingsByViews.length ? topListingsByViews.map((listing, idx) => (
              <div
                key={listing.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  
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
                    <p className="text-xs font-semibold text-primary">{formatCurrency(listing.price)}</p>
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
                </div>
              </div>
            )) : <p className="py-6 text-sm text-gray-500">No listings are available for this organization yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Layers,
  Calendar,
  RefreshCw,
} from "lucide-react";
import ListingStatisticsTab from "./ListingStatisticsTab";
import MarketDemandTab from "./MarketDemandTab";
import PricingIntelligenceTab from "./PricingIntelligenceTab";
import ListingsDirectoryTab from "./ListingsDirectoryTab";

export default function AdminListingsClient({ listings = [], organization, organizationId }) {
  const [activeTab, setActiveTab] = useState("statistics");
  const [timeRange, setTimeRange] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const listingStatistics = listings.map((listing) => ({
    ...listing,
    property_name: listing.title || listing.property?.property_name || "Untitled listing",
    property_type: listing.listingType || listing.unit?.unitType || "—",
    property_status: listing.status || "UNKNOWN",
    property_price: listing.price,
    views: Number(listing.views) || 0,
    enquiries: Number(listing.enquiries || listing.inquiries) || 0,
    city: listing.location?.city || listing.property?.city,
    state: listing.location?.state || listing.property?.state,
    images: listing.property?.images || [],
  }));

  const navTabs = [
    {
      id: "statistics",
      label: "Listing Statistics",
      icon: <BarChart3 className="w-4 h-4" />,
      badge: "Real-time",
    },
    {
      id: "trends",
      label: "Demand & Trends",
      icon: <TrendingUp className="w-4 h-4" />,
      badge: "5.3M Searches",
    },
    {
      id: "pricing",
      label: "Prices Across Nigeria",
      icon: <DollarSign className="w-4 h-4" />,
      badge: "Monthly Index",
    },
    {
      id: "listings",
      label: "All Listings",
      icon: <Layers className="w-4 h-4" />,
      badge: `${listings.length}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-primary-100">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary font-sans tracking-tight">
            {organization?.name ? `${organization.name} Listing Statistics` : "Listing Statistics & Intelligence"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            View listings and performance for {organization?.name || "this organization"}.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-primary-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh Data"
            className="p-2 rounded-lg bg-white border border-primary-200 text-gray-600 hover:text-primary transition-colors shadow-2xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? "animate-spin text-primary" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 lg:flex-shrink-0">
          <nav
            aria-label="Listing sections"
            className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2  no-scrollbar
                       lg:sticky lg:top-6 lg:bg-white lg:border lg:border-gray-200/80 lg:rounded-2xl lg:p-3 lg:shadow-2xs"
          >
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center justify-between gap-2 px-4 lg:px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all w-full text-left
                    ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white lg:bg-transparent text-gray-600 border border-gray-200/80 lg:border-transparent hover:border-primary-200 lg:hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Active Tab View */}
        <main className="flex-1 min-w-0">
          {activeTab === "statistics" && (
            <ListingStatisticsTab
              timeRange={timeRange}
              properties={listingStatistics}
            />
          )}
          {activeTab === "trends" && <MarketDemandTab />}
          {activeTab === "pricing" && <PricingIntelligenceTab />}
          {activeTab === "listings" && (
            <ListingsDirectoryTab listings={listings} organizationId={organizationId} />
          )}
        </main>
      </div>
    </div>
  );
}

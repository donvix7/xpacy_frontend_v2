"use client";

import { useState } from "react";
import { BarChart3, Calendar, DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import ListingStatisticsTab from "../ListingStatisticsTab";
import MarketDemandTab from "../MarketDemandTab";
import PricingIntelligenceTab from "../PricingIntelligenceTab";

const sections = [
  { id: "statistics", label: "Listing Statistics", icon: BarChart3 },
  { id: "trends", label: "Demand & Trends", icon: TrendingUp },
  { id: "pricing", label: "Price Intelligence", icon: DollarSign },
];

export default function ListingInsightsClient({ listings = [] }) {
  const [activeSection, setActiveSection] = useState("statistics");
  const [timeRange, setTimeRange] = useState("30days");
  const [refreshing, setRefreshing] = useState(false);

  function refreshView() {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 600);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveSection(id)} aria-pressed={activeSection === id}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeSection === id ? "bg-primary text-white" : "text-gray-600 hover:bg-primary-50 hover:text-primary"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} className="bg-transparent outline-none">
              <option value="7days">Last 7 days</option><option value="30days">Last 30 days</option><option value="90days">Last 90 days</option><option value="year">This year</option><option value="all">All time</option>
            </select>
          </label>
          <button type="button" onClick={refreshView} aria-label="Refresh statistics" title="Refresh statistics" className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:text-primary">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {activeSection === "statistics" && <ListingStatisticsTab properties={listings} timeRange={timeRange} />}
      {activeSection === "trends" && <MarketDemandTab />}
      {activeSection === "pricing" && <PricingIntelligenceTab />}
    </div>
  );
}

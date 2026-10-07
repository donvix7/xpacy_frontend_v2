"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatReportMonth, getReportDate, getRollingMonthKeys, toReportArray } from "@/app/_lib/report-utils";

const ServiceGrowthChart = ({ services = [] }) => {
  const records = toReportArray(services);
  const keys = getRollingMonthKeys(12);
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  let datedCount = 0;
  for (const service of records) {
    const date = getReportDate(service, ["created_at", "createdAt", "requested_at", "request_date", "scheduled_date", "date"]);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (key in counts) { counts[key] += 1; datedCount += 1; }
  }
  if (!datedCount) return <div className="flex h-[280px] w-full items-center justify-center text-sm text-gray-400">No dated service requests in the last 12 months</div>;
  const data = keys.map((key) => ({ name: formatReportMonth(key), requests: counts[key] }));
  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} width={32} />
          <Tooltip labelFormatter={(label) => `Month: ${label}`} formatter={(value) => [value, "Requests"]} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
          <Bar dataKey="requests" fill="#477899" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceGrowthChart;

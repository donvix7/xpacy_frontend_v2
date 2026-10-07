"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/app/_lib/utils";
import { getReportPaidAmount, getReportDate, getReportStatus, getRollingMonthKeys, formatReportMonth, toReportArray } from "@/app/_lib/report-utils";

const PAID_STATUSES = new Set(["paid", "completed", "successful", "success"]);

const RevenueOverviewChart = ({ payments = [] }) => {
  const records = toReportArray(payments);
  const monthKeys = getRollingMonthKeys(12);
  const byMonth = Object.fromEntries(monthKeys.map((key) => [key, 0]));
  let paidRecords = 0;

  for (const payment of records) {
    if (!PAID_STATUSES.has(getReportStatus(payment, ["payment_status", "invoice_status", "status"]))) continue;
    const date = getReportDate(payment, ["payment_date", "paid_at", "paidAt", "updated_at", "updatedAt", "created_at", "createdAt", "date", "issued_at"]);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!(key in byMonth)) continue;
    byMonth[key] += getReportPaidAmount(payment);
    paidRecords += 1;
  }

  if (!paidRecords) return <div className="flex h-[280px] w-full items-center justify-center text-sm text-gray-400">No paid revenue in the last 12 months</div>;

  const data = monthKeys.map((key) => ({ name: formatReportMonth(key), revenue: byMonth[key] }));
  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(value) => value >= 1000000 ? `₦${(value / 1000000).toFixed(1)}m` : value >= 1000 ? `₦${(value / 1000).toFixed(0)}k` : `₦${value}`} width={55} />
          <Tooltip formatter={(value) => [formatCurrency(value), "Paid revenue"]} labelFormatter={(label) => `Month: ${label}`} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
          <Bar dataKey="revenue" name="Paid revenue" fill="#477899" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueOverviewChart;

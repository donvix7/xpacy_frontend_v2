"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/app/_lib/utils";

const COLORS = ["#477899", "#73A0BE", "#C7D9E5", "#FBC0BC", "#E5A85B", "#8D78B5", "#5D9C79", "#E58B8B"];

const DistributionDonutChart = ({ data = [], emptyLabel = "No data available", format }) => {
  const chartData = (Array.isArray(data) ? data : [])
    .map((item, index) => ({ ...item, value: Number(item.value) || 0, color: item.color || COLORS[index % COLORS.length] }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const formatValue = (value) => format === "currency" ? formatCurrency(value) : Number(value).toLocaleString();

  if (chartData.length === 0) return <div className="flex h-[280px] w-full items-center justify-center text-sm text-gray-400">{emptyLabel}</div>;

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3 sm:flex-row sm:gap-6">
      <div className="relative h-[210px] w-full min-w-0 sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={2} dataKey="value" stroke="white" strokeWidth={2}>
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [formatValue(value), name]} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-gray-800">{formatValue(total)}</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
      </div>
      <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:w-1/2">
        {chartData.map((item) => (
          <div key={item.name} className="flex min-w-0 items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 truncate text-gray-600" title={item.name}>{item.name}</span>
            <span className="shrink-0 font-medium text-gray-800">{formatValue(item.value)}</span>
            <span className="w-10 shrink-0 text-right text-xs text-gray-400">{((item.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionDonutChart;

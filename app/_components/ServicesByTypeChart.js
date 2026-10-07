"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toReportArray } from "@/app/_lib/report-utils";


const ServicesByTypeChart = ({ services = [] }) => {
  // Group services by type
  const typeCounts = toReportArray(services).reduce((acc, service) => {
    const rawType = String(service.service_type || service.category || service.type || "Unspecified").trim();
    const type = rawType ? rawType.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unspecified";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(typeCounts).map(name => ({
    name,
    count: typeCounts[name]
  })).sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return <div className="w-full h-[300px] flex items-center justify-center text-gray-400 font-mono">No service categories requested yet</div>;
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div className="min-w-[360px]" style={{ height: Math.max(280, data.length * 42) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 18, left: 4, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            formatter={(value) => [`${value} (${((value / data.reduce((sum, row) => sum + row.count, 0)) * 100).toFixed(1)}%)`, "Requests"]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar 
            dataKey="count" 
            fill="#477899" 
            radius={[4, 4, 0, 0]}
            barSize={24}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#477899' : '#73A0BE'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ServicesByTypeChart;

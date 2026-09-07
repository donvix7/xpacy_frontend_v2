"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";


const UserDistributionChart = ({ stats }) => {
  const data = [
    { name: "Property Owners", value: stats?.propertyOwners || 0, color: "#477899" },
    { name: "Residents", value: stats?.residents || 0, color: "#73A0BE" },
    { name: "Service Providers", value: stats?.serviceProviders || 0, color: "#C7D9E5" },
    { name: "Admins", value: stats?.admins || 0, color: "#FBC0BC" },
  ];

  return (
    <div className="w-full h-[300px] flex flex-col items-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          {/* ... existing chart internals */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600 font-mono">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDistributionChart;

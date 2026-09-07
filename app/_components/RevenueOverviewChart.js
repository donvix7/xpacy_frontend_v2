"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";


const RevenueOverviewChart = ({ payments = [] }) => {
  // Aggregate revenue by Year-Month
  const dailyData = payments.reduce((acc, payment) => {
    const date = new Date(payment.created_at || payment.date);
    if (isNaN(date)) return acc;

    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = parseFloat(payment.amount) || 0;
    acc[yearMonth] = (acc[yearMonth] || 0) + amount;
    return acc;
  }, {});

  // Sort by date key and take last 12 months
  const sortedKeys = Object.keys(dailyData).sort();
  const recentKeys = sortedKeys.slice(-12);

  const data = recentKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(year, month - 1);
    return {
      name: `${date.toLocaleString('default', { month: 'short' })} '${year.slice(-2)}`,
      revenue: dailyData[key]
    };
  });

  if (data.length === 0) {
    return <div className="w-full h-[300px] flex items-center justify-center text-gray-400 font-mono">No financial data available</div>;
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* ... existing chart internals */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`$${value}`, 'Revenue']}
          />
          <Bar 
            dataKey="revenue" 
            fill="#477899" 
            radius={[4, 4, 0, 0]}
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#477899' : '#C7D9E5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueOverviewChart;

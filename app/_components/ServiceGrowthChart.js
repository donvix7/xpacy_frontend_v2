"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";


const ServiceGrowthChart = ({ services = [] }) => {
  // Aggregate services by Year-Month
  const aggregatedData = services.reduce((acc, service) => {
    const date = new Date(service.created_at || service.scheduled_date);
    if (isNaN(date)) return acc;
    
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[yearMonth] = (acc[yearMonth] || 0) + 1;
    return acc;
  }, {});

  // Sort by date key and take last 12 months
  const sortedKeys = Object.keys(aggregatedData).sort();
  const recentKeys = sortedKeys.slice(-12);

  const data = recentKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(year, month - 1);
    return {
      name: `${date.toLocaleString('default', { month: 'short' })} '${year.slice(-2)}`,
      services: aggregatedData[key],
      fullDate: key // for sorting/tooltips if needed
    };
  });

  if (data.length === 0) {
    return <div className="w-full h-[300px] flex items-center justify-center text-gray-400 font-mono">No service data available</div>;
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
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
          />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar 
            dataKey="services" 
            fill="#477899" 
            radius={[4, 4, 0, 0]}
            barSize={35}
          >
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#477899' : '#73A0BE'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceGrowthChart;

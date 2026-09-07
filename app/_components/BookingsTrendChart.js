"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BookingsTrendChart = ({ bookings = [] }) => {
  const monthly = bookings.reduce((acc, booking) => {
    const date = new Date(booking.created_at || booking.createdAt || booking.start_date);
    if (isNaN(date)) return acc;

    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[yearMonth] = (acc[yearMonth] || 0) + 1;
    return acc;
  }, {});

  const sortedKeys = Object.keys(monthly).sort();
  const recentKeys = sortedKeys.slice(-12);

  const data = recentKeys.map((key) => {
    const [year, month] = key.split("-");
    const date = new Date(year, month - 1);
    return {
      name: `${date.toLocaleString("default", { month: "short" })} '${year.slice(-2)}`,
      bookings: monthly[key],
    };
  });

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-400 font-mono">
        No booking data available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "#C7D9E5", strokeDasharray: "3 3" }}
            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#477899"
            strokeWidth={2}
            dot={{ r: 3, fill: "#477899" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsTrendChart;
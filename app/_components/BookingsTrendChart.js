"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatReportMonth, getReportDate, getRollingMonthKeys, toReportArray } from "@/app/_lib/report-utils";

const BookingsTrendChart = ({ bookings = [] }) => {
  const records = toReportArray(bookings);
  const keys = getRollingMonthKeys(12);
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  let datedCount = 0;
  for (const booking of records) {
    const date = getReportDate(booking, ["created_at", "createdAt", "booked_at", "booking_date", "start_date", "date"]);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (key in counts) { counts[key] += 1; datedCount += 1; }
  }
  if (!datedCount) return <div className="flex h-[280px] w-full items-center justify-center text-sm text-gray-400">No dated bookings in the last 12 months</div>;
  const data = keys.map((key) => ({ name: formatReportMonth(key), bookings: counts[key] }));
  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} width={32} />
          <Tooltip labelFormatter={(label) => `Month: ${label}`} formatter={(value) => [value, "Bookings"]} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
          <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#477899" strokeWidth={2} dot={{ r: 3, fill: "#477899" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsTrendChart;

"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#477899", "#73A0BE", "#C7D9E5", "#FBC0BC", "#E5E7EB"];

const DistributionDonutChart = ({ data = [], emptyLabel = "No data available", format }) => {
  const chartData = data
    .map((item, index) => ({ ...item, color: item.color || COLORS[index % COLORS.length] }))
    .filter((item) => (Number(item.value) || 0) > 0);

  const formatValue = (value) =>
    format === "currency" ? `$${Number(value).toLocaleString()}` : value;

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-400 font-mono">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="60%"
              dataKey="value"
              cornerRadius={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.labels}>
        {chartData.map((item, index) => (
          <div key={index} style={styles.labelItem}>
            <div style={{ ...styles.colorBox, backgroundColor: item.color }} />
            <span style={styles.span}>{item.name} ({formatValue(item.value)})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "100%",
    paddingBottom: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  chartWrapper: {
    width: "100%",
    minWidth: "200px",
    height: "200px",
  },
  labels: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    bottom: "4px",
    right: 0,
    flexWrap: "wrap",
  },
  span: {
    fontFamily: "Unitext Regular",
  },
  labelItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  colorBox: {
    width: "14px",
    height: "14px",
    marginRight: "5px",
  },
};

export default DistributionDonutChart;
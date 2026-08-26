"use client"
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#477899", "#73A0BE", "#C7D9E5", "#FBC0BC"];

const PropertiesPieChart = ({ properties = [] }) => {
  const purposeCounts = properties.reduce((acc, property) => {
    const purpose = (property.purpose || property.type || "Other").toLowerCase();
    const label = purpose === "rent" ? "For Rent"
      : purpose === "sale" ? "For Sale"
      : purpose === "shortlet" ? "For Shortlet"
      : purpose.charAt(0).toUpperCase() + purpose.slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(purposeCounts).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  if (data.length === 0) {
    data.push({ name: "No Properties", value: 1, color: "#E5E7EB" });
  }

  return (
    <div style={styles.container}>
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="60%"
              dataKey="value"
              cornerRadius={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.labels}>
        {data.map((item, index) => (
          <div key={index} style={styles.labelItem}>
            <div style={{ ...styles.colorBox, backgroundColor: item.color }} />
            <span style={styles.span}>{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles for responsiveness
const styles = {
  container: {
    position: "relative",
    width: "100%",
    // maxWidth: "200px",
    paddingBottom: "10px",
    // marginTop: "-40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  chartWrapper: {
    width: "100%",
    minWidth: "200px",
    // maxWidth: "250px",
    height: "200px",
  },
  labels: {
    display: "flex",
    // position: "absolute",
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
    gap: '4px',
  },
  colorBox: {
    width: "14px",
    height: "14px",
    marginRight: "5px",
  },
};

export default PropertiesPieChart;

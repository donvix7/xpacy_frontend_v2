import DistributionDonutChart from "./DistributionDonutChart";

const PropertyStatusChart = ({ properties = [] }) => {
  const counts = properties.reduce((acc, property) => {
    const status = (property.availability_status || property.status || "unknown").toLowerCase();
    let label = "Other";
    if (status === "occupied") label = "Occupied";
    else if (status === "vacant") label = "Vacant";
    else if (status === "available") label = "Available";
    else if (status === "active") label = "Active";
    else if (status === "under-review") label = "Under Review";
    else if (status === "pending") label = "Pending";
    else if (status !== "unknown") label = status.charAt(0).toUpperCase() + status.slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return <DistributionDonutChart data={data} emptyLabel="No property status data available" />;
};

export default PropertyStatusChart;
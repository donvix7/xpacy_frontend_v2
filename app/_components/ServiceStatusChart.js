import DistributionDonutChart from "./DistributionDonutChart";

const ServiceStatusChart = ({ services = [] }) => {
  const counts = services.reduce((acc, service) => {
    const status = (service.status || service.service_status || "pending").toLowerCase();
    let label = "Other";
    if (status === "pending") label = "Pending";
    else if (status === "in-progress" || status === "in progress") label = "In Progress";
    else if (status === "completed") label = "Completed";
    else if (status === "assigned") label = "Assigned";
    else if (status === "accepted") label = "Accepted";
    else if (status === "awaiting-parts") label = "Awaiting Parts";
    else if (status === "closed") label = "Closed";
    else if (status === "cancelled" || status === "canceled") label = "Cancelled";
    else if (status !== "unknown") label = status.charAt(0).toUpperCase() + status.slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return <DistributionDonutChart data={data} emptyLabel="No service status data available" />;
};

export default ServiceStatusChart;
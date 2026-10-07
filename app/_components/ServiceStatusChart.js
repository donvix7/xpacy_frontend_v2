import DistributionDonutChart from "./DistributionDonutChart";
import { getReportStatus, toReportArray } from "@/app/_lib/report-utils";

const ServiceStatusChart = ({ services = [] }) => {
  const counts = toReportArray(services).reduce((acc, service) => {
    const rawStatus = getReportStatus(service, ["service_status", "status"]);
    const status = rawStatus === "canceled" ? "cancelled" : rawStatus;
    const label = ({ pending: "Pending", "in-progress": "In Progress", completed: "Completed", assigned: "Assigned", accepted: "Accepted", "awaiting-parts": "Awaiting Parts", closed: "Closed", cancelled: "Cancelled", canceled: "Cancelled", unspecified: "Unspecified", unknown: "Unspecified" })[status]
      || status.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return <DistributionDonutChart data={data} emptyLabel="No service status data available" />;
};

export default ServiceStatusChart;

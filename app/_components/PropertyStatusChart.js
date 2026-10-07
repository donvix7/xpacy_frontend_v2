import DistributionDonutChart from "./DistributionDonutChart";
import { getReportStatus, toReportArray } from "@/app/_lib/report-utils";

const PropertyStatusChart = ({ properties = [] }) => {
  const counts = toReportArray(properties).reduce((acc, property) => {
    const status = getReportStatus(property, ["availability_status", "occupancy_status", "status"]);
    const label = ({ active: "Active", available: "Available", vacant: "Vacant", occupied: "Occupied", rented: "Occupied", leased: "Occupied", "under-review": "Under Review", pending: "Pending", unspecified: "Unspecified", unknown: "Unspecified" })[status]
      || status.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return <DistributionDonutChart data={data} emptyLabel="No property status data available" />;
};

export default PropertyStatusChart;

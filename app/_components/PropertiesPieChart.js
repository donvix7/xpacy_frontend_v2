import DistributionDonutChart from "./DistributionDonutChart";
import { toReportArray } from "@/app/_lib/report-utils";

const PropertiesPieChart = ({ properties = [] }) => {
  const purposeCounts = toReportArray(properties).reduce((acc, property) => {
    const purpose = String(property.property_status || property.purpose || property.listing_type || property.type || "Unspecified").trim().toLowerCase().replace(/[_-]+/g, " ");
    const label = /rent/.test(purpose) ? (purpose.includes("short") ? "Shortlet" : "For Rent")
      : /sale|buy/.test(purpose) ? "For Sale"
      : purpose === "unspecified" ? "Unspecified"
      : purpose.replace(/\b\w/g, (letter) => letter.toUpperCase());
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(purposeCounts).map(([name, value]) => ({
    name,
    value,
  }));
  return <DistributionDonutChart data={data} emptyLabel="No properties available" />;
};

export default PropertiesPieChart;

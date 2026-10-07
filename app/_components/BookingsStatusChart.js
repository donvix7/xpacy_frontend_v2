import DistributionDonutChart from "./DistributionDonutChart";
import { getReportStatus, toReportArray } from "@/app/_lib/report-utils";

const BookingsStatusChart = ({ bookings = [] }) => {
  const counts = toReportArray(bookings).reduce((acc, booking) => {
    const rawStatus = getReportStatus(booking, ["booking_status", "status"]);
    const status = rawStatus === "canceled" ? "cancelled" : rawStatus;
    const label = ({ confirmed: "Confirmed", active: "Active", pending: "Pending", completed: "Completed", cancelled: "Cancelled", canceled: "Cancelled", reserved: "Reserved", rejected: "Rejected", expired: "Expired", unspecified: "Unspecified", unknown: "Unspecified" })[status]
      || status.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return <DistributionDonutChart data={data} emptyLabel="No booking status data available" />;
};

export default BookingsStatusChart;

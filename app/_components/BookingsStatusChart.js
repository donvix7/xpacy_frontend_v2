import DistributionDonutChart from "./DistributionDonutChart";

const BookingsStatusChart = ({ bookings = [] }) => {
  const counts = bookings.reduce((acc, booking) => {
    const status = (booking.status || booking.payment_status || "pending").toLowerCase();
    let label = "Other";
    if (status === "confirmed") label = "Confirmed";
    else if (status === "active") label = "Active";
    else if (status === "pending") label = "Pending";
    else if (status === "completed") label = "Completed";
    else if (status === "cancelled" || status === "canceled") label = "Cancelled";
    else if (status === "rented") label = "Rented";
    else if (status === "available") label = "Available";
    else if (status === "paid") label = "Paid";
    else if (status === "reserved") label = "Reserved";
    else if (status !== "unknown") label = status.charAt(0).toUpperCase() + status.slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return <DistributionDonutChart data={data} emptyLabel="No booking status data available" />;
};

export default BookingsStatusChart;
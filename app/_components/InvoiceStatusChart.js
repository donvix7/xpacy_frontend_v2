import DistributionDonutChart from "./DistributionDonutChart";

const InvoiceStatusChart = ({ invoices = [], currency = false }) => {
  const groups = invoices.reduce((acc, invoice) => {
    const status = (invoice.status || "pending").toLowerCase();
    const amount = parseFloat(invoice.amount) || 0;
    acc[status] = (acc[status] || 0) + amount;
    return acc;
  }, {});

  const data = Object.entries(groups).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value),
  }));

  return (
    <DistributionDonutChart
      data={data}
      emptyLabel="No invoice data available"
      format={currency ? "currency" : undefined}
    />
  );
};

export default InvoiceStatusChart;
import DistributionDonutChart from "./DistributionDonutChart";
import { getReportInvoiceTotal, getReportStatus, toReportArray } from "@/app/_lib/report-utils";

const STATUS_LABELS = {
  paid: "Paid", pending: "Pending", overdue: "Overdue", partial: "Partially Paid",
  "partially-paid": "Partially Paid", cancelled: "Cancelled", canceled: "Cancelled",
  refunded: "Refunded", draft: "Draft", unpaid: "Unpaid",
};

const InvoiceStatusChart = ({ invoices = [], currency = false }) => {
  const groups = toReportArray(invoices).reduce((acc, invoice) => {
    const rawStatus = getReportStatus(invoice, ["payment_status", "invoice_status", "status"]);
    const status = ({ partial: "partially-paid", canceled: "cancelled" })[rawStatus] || rawStatus;
    acc[status] = (acc[status] || 0) + getReportInvoiceTotal(invoice);
    return acc;
  }, {});
  const data = Object.entries(groups).map(([status, value]) => ({
    name: STATUS_LABELS[status] || status.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    value,
  }));
  return <DistributionDonutChart data={data} emptyLabel="No invoice data available" format={currency ? "currency" : undefined} />;
};

export default InvoiceStatusChart;

import { getInvoiceList, getManagedProperties } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaClock, FaDollarSign, FaFileInvoice } from "react-icons/fa6";

export default async function Page() {
  const [propertiesData, invoicesData] = await Promise.all([
    getManagedProperties(10000),
    getInvoiceList(),
  ]);
  const properties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];
  const rentProperties = properties.filter((property) => String(property.purpose || property.listingType || "").toLowerCase().includes("rent"));
  const rentInvoices = invoices.filter((invoice) => `${invoice.reason || ""} ${invoice.type || ""}`.toLowerCase().includes("rent"));
  const paid = rentInvoices.filter((invoice) => String(invoice.status || "").toLowerCase() === "paid");
  const pending = rentInvoices.filter((invoice) => String(invoice.status || "").toLowerCase() === "pending");
  const total = (items) => items.reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
  const cards = [
    { label: "Rent Properties", value: rentProperties.length, color: "bg-blue-100", icon: <FaBuilding className="w-5 h-5 text-blue-700" /> },
    { label: "Collected", value: total(paid).toLocaleString(), color: "bg-green-100", icon: <FaDollarSign className="w-5 h-5 text-green-700" /> },
    { label: "Pending", value: total(pending).toLocaleString(), color: "bg-amber-100", icon: <FaClock className="w-5 h-5 text-amber-700" /> },
    { label: "Rent Invoices", value: rentInvoices.length, color: "bg-pink-100", icon: <FaFileInvoice className="w-5 h-5 text-pink-700" /> },
  ];

  return (
    <div className="space-y-8 p-2">
      <h1 className="text-[28px] font-bold text-primary lg:text-4xl">Rents</h1>
      <SummaryCards cards={cards} />
      <DashboardGridItem title="Rent Collection">
        {rentInvoices.length === 0 ? <EmptyState message="No rent records found. Rent invoices will appear here once available." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-primary-200"><th className="px-4 py-3 text-sm font-semibold text-gray-600">Invoice</th><th className="px-4 py-3 text-sm font-semibold text-gray-600">Amount</th><th className="px-4 py-3 text-sm font-semibold text-gray-600">Date</th><th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th></tr></thead>
              <tbody>{rentInvoices.slice(0, 20).map((invoice, index) => <tr key={invoice.id || invoice._id || index} className="border-b border-primary-100"><td className="px-4 py-3">{invoice.invoice_number || invoice.id || `INV-${index + 1}`}</td><td className="px-4 py-3">{Number(invoice.amount || 0).toLocaleString()}</td><td className="px-4 py-3">{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}</td><td className="px-4 py-3 capitalize">{invoice.status || "Pending"}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </DashboardGridItem>
    </div>
  );
}

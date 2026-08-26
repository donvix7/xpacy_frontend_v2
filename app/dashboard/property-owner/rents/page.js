import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerInvoices,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerInvoices(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const invoices = results[2].status === "fulfilled" ? results[2].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);
    const myInvoices = Array.isArray(invoices) ? invoices : [];

    const rentProperties = properties.filter(p => (p.purpose || "").toLowerCase() === "rent");
    const rentInvoices = myInvoices.filter(inv => (inv.reason || inv.type || "").toLowerCase().includes("rent"));
    const paidRent = rentInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid");
    const pendingRent = rentInvoices.filter(inv => (inv.status || "").toLowerCase() === "pending");
    const totalCollected = paidRent.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const totalPending = pendingRent.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    const summaryCards = [
        { label: "Rent Properties", value: rentProperties.length, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{rentProperties.length}</span> },
        { label: "Collected", value: `$${totalCollected.toLocaleString()}`, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Pending", value: `$${totalPending.toLocaleString()}`, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Total Invoices", value: rentInvoices.length, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">{rentInvoices.length}</span> },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Rents</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Rent Collection">
                {rentInvoices.length === 0 ? (
                    <EmptyState message="No rent records found. Rent invoices will appear here once properties are leased." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary-200">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Invoice</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentInvoices.slice(0, 20).map((inv, i) => (
                                    <tr key={inv.id || inv._id || i} className="border-b border-primary-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium">{inv.invoice_number || inv.id || `INV-${i + 1}`}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">${parseFloat(inv.amount || 0).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${(inv.status || "").toLowerCase() === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {inv.status || "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}

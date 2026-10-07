import { cookies } from "next/headers";
import { FileText, CalendarDays, Wallet } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import SummaryCards from "@/app/_components/SummaryCards";
import { getMyLeases } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

const headers = [
    { heading: "Lease" },
    { heading: "Property / Unit" },
    { heading: "Term" },
    { heading: "Rent", center: true },
    { heading: "Status", center: true },
];

const valueFrom = (lease, keys, fallback = "—") => {
    for (const key of keys) {
        const value = key.split(".").reduce((object, part) => object?.[part], lease);
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
};

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

const statusOf = (lease) => String(valueFrom(lease, ["status", "leaseStatus"], "Unknown"));
const leaseTitle = (lease, index) => valueFrom(lease, ["leaseNumber", "lease_number", "reference", "id", "_id"], `Lease ${index + 1}`);
const propertyName = (lease) => {
    const value = valueFrom(lease, [
        "property.name", "property.title", "property.property_name", "propertyName", "propertyTitle",
        "unit.name", "unit.unitName", "unitId", "unit_id",
    ]);
    return typeof value === "object" ? value?.name || value?.unitName || value?.title || "—" : value;
};
const startDate = (lease) => valueFrom(lease, ["startDate", "start_date", "leaseStartDate"], "");
const endDate = (lease) => valueFrom(lease, ["endDate", "end_date", "leaseEndDate"], "");
const rentAmount = (lease) => valueFrom(lease, ["rentAmount", "rent_amount", "monthlyRent", "amount"], null);

const StatusBadge = ({ status }) => {
    const normalized = status.toLowerCase();
    const tone = ["active", "current", "confirmed"].includes(normalized)
        ? "bg-green-100 text-green-700"
        : ["pending", "draft"].includes(normalized)
            ? "bg-amber-100 text-amber-800"
            : ["expired", "terminated", "cancelled", "canceled"].includes(normalized)
                ? "bg-gray-100 text-gray-600"
                : "bg-blue-50 text-blue-700";

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${tone}`}>{status}</span>;
};

export default async function UserLeasesPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const leases = await getMyLeases();
    const list = Array.isArray(leases) ? leases : [];

    const activeCount = list.filter((lease) => ["active", "current", "confirmed"].includes(statusOf(lease).toLowerCase())).length;
    const pendingCount = list.filter((lease) => ["pending", "draft"].includes(statusOf(lease).toLowerCase())).length;
    const endedCount = list.filter((lease) => ["expired", "terminated", "cancelled", "canceled"].includes(statusOf(lease).toLowerCase())).length;

    const summaryCards = [
        { label: "All leases", value: list.length, color: "bg-primary-100", icon: <FileText className="h-5 w-5 text-primary-700" /> },
        { label: "Active", value: activeCount, color: "bg-green-100", icon: <CalendarDays className="h-5 w-5 text-green-700" /> },
        { label: "Pending", value: pendingCount, color: "bg-amber-100", icon: <Wallet className="h-5 w-5 text-amber-700" /> },
        { label: "Ended", value: endedCount, color: "bg-gray-100", icon: <FileText className="h-5 w-5 text-gray-600" /> },
    ];

    const renderRow = (lease, index) => (
        <tr key={lease.id || lease._id || index} className="border-b border-gray-100 text-sm last:border-0">
            <td className="p-4 font-medium text-gray-900">{leaseTitle(lease, index)}</td>
            <td className="p-4 text-gray-600">{propertyName(lease)}</td>
            <td className="p-4 text-gray-600">{formatDate(startDate(lease))} – {formatDate(endDate(lease))}</td>
            <td className="p-4 text-center text-gray-900">{rentAmount(lease) === null ? "—" : formatCurrency(rentAmount(lease))}</td>
            <td className="p-4 text-center"><StatusBadge status={statusOf(lease)} /></td>
        </tr>
    );

    const renderMobileCard = (lease, index) => (
        <article key={lease.id || lease._id || index} className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-gray-900">{leaseTitle(lease, index)}</p>
                    <p className="mt-1 break-words text-sm text-gray-600">{propertyName(lease)}</p>
                </div>
                <StatusBadge status={statusOf(lease)} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                <div>
                    <dt className="text-xs text-gray-500">Lease term</dt>
                    <dd className="mt-1 text-gray-800">{formatDate(startDate(lease))} – {formatDate(endDate(lease))}</dd>
                </div>
                <div>
                    <dt className="text-xs text-gray-500">Rent</dt>
                    <dd className="mt-1 font-medium text-gray-900">{rentAmount(lease) === null ? "—" : formatCurrency(rentAmount(lease))}</dd>
                </div>
                {valueFrom(lease, ["billingCycle", "billing_cycle"], "") && (
                    <div className="col-span-2">
                        <dt className="text-xs text-gray-500">Billing cycle</dt>
                        <dd className="mt-1 capitalize text-gray-800">{String(valueFrom(lease, ["billingCycle", "billing_cycle"])).toLowerCase()}</dd>
                    </div>
                )}
            </dl>
        </article>
    );

    return (
        <div className="space-y-6 p-2">
            <div>
                <p className="text-2xl font-bold text-primary sm:text-3xl">My leases</p>
                <p className="mt-1 text-sm text-gray-500">View your lease agreements, terms, and current status.</p>
            </div>
            <SummaryCards cards={summaryCards} title="Lease summary" />
            <DashboardGridItem title="Lease agreements">
                {list.length === 0 ? (
                    <EmptyState message="No leases found. Your lease agreements will appear here when they are available." cta="Browse properties" link="/listings" />
                ) : (
                    <DataTable
                        headers={headers}
                        data={list}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No leases found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

import Link from "next/link";
import { cookies } from "next/headers";
import { FileText, CalendarDays, Wallet, ChevronLeft } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import SummaryCards from "@/app/_components/SummaryCards";
import StatusChips from "@/app/_components/StatusChips";
import { getLeaseById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

const headers = [
    { heading: "Lease" },
    { heading: "Unit" },
    { heading: "Tenant" },
    { heading: "Term" },
    { heading: "Rent", center: true },
    { heading: "Status", center: true },
    { heading: "" },
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

const leaseTitle = (lease, index) =>
    valueFrom(lease, ["leaseNumber", "lease_number", "reference", "id", "_id"], `Lease ${index + 1}`);

const unitDisplay = (lease) => {
    if (lease.unit?.unitNumber) return `Unit ${lease.unit.unitNumber}`;
    if (lease.unit?.name) return lease.unit.name;
    return valueFrom(lease, ["unit.name", "unit.unitName", "unitName"], "—");
};

const tenantName = (lease) => {
    const tp = lease.tenantProfile || lease.tenant || {};
    const name = [tp.firstName || tp.firstname, tp.lastName || tp.lastname].filter(Boolean).join(" ");
    return name || tp.name || tp.email || "—";
};

const startDate = (lease) => valueFrom(lease, ["startDate", "start_date", "leaseStartDate"], "");
const endDate = (lease) => valueFrom(lease, ["endDate", "end_date", "leaseEndDate"], "");
const rentAmount = (lease) => valueFrom(lease, ["rentAmount", "rent_amount", "monthlyRent", "amount"], null);

export default async function UserLeasesPage({ params }) {
    const { id } = await params;

    const leases = await getLeaseById(id);
    const list = Array.isArray(leases) ? leases : leases && typeof leases === "object" ? [leases] : [];

    const normalizedStatus = (lease) => statusOf(lease).toLowerCase();

    const activeCount = list.filter((lease) =>
        ["active", "current", "confirmed"].includes(normalizedStatus(lease))
    ).length;
    const pendingCount = list.filter((lease) =>
        ["pending", "draft"].includes(normalizedStatus(lease))
    ).length;
    const endedCount = list.filter((lease) =>
        ["expired", "terminated", "cancelled", "canceled"].includes(normalizedStatus(lease))
    ).length;

    const summaryCards = [
        { label: "All leases", value: list.length, color: "bg-primary-100", icon: <FileText className="h-5 w-5 text-primary-700" /> },
        { label: "Active", value: activeCount, color: "bg-green-100", icon: <CalendarDays className="h-5 w-5 text-green-700" /> },
        { label: "Pending", value: pendingCount, color: "bg-amber-100", icon: <Wallet className="h-5 w-5 text-amber-700" /> },
        { label: "Ended", value: endedCount, color: "bg-gray-100", icon: <FileText className="h-5 w-5 text-gray-600" /> },
    ];

    const renderRow = (lease, index) => {
        const leaseId = lease.id || lease._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/leases/${leaseId}`;

        return (
            <tr key={leaseId || index} className="border-b border-gray-100 text-sm hover:bg-gray-50/60 transition-colors last:border-0 font-mono">
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {leaseTitle(lease, index)}
                    </Link>
                </td>
                <td className="p-4 text-gray-700">{unitDisplay(lease)}</td>
                <td className="p-4 text-gray-700">{tenantName(lease)}</td>
                <td className="p-4 text-gray-600">
                    {formatDate(startDate(lease))} – {formatDate(endDate(lease))}
                </td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {rentAmount(lease) === null ? "—" : formatCurrency(rentAmount(lease))}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={statusOf(lease)} />
                    </div>
                </td>
                <td className="p-4 text-right">
                    <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-100 transition-colors"
                    >
                        View details
                    </Link>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (lease, index) => {
        const leaseId = lease.id || lease._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/leases/${leaseId}`;

        return (
            <article
                key={leaseId || index}
                className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={detailsHref} className="break-words text-sm font-bold text-primary hover:underline">
                            {leaseTitle(lease, index)}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">{unitDisplay(lease)}</p>
                    </div>
                    <StatusChips status={statusOf(lease)} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div>
                        <dt className="text-xs text-gray-500">Tenant</dt>
                        <dd className="mt-1 font-medium text-gray-800">{tenantName(lease)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Rent</dt>
                        <dd className="mt-1 font-bold text-gray-900 font-mono">
                            {rentAmount(lease) === null ? "—" : formatCurrency(rentAmount(lease))}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-xs text-gray-500">Lease term</dt>
                        <dd className="mt-1 text-gray-800">
                            {formatDate(startDate(lease))} – {formatDate(endDate(lease))}
                        </dd>
                    </div>
                    {valueFrom(lease, ["billingCycle", "billing_cycle"], "") && (
                        <div className="col-span-2">
                            <dt className="text-xs text-gray-500">Billing cycle</dt>
                            <dd className="mt-1 capitalize text-gray-800">
                                {String(valueFrom(lease, ["billingCycle", "billing_cycle"])).toLowerCase()}
                            </dd>
                        </div>
                    )}
                </dl>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        View details
                    </Link>
                </div>
            </article>
        );
    };

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div>
                <Link
                    href={`/dashboard/user/my-properties/${id}`}
                    className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to property
                </Link>
                <p className="text-[28px] font-bold text-primary lg:text-4xl">Lease Agreements</p>
                <p className="mt-1 text-sm text-gray-500">
                    View and manage lease agreements associated with this property.
                </p>
            </div>
            <SummaryCards cards={summaryCards} title="Lease summary" />
            <DashboardGridItem title="Lease agreements">
                {list.length === 0 ? (
                    <EmptyState
                        message="No leases found for this property."
                        cta="Back to property"
                        link={`/dashboard/user/my-properties/${id}`}
                    />
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
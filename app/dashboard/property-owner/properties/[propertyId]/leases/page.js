import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import StatusChips from "@/app/_components/StatusChips";
import { getLeaseById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

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

export default async function PropertyLeasesPage({ params }) {
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;
    const baseHref = `/dashboard/property-owner/properties/${propertyId}`;

    const results = await Promise.allSettled([getLeaseById(propertyId)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const leases = results[0].status === "fulfilled" ? results[0].value : [];
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

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const heroStats = [
        { label: "All Leases", value: list.length, hint: "For this property" },
        { label: "Active", value: activeCount, hint: "Currently in force" },
        { label: "Pending", value: pendingCount, hint: "Awaiting activation" },
        { label: "Ended", value: endedCount, hint: "Expired or terminated" },
    ];

    const renderRow = (lease, index) => {
        const leaseId = lease.id || lease._id;
        const detailsHref = `${baseHref}/leases/${leaseId}`;

        return (
            <tr key={leaseId || index} className="border-b border-line text-sm hover:bg-soft/60 transition-colors last:border-0 font-mono">
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {leaseTitle(lease, index)}
                    </Link>
                </td>
                <td className="p-4 text-ink font-sans">{unitDisplay(lease)}</td>
                <td className="p-4 text-ink font-sans">{tenantName(lease)}</td>
                <td className="p-4 text-mute">
                    {formatDate(startDate(lease))} – {formatDate(endDate(lease))}
                </td>
                <td className="p-4 text-center font-bold text-ink">
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
                        className="inline-flex items-center gap-1 rounded-md bg-primary-50 dark:bg-primary-950/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-100 transition-colors"
                    >
                        View details
                    </Link>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (lease, index) => {
        const leaseId = lease.id || lease._id;
        const detailsHref = `${baseHref}/leases/${leaseId}`;

        return (
            <article key={leaseId || index} className="rounded-xl border border-line bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={detailsHref} className="font-mono text-sm font-semibold text-primary hover:underline block truncate">
                            {leaseTitle(lease, index)}
                        </Link>
                        <p className="mt-0.5 text-xs text-mute">{unitDisplay(lease)}</p>
                    </div>
                    <StatusChips status={statusOf(lease)} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
                    <div>
                        <dt className="text-xs text-mute">Tenant</dt>
                        <dd className="mt-1 font-medium text-ink">{tenantName(lease)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-mute">Rent</dt>
                        <dd className="mt-1 font-bold text-ink font-mono">
                            {rentAmount(lease) === null ? "—" : formatCurrency(rentAmount(lease))}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-xs text-mute">Lease term</dt>
                        <dd className="mt-1 text-ink">
                            {formatDate(startDate(lease))} – {formatDate(endDate(lease))}
                        </dd>
                    </div>
                    {valueFrom(lease, ["billingCycle", "billing_cycle"], "") && (
                        <div className="col-span-2">
                            <dt className="text-xs text-mute">Billing cycle</dt>
                            <dd className="mt-1 capitalize text-ink">
                                {String(valueFrom(lease, ["billingCycle", "billing_cycle"])).toLowerCase()}
                            </dd>
                        </div>
                    )}
                </dl>
                <div className="mt-4 pt-3 border-t border-line flex justify-end">
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
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}

            <Link
                href={baseHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to property
            </Link>

            <HeroBand
                tagline={`Leases console · ${today}`}
                title="Lease Agreements"
                description="View and manage lease agreements associated with this property — active tenancies, terms, and rent schedules in one place."
                stats={heroStats}
                actions={
                    <Link
                        href={`/admin/add-new-lease?propertyId=${encodeURIComponent(propertyId)}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        New lease
                    </Link>
                }
            />

            <DashboardGridItem title={`Lease agreements (${list.length})`}>
                {list.length === 0 ? (
                    <EmptyState
                        message="No leases found for this property."
                        cta="Back to property"
                        link={baseHref}
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

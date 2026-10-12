import Link from "next/link";
import {
    ChevronLeft,
    FileText,
    Calendar,
    Wallet,
    Building2,
    Home,
    Users,
    Clock,
    Shield,
    RefreshCw,
    DoorOpen,
    Mail,
    Phone,
    MapPin,
    Hash,
    CalendarCheck,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getLeaseById, getSingleLease, getPropertyById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};

function StatCard({ icon: Icon, label, value, subtext }) {
    return (
        <div className="flex items-center gap-3.5 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <p className="mt-0.5 text-lg font-bold text-gray-900">{value}</p>
                {subtext && (
                    <p className="mt-0.5 text-xs text-gray-400 capitalize">{subtext}</p>
                )}
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    if (!value || value === "—") return null;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-800 break-words">
                    {value}
                </dd>
            </div>
        </div>
    );
}

async function fetchLeaseData(propertyId, leaseId) {
    // 1. Try fetching the specific lease directly by leaseId
    let lease = await getSingleLease(leaseId);
    if (lease && typeof lease === "object" && (lease.id || lease._id)) {
        return lease;
    }

    // 2. Fallback: fetch leases for this property and locate the lease
    const propertyLeases = await getLeaseById(propertyId);
    if (Array.isArray(propertyLeases)) {
        return (
            propertyLeases.find((l) => l.id === leaseId || l._id === leaseId) ||
            propertyLeases[0] ||
            null
        );
    }
    if (propertyLeases && typeof propertyLeases === "object") {
        return propertyLeases;
    }

    return null;
}

export async function generateMetadata({ params }) {
    const { id, leaseId } = await params;
    const lease = await fetchLeaseData(id, leaseId);
    const leaseNumber = lease?.leaseNumber || "Lease Details";
    return {
        title: `${leaseNumber} - Lease Details`,
        description: `Details and terms for lease agreement ${leaseNumber}`,
    };
}

export default async function ViewLeaseDetailsPage({ params }) {
    const { id, leaseId } = await params;

    const [lease, property] = await Promise.all([
        fetchLeaseData(id, leaseId),
        getPropertyById(id),
    ]);

    if (!lease || typeof lease !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                <Link
                    href={`/dashboard/user/my-properties/${id}/leases`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to leases
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={FileText}
                        title="Lease not found"
                        message="This lease agreement may have expired, been removed, or the link is incorrect."
                    />
                </div>
            </div>
        );
    }

    const leaseNumber = lease.leaseNumber || `Lease #${lease.id?.slice(0, 8) || "Agreement"}`;
    const status = lease.status || "active";
    const rent = lease.rentAmount != null ? formatCurrency(lease.rentAmount) : "—";
    const deposit =
        lease.securityDeposit != null ? formatCurrency(lease.securityDeposit) : "—";
    const billingCycle = lease.billingCycle
        ? lease.billingCycle.replace(/_/g, " ").toLowerCase()
        : "monthly";

    // Tenant info
    const tp = lease.tenantProfile || lease.tenant || {};
    const tenantName =
        [tp.firstName || tp.firstname, tp.lastName || tp.lastname].filter(Boolean).join(" ") ||
        tp.name ||
        "Tenant";
    const tenantEmail = tp.email || "—";
    const tenantPhone = tp.phone || "—";

    // Unit info
    const unitNumber = lease.unit?.unitNumber
        ? `Unit ${lease.unit.unitNumber}`
        : lease.unit?.name || "—";

    // Property info
    const propertyName = property?.name || property?.property_name || "Property";
    const propertyAddress =
        property?.address ||
        [property?.city, property?.state].filter(Boolean).join(", ") ||
        "—";

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Link
                        href={`/dashboard/user/my-properties/${id}/leases`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to leases
                    </Link>
                    <p className="text-[28px] font-bold text-primary lg:text-4xl">
                        {leaseNumber}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Lease agreement for {unitNumber} • {propertyName}
                    </p>
                </div>
                <div className="mt-2">
                    <StatusChips status={status} />
                </div>
            </div>

            {/* Overview Stat Cards */}
            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Wallet}
                        label="Rent Amount"
                        value={rent}
                        subtext={`${billingCycle} cycle`}
                    />
                    <StatCard
                        icon={Shield}
                        label="Security Deposit"
                        value={deposit}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Start Date"
                        value={formatDate(lease.startDate)}
                    />
                    <StatCard
                        icon={CalendarCheck}
                        label="End Date"
                        value={formatDate(lease.endDate)}
                    />
                </div>
            </DashboardGridItem>

            {/* Details Grid */}
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Property & Unit Information */}
                <DashboardGridItem title="Property & Unit">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Home}
                            label="Property Name"
                            value={propertyName}
                        />
                        <DetailRow
                            icon={DoorOpen}
                            label="Unit"
                            value={unitNumber}
                        />
                        <DetailRow
                            icon={MapPin}
                            label="Address"
                            value={propertyAddress}
                        />
                        <DetailRow
                            icon={Hash}
                            label="Property ID"
                            value={lease.propertyId}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Tenant Information */}
                <DashboardGridItem title="Tenant Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Users}
                            label="Full Name"
                            value={tenantName}
                        />
                        <DetailRow
                            icon={Mail}
                            label="Email Address"
                            value={tenantEmail}
                        />
                        <DetailRow
                            icon={Phone}
                            label="Phone Number"
                            value={tenantPhone}
                        />
                        <DetailRow
                            icon={Hash}
                            label="Tenant Profile ID"
                            value={lease.tenantProfileId}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Lease Terms & Schedule */}
                <DashboardGridItem title="Lease Terms & Schedule">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Hash}
                            label="Lease Number"
                            value={leaseNumber}
                        />
                        <DetailRow
                            icon={Calendar}
                            label="Commencement Date"
                            value={formatDate(lease.startDate)}
                        />
                        <DetailRow
                            icon={CalendarCheck}
                            label="Expiration Date"
                            value={formatDate(lease.endDate)}
                        />
                        <DetailRow
                            icon={RefreshCw}
                            label="Renewal Date"
                            value={lease.renewalDate ? formatDate(lease.renewalDate) : "None scheduled"}
                        />
                        <DetailRow
                            icon={Clock}
                            label="Billing Cycle"
                            value={billingCycle}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Financial Details */}
                <DashboardGridItem title="Financial Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Wallet}
                            label="Rent Amount"
                            value={rent}
                        />
                        <DetailRow
                            icon={Shield}
                            label="Security Deposit"
                            value={deposit}
                        />
                        <DetailRow
                            icon={Clock}
                            label="Billing Frequency"
                            value={billingCycle ? `Every ${billingCycle.replace("ly", "")}` : "Monthly"}
                        />
                        <DetailRow
                            icon={Calendar}
                            label="Agreement Created"
                            value={formatDate(lease.createdAt)}
                        />
                    </dl>
                </DashboardGridItem>
            </div>

            {/* Terms and Conditions */}
            {lease.terms && (
                <DashboardGridItem title="Terms & Conditions">
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                        {lease.terms}
                    </p>
                </DashboardGridItem>
            )}
        </div>
    );
}

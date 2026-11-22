import Link from "next/link";
import {
    ArrowUpRight,
    BadgeCheck,
    Calendar,
    CalendarCheck,
    ChevronLeft,
    Clock,
    DoorOpen,
    FileText,
    Hash,
    Home,
    Mail,
    MapPin,
    Pencil,
    Phone,
    RefreshCw,
    Shield,
    Users,
    Wallet,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import LeaseStatusControls from "@/app/_components/LeaseStatusControls";
import StatusChips from "@/app/_components/StatusChips";
import {
    getLeaseById,
    getPropertyById,
    getSingleLease,
} from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

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

const titleCase = (value) =>
    value
        ? String(value)
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase())
        : "—";

const keyValueColumns = [
    {
        heading: "Field",
        render: (row) => {
            const Icon = row.icon;
            return (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-950/40">
                        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-mute">
                        {row.label}
                    </span>
                </div>
            );
        },
    },
    {
        heading: "Details",
        render: (row) => (
            <div
                className={`text-[13.5px] font-medium text-ink ${
                    row.mono ? "font-mono" : ""
                }`}
            >
                {row.href ? (
                    <Link
                        href={row.href}
                        className="inline-flex items-center gap-1 transition-colors hover:text-primary hover:underline"
                    >
                        <span>{row.value}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-mute" />
                    </Link>
                ) : (
                    <span>{row.value}</span>
                )}
            </div>
        ),
    },
];

async function fetchLeaseData(propertyId, leaseId) {
    let lease = await getSingleLease(leaseId);
    if (lease && typeof lease === "object" && (lease.id || lease._id)) {
        return lease;
    }

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
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;
    const leaseId = resolved?.leaseId;
    let lease = null;
    try {
        lease = await fetchLeaseData(id, leaseId);
    } catch {
        lease = null;
    }
    const leaseNumber = lease?.leaseNumber || "Lease Details";
    return {
        title: `${leaseNumber} - Lease Details`,
        description: `Details and terms for lease agreement ${leaseNumber}`,
    };
}

export default async function ViewLeaseDetailsPage({ params }) {
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;
    const leaseId = resolved?.leaseId;
    const baseHref = `/dashboard/property-owner/properties/${id}`;

    const results = await Promise.allSettled([
        fetchLeaseData(id, leaseId),
        getPropertyById(id),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const lease = results[0].status === "fulfilled" ? results[0].value : null;
    const rawProp = results[1].status === "fulfilled" ? results[1].value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;

    if (!lease || typeof lease !== "object") {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={`${baseHref}/leases`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to leases
                </Link>
                <EmptyState
                    icon={<FileText className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Lease not found"
                    message="This lease agreement may have expired, been removed, or the link is incorrect."
                />
            </div>
        );
    }

    const leaseNumber =
        lease.leaseNumber || `Lease #${lease.id?.slice(0, 8) || "Agreement"}`;
    const status = lease.status || "active";
    const rent = lease.rentAmount != null ? formatCurrency(lease.rentAmount) : "—";
    const deposit =
        lease.securityDeposit != null
            ? formatCurrency(lease.securityDeposit)
            : "—";
    const billingCycle = lease.billingCycle
        ? titleCase(lease.billingCycle)
        : "Monthly";

    // Tenant info
    const tp = lease.tenantProfile || lease.tenant || {};
    const tenantName =
        [tp.firstName || tp.firstname, tp.lastName || tp.lastname]
            .filter(Boolean)
            .join(" ") ||
        tp.name ||
        "—";
    const tenantId = tp.id || tp._id || lease.tenantProfileId || null;
    const tenantEmail = tp.email || "—";
    const tenantPhone = tp.phone || "—";

    // Unit info
    const unitId = lease.unit?.id || lease.unit?._id || lease.unitId || null;
    const unitNumber = lease.unit?.unitNumber
        ? `Unit ${lease.unit.unitNumber}`
        : lease.unit?.name || "—";

    // Property info
    const propertyName = property?.name || property?.property_name || "Property";
    const propertyAddress =
        [property?.address, property?.city, property?.state]
            .filter(Boolean)
            .join(", ") || "—";

    const filterValid = (rows) =>
        rows.filter(
            (row) =>
                row &&
                row.value !== undefined &&
                row.value !== null &&
                row.value !== "" &&
                row.value !== "—"
        );

    const leaseDetailsRows = filterValid([
        { label: "Lease Number", value: leaseNumber, icon: Hash, mono: true },
        { label: "Status", value: titleCase(status), icon: BadgeCheck },
        { label: "Rent Amount", value: rent, icon: Wallet, mono: true },
        { label: "Security Deposit", value: deposit, icon: Shield, mono: true },
        { label: "Billing Cycle", value: billingCycle, icon: Clock },
        {
            label: "Commencement Date",
            value: formatDate(lease.startDate),
            icon: Calendar,
        },
        {
            label: "Expiration Date",
            value: formatDate(lease.endDate),
            icon: CalendarCheck,
        },
        {
            label: "Renewal Date",
            value: lease.renewalDate
                ? formatDate(lease.renewalDate)
                : "None scheduled",
            icon: RefreshCw,
        },
        {
            label: "Created",
            value: formatDate(lease.createdAt),
            icon: Calendar,
        },
        {
            label: "Last Updated",
            value: formatDate(lease.updatedAt),
            icon: CalendarCheck,
        },
    ]);

    const propertyUnitRows = filterValid([
        {
            label: "Property Name",
            value: propertyName,
            icon: Home,
            href: baseHref,
        },
        {
            label: "Unit",
            value: unitNumber,
            icon: DoorOpen,
            href: unitId ? `${baseHref}/units/${encodeURIComponent(unitId)}` : null,
        },
        { label: "Address", value: propertyAddress, icon: MapPin },
    ]);

    const tenantDetailsRows = filterValid([
        {
            label: "Full Name",
            value: tenantName,
            icon: Users,
            href: tenantId
                ? `/dashboard/property-owner/tenants/${encodeURIComponent(tenantId)}`
                : null,
        },
        { label: "Email Address", value: tenantEmail, icon: Mail },
        { label: "Phone Number", value: tenantPhone, icon: Phone, mono: true },
    ]);

    const editHref = `/admin/add-new-lease?leaseId=${encodeURIComponent(
        lease.id || lease._id || leaseId
    )}&propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(
        `${baseHref}/leases/${lease.id || lease._id || leaseId}`
    )}`;

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={`${baseHref}/leases`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to leases
            </Link>

            <HeroBand
                tagline="Lease Agreement"
                title={leaseNumber}
                description={`Lease agreement for ${unitNumber !== "—" ? unitNumber : "unit"} · ${propertyName}`}
                badge={<StatusChips status={status} />}
                actions={
                    <>
                        <LeaseStatusControls
                            leaseId={lease.id || lease._id || leaseId}
                            propertyId={id}
                            organizationId={
                                lease.organizationId ||
                                property?.organizationId ||
                                property?.organization?.id ||
                                null
                            }
                            leaseNumber={leaseNumber}
                            currentStatus={status}
                        />
                        <Link
                            href={editHref}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3.5 py-2 text-xs font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit Lease
                        </Link>
                    </>
                }
                stats={[
                    {
                        label: "Rent Amount",
                        value: rent,
                        hint: `${billingCycle.toLowerCase()} cycle`,
                    },
                    {
                        label: "Security Deposit",
                        value: deposit,
                        hint: "Held deposit",
                    },
                    {
                        label: "Start Date",
                        value: formatDate(lease.startDate),
                        hint: "Commencement",
                    },
                    {
                        label: "End Date",
                        value: formatDate(lease.endDate),
                        hint: "Expiration",
                    },
                ]}
            />

            {/* Lease Information */}
            <DashboardGridItem title="Lease Information">
                <DataTable
                    data={leaseDetailsRows}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0! border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

            {/* Property & Unit Information */}
            {propertyUnitRows.length > 0 && (
                <DashboardGridItem title="Property & Unit">
                    <DataTable
                        data={propertyUnitRows}
                        columns={keyValueColumns}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        rowKey={(row) => row.label}
                    />
                </DashboardGridItem>
            )}

            {/* Tenant Information */}
            {tenantDetailsRows.length > 0 && (
                <DashboardGridItem title="Tenant Details">
                    <DataTable
                        data={tenantDetailsRows}
                        columns={keyValueColumns}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        rowKey={(row) => row.label}
                    />
                </DashboardGridItem>
            )}

            {/* Terms and Conditions */}
            {lease.terms && (
                <DashboardGridItem title="Terms & Conditions">
                    <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
                        {typeof lease.terms === "string"
                            ? lease.terms
                            : JSON.stringify(lease.terms, null, 2)}
                    </p>
                </DashboardGridItem>
            )}
        </div>
    );
}

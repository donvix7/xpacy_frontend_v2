import Link from "next/link";
import {
    ChevronLeft,
    DoorOpen,
    Building2,
    Home,
    MapPin,
    Hash,
    Wallet,
    Tag,
    Activity,
    Calendar,
    Clock,
    BedDouble,
    Bath,
    Ruler,
    Sofa,
    Layers,
    FileText,
    TrendingUp,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getUnitById, getPropertyById } from "@/app/_lib/data-services";
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

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

const titleCase = (value) =>
    typeof value === "string" && value.length
        ? value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : value || "—";

const yesNo = (value) => (value === true ? "Yes" : value === false ? "No" : "—");

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
                    <p className="mt-0.5 text-xs text-gray-400 capitalize">
                        {subtext}
                    </p>
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

async function fetchUnitData(unitId) {
    const res = await getUnitById(unitId);
    // Handle both { data: {...} } and raw object shapes
    const unit = res?.data ?? res;
    if (unit && typeof unit === "object" && (unit.id || unit._id)) {
        return unit;
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { unitId } = await params;
    const unit = await fetchUnitData(unitId);
    const label = unit?.unitNumber ? `Unit ${unit.unitNumber}` : "Unit Details";
    return {
        title: `${label} - Unit Details`,
        description: `Details for ${label}`,
    };
}

export default async function ViewUnitDetailsPage({ params }) {
    const { id, buildingId, unitId } = await params;

    const unit = await fetchUnitData(unitId);

    const property = unit?.propertyId
        ? await getPropertyById(unit.propertyId || id)
        : id
        ? await getPropertyById(id)
        : null;

    if (!unit || typeof unit !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                <Link
                    href={`/dashboard/user/my-properties/${id}/buildings/${buildingId}/units`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to units
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={DoorOpen}
                        title="Unit not found"
                        message="This unit may have been removed, or the link is incorrect."
                    />
                </div>
            </div>
        );
    }

    const unitLabel = unit.unitNumber
        ? `Unit ${unit.unitNumber}`
        : `Unit ${unit.id?.slice(0, 8) || ""}`;
    const unitType = titleCase(unit.unitType);
    const unitStatus = unit.status || "Unknown";

    // Financials
    const monthlyRent =
        unit.monthlyRent != null ? formatCurrency(unit.monthlyRent) : "—";
    const yearlyRent =
        unit.monthlyRent != null
            ? formatCurrency(Number(unit.monthlyRent) * 12)
            : "—";
    const securityDeposit =
        unit.securityDeposit != null
            ? formatCurrency(unit.securityDeposit)
            : "—";
    const salePrice =
        unit.salePrice != null ? formatCurrency(unit.salePrice) : "—";
    const shortletPrice =
        unit.shortletPrice != null
            ? formatCurrency(unit.shortletPrice)
            : "—";

    // Specs
    const bedrooms = unit.bedrooms != null ? unit.bedrooms : "—";
    const bathrooms = unit.bathrooms != null ? unit.bathrooms : "—";
    const squareMeters =
        unit.squareMeters != null ? `${unit.squareMeters} m²` : "—";
    const floor = unit.floor != null ? unit.floor : "—";
    const furnished = yesNo(unit.furnished);

    // Building info
    const building = unit.building || {};
    const buildingId2 = unit.buildingId || building.id || buildingId;
    const buildingName = building.name || "Building";

    // Property info
    const propertyName =
        property?.name || property?.property_name || "Property";
    const propertyAddress =
        property?.address ||
        [property?.city, property?.state].filter(Boolean).join(", ") ||
        "—";

    // Lists
    const listings = Array.isArray(unit.listings) ? unit.listings : [];
    const leases = Array.isArray(unit.leases) ? unit.leases : [];

    const leaseHeaders = [
        { heading: "Lease" },
        { heading: "Tenant" },
        { heading: "Start" },
        { heading: "End" },
        { heading: "Rent", center: true },
        { heading: "Status", center: true },
        { heading: "" },
    ];

    const renderLeaseRow = (lease, index) => {
        const leaseId = lease.id || lease._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/buildings/${buildingId2}/units/${unit.id}/leases/${leaseId}`;
        const tenant = lease.tenantProfile || lease.tenant || {};
        const tenantName =
            [tenant.firstName, tenant.lastName].filter(Boolean).join(" ") ||
            tenant.name ||
            "—";

        return (
            <tr
                key={leaseId || index}
                className="border-b border-gray-100 text-sm hover:bg-gray-50/60 transition-colors last:border-0 font-mono"
            >
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {lease.leaseNumber || `Lease ${index + 1}`}
                    </Link>
                </td>
                <td className="p-4 text-gray-700">{tenantName}</td>
                <td className="p-4 text-gray-600">
                    {formatDate(lease.startDate)}
                </td>
                <td className="p-4 text-gray-600">
                    {formatDate(lease.endDate)}
                </td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {lease.rentAmount != null
                        ? formatCurrency(lease.rentAmount)
                        : "—"}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={lease.status} />
                    </div>
                </td>
                <td className="p-4 text-right">
                    <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-100 transition-colors"
                    >
                        View
                    </Link>
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Link
                        href={`/dashboard/user/my-properties/${id}/buildings/${buildingId2}/units`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to units
                    </Link>
                    <p className="text-[28px] font-bold text-primary lg:text-4xl">
                        {unitLabel}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {unitType} • {buildingName} • {propertyName}
                    </p>
                </div>
                <div className="mt-2">
                    <StatusChips status={unitStatus} />
                </div>
            </div>

            {/* Overview Stat Cards */}
            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={BedDouble}
                        label="Bedrooms"
                        value={bedrooms}
                    />
                    <StatCard
                        icon={Bath}
                        label="Bathrooms"
                        value={bathrooms}
                    />
                    <StatCard
                        icon={Ruler}
                        label="Size"
                        value={squareMeters}
                    />
                    <StatCard
                        icon={Layers}
                        label="Floor"
                        value={floor}
                    />
                </div>
            </DashboardGridItem>

            {/* Details Grid */}
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Unit Information */}
                <DashboardGridItem title="Unit Information">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={DoorOpen}
                            label="Unit Number"
                            value={unit.unitNumber}
                        />
                        <DetailRow
                            icon={Tag}
                            label="Unit Type"
                            value={unitType}
                        />
                        <DetailRow
                            icon={Activity}
                            label="Status"
                            value={unitStatus}
                        />
                        <DetailRow
                            icon={Layers}
                            label="Floor"
                            value={floor}
                        />
                        <DetailRow
                            icon={Sofa}
                            label="Furnished"
                            value={furnished}
                        />
                        <DetailRow
                            icon={Hash}
                            label="Unit ID"
                            value={unit.id}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Location */}
                <DashboardGridItem title="Location">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Building2}
                            label="Building"
                            value={buildingName}
                        />
                        <DetailRow
                            icon={Hash}
                            label="Building ID"
                            value={buildingId2}
                        />
                        <DetailRow
                            icon={Home}
                            label="Property"
                            value={propertyName}
                        />
                        <DetailRow
                            icon={MapPin}
                            label="Address"
                            value={propertyAddress}
                        />
                        <DetailRow
                            icon={Hash}
                            label="Property ID"
                            value={unit.propertyId || id}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Financial Details */}
                <DashboardGridItem title="Financial Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Wallet}
                            label="Monthly Rent"
                            value={monthlyRent}
                        />
                        <DetailRow
                            icon={Wallet}
                            label="Yearly Rent"
                            value={yearlyRent}
                        />
                        <DetailRow
                            icon={Wallet}
                            label="Security Deposit"
                            value={securityDeposit}
                        />
                        <DetailRow
                            icon={TrendingUp}
                            label="Sale Price"
                            value={salePrice}
                        />
                        <DetailRow
                            icon={Wallet}
                            label="Shortlet Price"
                            value={shortletPrice}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Timeline */}
                <DashboardGridItem title="Timeline">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Calendar}
                            label="Created At"
                            value={formatDateTime(unit.createdAt)}
                        />
                        <DetailRow
                            icon={Clock}
                            label="Last Updated"
                            value={formatDateTime(unit.updatedAt)}
                        />
                    </dl>
                </DashboardGridItem>
            </div>

            {/* Description */}
            <DashboardGridItem title="Description">
                {unit.description ? (
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                        {unit.description}
                    </p>
                ) : (
                    <p className="text-sm italic text-gray-400">
                        No description provided for this unit.
                    </p>
                )}
            </DashboardGridItem>

            {/* Leases */}
            <DashboardGridItem title="Lease History">
                {leases.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No leases"
                        message="This unit has no lease history yet."
                    />
                ) : (
                    <DataTable
                        headers={leaseHeaders}
                        data={leases}
                        renderRow={renderLeaseRow}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No leases found."
                    />
                )}
            </DashboardGridItem>

            {/* Listings */}
            {listings.length > 0 && (
                <DashboardGridItem title="Listings">
                    <p className="text-sm text-gray-600">
                        {listings.length} listing
                        {listings.length > 1 ? "s" : ""} associated with this
                        unit.
                    </p>
                </DashboardGridItem>
            )}
        </div>
    );
}
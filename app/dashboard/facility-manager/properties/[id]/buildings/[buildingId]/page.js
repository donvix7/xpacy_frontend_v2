import Link from "next/link";
import {
    ChevronLeft,
    Building2,
    Layers,
    DoorOpen,
    Calendar,
    Clock,
    Hash,
    Home,
    MapPin,
    Wallet,
    TrendingUp,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getBuildingById, getPropertyById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

const unitHeaders = [
    { heading: "Unit" },
    { heading: "Type" },
    { heading: "Monthly Rent", center: true },
    { heading: "Status", center: true },
    { heading: "" },
];

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
        : value;

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

async function fetchBuildingData(buildingId) {
    const building = await getBuildingById(buildingId);
    if (building && typeof building === "object" && (building.id || building._id)) {
        return building;
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { buildingId } = await params;
    const building = await fetchBuildingData(buildingId);
    const name = building?.name || "Building Details";
    return {
        title: `${name} - Building Details`,
        description: `Details and units for building ${name}`,
    };
}

export default async function ViewBuildingDetailsPage({ params }) {
    const { id, buildingId } = await params;

    const building = await fetchBuildingData(buildingId);

    const property = building?.propertyId
        ? await getPropertyById(building.propertyId || id)
        : null;

    if (!building || typeof building !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                <Link
                    href={`/dashboard/user/my-properties/${id}/buildings`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to buildings
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={Building2}
                        title="Building not found"
                        message="This building may have been removed, or the link is incorrect."
                    />
                </div>
            </div>
        );
    }

    const buildingName =
        building.name || `Building ${building.id?.slice(0, 8) || ""}`;
    const totalFloors =
        building.totalFloors != null ? building.totalFloors : "—";

    // Units
    const units = Array.isArray(building.units) ? building.units : [];
    const totalUnits = building?._count?.units ?? units.length;

    // Unit-derived stats
    const availableUnits = units.filter(
        (u) => String(u.status || "").toLowerCase() === "available"
    ).length;
    const occupiedUnits = units.filter((u) =>
        ["occupied", "rented", "leased"].includes(
            String(u.status || "").toLowerCase()
        )
    ).length;

    const rents = units
        .map((u) => Number(u.monthlyRent))
        .filter((n) => Number.isFinite(n));
    const avgRent = rents.length
        ? rents.reduce((sum, n) => sum + n, 0) / rents.length
        : null;
    const totalMonthlyRent = rents.reduce((sum, n) => sum + n, 0);

    // Property info
    const propertyName = property?.name || property?.property_name || "Property";
    const propertyAddress =
        property?.address ||
        [property?.city, property?.state].filter(Boolean).join(", ") ||
        "—";

    const renderUnitRow = (unit, index) => {
        const unitId = unit.id || unit._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/units/${unitId}`;

        return (
            <tr
                key={unitId || index}
                className="border-b border-gray-100 text-sm hover:bg-gray-50/60 transition-colors last:border-0 font-mono"
            >
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        Unit {unit.unitNumber || "—"}
                    </Link>
                </td>
                <td className="p-4 text-gray-700">
                    {titleCase(unit.unitType) || "—"}
                </td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {unit.monthlyRent != null
                        ? formatCurrency(unit.monthlyRent)
                        : "—"}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={unit.status} />
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

    const renderUnitMobileCard = (unit, index) => {
        const unitId = unit.id || unit._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/buildings/${building.id}/units/${unitId}`;

        return (
            <article
                key={unitId || index}
                className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={detailsHref}
                            className="break-words text-sm font-bold text-primary hover:underline"
                        >
                            Unit {unit.unitNumber || "—"}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">
                            {titleCase(unit.unitType) || "—"}
                        </p>
                    </div>
                    <StatusChips status={unit.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div className="col-span-2">
                        <dt className="text-xs text-gray-500">Monthly Rent</dt>
                        <dd className="mt-1 font-bold text-gray-900 font-mono">
                            {unit.monthlyRent != null
                                ? formatCurrency(unit.monthlyRent)
                                : "—"}
                        </dd>
                    </div>
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
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Link
                        href={`/dashboard/user/my-properties/${id}/buildings`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to buildings
                    </Link>
                    <p className="text-[28px] font-bold text-primary lg:text-4xl">
                        {buildingName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Building • {propertyName}
                    </p>
                </div>
            </div>

            {/* Overview Stat Cards */}
            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Layers}
                        label="Total Floors"
                        value={totalFloors}
                    />
                    <StatCard
                        icon={DoorOpen}
                        label="Total Units"
                        value={totalUnits}
                        subtext={
                            occupiedUnits
                                ? `${occupiedUnits} occupied`
                                : availableUnits
                                ? `${availableUnits} available`
                                : null
                        }
                    />
                    <StatCard
                        icon={Wallet}
                        label="Avg Monthly Rent"
                        value={avgRent != null ? formatCurrency(avgRent) : "—"}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Total Monthly Rent"
                        value={
                            totalMonthlyRent
                                ? formatCurrency(totalMonthlyRent)
                                : "—"
                        }
                    />
                </div>
            </DashboardGridItem>

            {/* Details Grid */}
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Building Information */}
                <DashboardGridItem title="Building Information">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Building2}
                            label="Building Name"
                            value={buildingName}
                        />
                        <DetailRow
                            icon={Layers}
                            label="Total Floors"
                            value={totalFloors}
                        />
                        <DetailRow
                            icon={DoorOpen}
                            label="Total Units"
                            value={totalUnits}
                        />
                        <DetailRow
                            icon={Hash}
                            label="Building ID"
                            value={building.id}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Property */}
                <DashboardGridItem title="Property">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Home}
                            label="Property Name"
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
                            value={building.propertyId || id}
                        />
                    </dl>
                </DashboardGridItem>

                {/* Timeline */}
                <DashboardGridItem title="Timeline">
                    <dl className="flex flex-col gap-4">
                        <DetailRow
                            icon={Calendar}
                            label="Created At"
                            value={formatDateTime(building.createdAt)}
                        />
                        <DetailRow
                            icon={Clock}
                            label="Last Updated"
                            value={formatDateTime(building.updatedAt)}
                        />
                    </dl>
                </DashboardGridItem>
            </div>

            {/* Description */}
            <DashboardGridItem title="Description">
                {building.description ? (
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                        {building.description}
                    </p>
                ) : (
                    <p className="text-sm italic text-gray-400">
                        No description provided for this building.
                    </p>
                )}
            </DashboardGridItem>

            {/* Units */}
            <DashboardGridItem title="Units">
                {units.length === 0 ? (
                    <EmptyState
                        icon={DoorOpen}
                        title="No units"
                        message="This building doesn't have any units yet."
                    />
                ) : (
                    <DataTable
                        headers={unitHeaders}
                        data={units}
                        renderRow={renderUnitRow}
                        renderMobileCard={renderUnitMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No units found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
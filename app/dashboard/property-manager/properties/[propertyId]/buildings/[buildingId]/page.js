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
    Pencil,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import DeleteBuildingButton from "@/app/_components/DeleteBuildingButton";
import StatusChips from "@/app/_components/StatusChips";
import { getBuildingById, getPropertyById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages, toDataServiceError } from "@/app/_lib/api-error";

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
            <div className="text-[13.5px] font-medium text-ink">
                {row.href ? (
                    <Link
                        href={row.href}
                        className="transition-colors hover:text-primary hover:underline"
                    >
                        {row.value}
                    </Link>
                ) : (
                    <span>{row.value}</span>
                )}
            </div>
        ),
    },
];

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
    let building = null;
    try {
        building = await fetchBuildingData(buildingId);
    } catch {
        building = null;
    }
    const name = building?.name || "Building Details";
    return {
        title: `${name} - Building Details`,
        description: `Details and units for building ${name}`,
    };
}

export default async function ViewBuildingDetailsPage({ params }) {
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;
    const buildingId = resolved?.buildingId;

    const dataErrorMessages = [];

    let building = null;
    try {
        building = await fetchBuildingData(buildingId);
    } catch (error) {
        dataErrorMessages.push(toDataServiceError(error, "getBuildingById").message);
    }

    let property = null;
    if (building?.propertyId) {
        try {
            property = await getPropertyById(building.propertyId || id);
        } catch (error) {
            dataErrorMessages.push(toDataServiceError(error, "getPropertyById").message);
        }
    }

    if (!building || typeof building !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
                <Link
                    href={`/dashboard/property-owner/properties/${id}/buildings`}
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
        const detailsHref = `/dashboard/property-owner/properties/${id}/units/${unitId}`;

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
        const detailsHref = `/dashboard/property-owner/properties/${id}/buildings/${building.id}/units/${unitId}`;

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
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <Link
                href={`/dashboard/property-owner/properties/${id}/buildings`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to buildings
            </Link>

            <HeroBand
                tagline="Building Profile"
                title={buildingName}
                description={`Building · ${propertyName}`}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={`/admin/add-new-building?buildingId=${encodeURIComponent(building.id || buildingId)}&propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(`/dashboard/property-owner/properties/${id}/buildings/${building.id || buildingId}`)}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit building
                        </Link>
                        <DeleteBuildingButton
                            buildingId={building.id || buildingId}
                            propertyId={id}
                            buildingName={buildingName}
                            redirectTo={`/dashboard/property-owner/properties/${id}/buildings`}
                        />
                    </div>
                }
                stats={[
                    { label: "Total Floors", value: totalFloors, hint: "Building levels" },
                    {
                        label: "Total Units",
                        value: totalUnits,
                        hint: occupiedUnits
                            ? `${occupiedUnits} occupied`
                            : availableUnits
                              ? `${availableUnits} available`
                              : "In this building",
                    },
                    {
                        label: "Avg Monthly Rent",
                        value: avgRent != null ? formatCurrency(avgRent) : "—",
                        hint: "Per unit",
                    },
                    {
                        label: "Total Monthly Rent",
                        value: totalMonthlyRent ? formatCurrency(totalMonthlyRent) : "—",
                        hint: "Combined rent roll",
                    },
                ]}
            />

            {/* Building Information (DataTable) */}
            <DashboardGridItem title="Building Information">
                <DataTable
                    data={[
                        { label: "Building Name", value: buildingName, icon: Building2 },
                        { label: "Total Floors", value: String(totalFloors), icon: Layers },
                        { label: "Total Units", value: String(totalUnits), icon: DoorOpen },
                        {
                            label: "Property",
                            value: propertyName,
                            icon: Home,
                            href: `/dashboard/property-owner/properties/${id}`,
                        },
                        { label: "Address", value: propertyAddress, icon: MapPin },
                        {
                            label: "Created At",
                            value: formatDateTime(building.createdAt),
                            icon: Calendar,
                        },
                        {
                            label: "Last Updated",
                            value: formatDateTime(building.updatedAt),
                            icon: Clock,
                        },
                    ].filter(
                        ({ value }) =>
                            value !== undefined &&
                            value !== null &&
                            value !== "" &&
                            value !== "—"
                    )}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0 border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

            {/* Description */}
            <DashboardGridItem title="Description">
                {building.description ? (
                    <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
                        {building.description}
                    </p>
                ) : (
                    <p className="text-sm italic text-mute">
                        No description provided for this building.
                    </p>
                )}
            </DashboardGridItem>

            {/* Units */}
            <DashboardGridItem title={`Units (${units.length})`}>
                {units.length === 0 ? (
                    <EmptyState
                        icon={<DoorOpen className="h-10 w-10 text-primary" aria-hidden="true" />}
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
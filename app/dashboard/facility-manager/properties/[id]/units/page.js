import Link from "next/link";
import {
    DoorOpen,
    CheckCircle2,
    Users,
    Wallet,
    Plus,
    ChevronLeft,
    Building2,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import SummaryCards from "@/app/_components/SummaryCards";
import StatusChips from "@/app/_components/StatusChips";
import { getAllUnits } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

const headers = [
    { heading: "Unit" },
    { heading: "Building" },
    { heading: "Type" },
    { heading: "Monthly Rent", center: true },
    { heading: "Status", center: true },
    { heading: "" },
];

const titleCase = (value) =>
    typeof value === "string" && value.length
        ? value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : value || "—";

const unitNumber = (unit, index) =>
    unit.unitNumber ? `Unit ${unit.unitNumber}` : `Unit ${index + 1}`;

const unitBuilding = (unit) =>
    unit.building?.name || unit.buildingName || "—";

const unitType = (unit) => titleCase(unit.unitType);

const unitRent = (unit) =>
    unit.monthlyRent != null ? formatCurrency(unit.monthlyRent) : "—";

const unitStatus = (unit) => unit.status || "Unknown";

export default async function PropertyUnitsPage({ params }) {
    const { id } = await params;

    const units = await getAllUnits(id);
    const list = Array.isArray(units)
        ? units
        : units && typeof units === "object"
        ? [units]
        : [];

    const normalizedStatus = (unit) =>
        String(unit.status || "").toLowerCase();

    const availableCount = list.filter((unit) =>
        ["available", "vacant"].includes(normalizedStatus(unit))
    ).length;
    const occupiedCount = list.filter((unit) =>
        ["occupied", "rented", "leased"].includes(normalizedStatus(unit))
    ).length;
    const maintenanceCount = list.filter((unit) =>
        ["maintenance", "under-maintenance", "unavailable"].includes(
            normalizedStatus(unit)
        )
    ).length;

    const rents = list
        .map((u) => Number(u.monthlyRent))
        .filter((n) => Number.isFinite(n));
    const totalMonthlyRent = rents.reduce((sum, n) => sum + n, 0);

    const summaryCards = [
        {
            label: "All units",
            value: list.length,
            color: "bg-primary-100",
            icon: <DoorOpen className="h-5 w-5 text-primary-700" />,
        },
        {
            label: "Available",
            value: availableCount,
            color: "bg-green-100",
            icon: <CheckCircle2 className="h-5 w-5 text-green-700" />,
        },
        {
            label: "Occupied",
            value: occupiedCount,
            color: "bg-amber-100",
            icon: <Users className="h-5 w-5 text-amber-700" />,
        },
        {
            label: "Total monthly rent",
            value: formatCurrency(totalMonthlyRent),
            color: "bg-blue-100",
            icon: <Wallet className="h-5 w-5 text-blue-700" />,
        },
    ];

    const renderRow = (unit, index) => {
        const unitId = unit.id || unit._id;
        const buildingId = unit.buildingId || unit.building?.id;
        const detailsHref = buildingId
            ? `/dashboard/user/my-properties/${id}/buildings/${buildingId}/units/${unitId}`
            : `/dashboard/user/my-properties/${id}/units/${unitId}`;

        return (
            <tr
                key={unitId || index}
                className="border-b border-gray-100 text-sm hover:bg-gray-50/60 transition-colors last:border-0 font-mono"
            >
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {unitNumber(unit, index)}
                    </Link>
                </td>
                <td className="p-4 text-gray-700">
                    <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {unitBuilding(unit)}
                    </span>
                </td>
                <td className="p-4 text-gray-700">{unitType(unit)}</td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {unitRent(unit)}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={unitStatus(unit)} />
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

    const renderMobileCard = (unit, index) => {
        const unitId = unit.id || unit._id;
        const buildingId = unit.buildingId || unit.building?.id;
        const detailsHref = buildingId
            ? `/dashboard/user/my-properties/${id}/buildings/${buildingId}/units/${unitId}`
            : `/dashboard/user/my-properties/${id}/units/${unitId}`;

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
                            {unitNumber(unit, index)}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" />
                            {unitBuilding(unit)}
                        </p>
                    </div>
                    <StatusChips status={unitStatus(unit)} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div>
                        <dt className="text-xs text-gray-500">Type</dt>
                        <dd className="mt-1 font-medium text-gray-800">
                            {unitType(unit)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Monthly Rent</dt>
                        <dd className="mt-1 font-bold text-gray-900 font-mono">
                            {unitRent(unit)}
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
            <div>
                <Link
                    href={`/dashboard/user/my-properties/${id}`}
                    className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to property
                </Link>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[28px] font-bold text-primary lg:text-4xl">
                            Units
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage all units across this property.
                        </p>
                    </div>
                    <Link
                        href={`/admin/add-new-unit?propertyId=${id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        <Plus className="h-4 w-4" />
                        Add unit
                    </Link>
                </div>
            </div>

            <SummaryCards cards={summaryCards} title="Unit summary" />

            <DashboardGridItem title="Units">
                {list.length === 0 ? (
                    <EmptyState
                        message="No units found for this property."
                        cta="Add a unit"
                        link={`/admin/add-new-unit?propertyId=${id}`}
                    />
                ) : (
                    <DataTable
                        headers={headers}
                        data={list}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No units found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
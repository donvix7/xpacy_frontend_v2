import Link from "next/link";
import { Building2, Layers, DoorOpen, Plus, ChevronLeft } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import SummaryCards from "@/app/_components/SummaryCards";
import { getAllBuildings } from "@/app/_lib/data-services";

const headers = [
    { heading: "Building" },
    { heading: "Description" },
    { heading: "Floors", center: true },
    { heading: "Units", center: true },
    { heading: "Created" },
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

const buildingName = (building, index) => building.name || `Building ${index + 1}`;
const buildingDescription = (building) => building.description || "—";
const totalFloors = (building) =>
    building.totalFloors === 0 || building.totalFloors
        ? building.totalFloors
        : "—";
const unitsCount = (building) => building?._count?.units ?? "—";

export default async function PropertyBuildingsPage({ params }) {
    const { id } = await params;

    const buildings = await getAllBuildings(id);
    const list = Array.isArray(buildings)
        ? buildings
        : buildings && typeof buildings === "object"
        ? [buildings]
        : [];

    const totalFloorsSum = list.reduce(
        (sum, b) => sum + (Number(b.totalFloors) || 0),
        0
    );
    const totalUnitsSum = list.reduce(
        (sum, b) => sum + (Number(b?._count?.units) || 0),
        0
    );

    const summaryCards = [
        {
            label: "All buildings",
            value: list.length,
            color: "bg-primary-100",
            icon: <Building2 className="h-5 w-5 text-primary-700" />,
        },
        {
            label: "Total floors",
            value: totalFloorsSum,
            color: "bg-amber-100",
            icon: <Layers className="h-5 w-5 text-amber-700" />,
        },
        {
            label: "Total units",
            value: totalUnitsSum,
            color: "bg-green-100",
            icon: <DoorOpen className="h-5 w-5 text-green-700" />,
        },
    ];

    const renderRow = (building, index) => {
        const buildingId = building.id;
        const detailsHref = `/dashboard/user/my-properties/${id}/buildings/${buildingId}`;

        return (
            <tr
                key={buildingId || index}
                className="border-b border-gray-100 text-sm hover:bg-gray-50/60 transition-colors last:border-0 font-mono"
            >
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {buildingName(building, index)}
                    </Link>
                </td>
                <td className="p-4 text-gray-600 max-w-xs truncate">
                    {buildingDescription(building)}
                </td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {totalFloors(building)}
                </td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {unitsCount(building)}
                </td>
                <td className="p-4 text-gray-600">
                    {formatDate(building.createdAt)}
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

    const renderMobileCard = (building, index) => {
        const buildingId = building.id;
        const detailsHref = `/dashboard/user/my-properties/${id}/buildings/${buildingId}`;

        return (
            <article
                key={buildingId || index}
                className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={detailsHref}
                            className="break-words text-sm font-bold text-primary hover:underline"
                        >
                            {buildingName(building, index)}
                        </Link>
                        {building.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                {building.description}
                            </p>
                        )}
                    </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div>
                        <dt className="text-xs text-gray-500">Floors</dt>
                        <dd className="mt-1 font-bold text-gray-900 font-mono">
                            {totalFloors(building)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Units</dt>
                        <dd className="mt-1 font-bold text-gray-900 font-mono">
                            {unitsCount(building)}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-xs text-gray-500">Created</dt>
                        <dd className="mt-1 text-gray-800">
                            {formatDate(building.createdAt)}
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
                            Buildings
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage buildings associated with this property.
                        </p>
                    </div>
                    <Link
                        href={`/admin/add-new-building?propertyId=${id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        <Plus className="h-4 w-4" />
                        Add building
                    </Link>
                </div>
            </div>

            <SummaryCards cards={summaryCards} title="Building summary" />

            <DashboardGridItem title="Buildings">
                {list.length === 0 ? (
                    <EmptyState
                        message="No buildings found for this property."
                        cta="Add a building"
                        link={`/dashboard/user/my-properties/${id}/buildings/create`}
                    />
                ) : (
                    <DataTable
                        headers={headers}
                        data={list}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No buildings found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
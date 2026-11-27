import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import { getAllBuildings } from "@/app/_lib/data-services";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

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
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;
    const baseHref = `/dashboard/property-owner/properties/${propertyId}`;

    const results = await Promise.allSettled([getAllBuildings(propertyId)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const buildings = results[0].status === "fulfilled" ? results[0].value : [];
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
    const avgUnitsPerBuilding =
        list.length > 0 ? Math.round((totalUnitsSum / list.length) * 10) / 10 : 0;

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const heroStats = [
        {
            label: "All Buildings",
            value: list.length,
            hint: "In this property",
        },
        {
            label: "Total Floors",
            value: totalFloorsSum,
            hint: "Combined levels",
        },
        {
            label: "Total Units",
            value: totalUnitsSum,
            hint: "Across buildings",
        },
        {
            label: "Avg Units",
            value: avgUnitsPerBuilding,
            hint: "Per building",
        },
    ];

    const renderRow = (building, index) => {
        const buildingId = building.id;
        const detailsHref = `${baseHref}/buildings/${buildingId}`;

        return (
            <tr
                key={buildingId || index}
                className="border-b border-line text-sm hover:bg-soft/60 transition-colors last:border-0 font-mono"
            >
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {buildingName(building, index)}
                    </Link>
                </td>
                <td className="p-4 text-mute max-w-xs truncate font-sans">
                    {buildingDescription(building)}
                </td>
                <td className="p-4 text-center font-bold text-ink">
                    {totalFloors(building)}
                </td>
                <td className="p-4 text-center font-bold text-ink">
                    {unitsCount(building)}
                </td>
                <td className="p-4 text-mute">
                    {formatDate(building.createdAt)}
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

    const renderMobileCard = (building, index) => {
        const buildingId = building.id;
        const detailsHref = `${baseHref}/buildings/${buildingId}`;

        return (
            <article
                key={buildingId || index}
                className="rounded-xl border border-line bg-card p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={detailsHref}
                            className="font-mono text-sm font-semibold text-primary hover:underline block truncate"
                        >
                            {buildingName(building, index)}
                        </Link>
                        <p className="mt-0.5 text-xs text-mute line-clamp-2">
                            {buildingDescription(building)}
                        </p>
                    </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
                    <div>
                        <dt className="text-xs text-mute">Floors</dt>
                        <dd className="mt-1 font-bold text-ink font-mono">
                            {totalFloors(building)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-mute">Units</dt>
                        <dd className="mt-1 font-bold text-ink font-mono">
                            {unitsCount(building)}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-xs text-mute">Created</dt>
                        <dd className="mt-1 text-ink">
                            {formatDate(building.createdAt)}
                        </dd>
                    </div>
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
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={baseHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to property
            </Link>

            <HeroBand
                tagline={`Buildings console · ${today}`}
                title="Buildings"
                description="View and manage buildings associated with this property — floors, unit capacity and structure details in one place."
                stats={heroStats}
                actions={
                    <Link
                        href={`/admin/add-new-building?propertyId=${encodeURIComponent(propertyId)}&returnTo=${encodeURIComponent(`${baseHref}/buildings`)}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add building
                    </Link>
                }
            />

            <DashboardGridItem title={`Buildings (${list.length})`}>
                {list.length === 0 ? (
                    <EmptyState
                        message="No buildings found for this property."
                        cta="Add a building"
                        link={`/admin/add-new-building?propertyId=${encodeURIComponent(propertyId)}&returnTo=${encodeURIComponent(`${baseHref}/buildings`)}`}
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

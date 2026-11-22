import Link from "next/link";
import {
    DoorOpen,
    CheckCircle2,
    Users,
    Wallet,
    Plus,
    ChevronLeft,
    Building2,
    TrendingUp,
    Wrench,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getAllUnits } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

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
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;
    const baseHref = `/dashboard/property-owner/properties/${id}`;

    const results = await Promise.allSettled([getAllUnits(id)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const units = results[0].status === "fulfilled" ? results[0].value : [];
    const list = Array.isArray(units)
        ? units
        : units && typeof units === "object"
            ? [units]
            : [];

    const normalizedStatus = (unit) =>
        String(unit.status || "").toLowerCase();

    const availableCount = list.filter((unit) =>
        ["available", "vacant"].includes(normalizedStatus(unit)),
    ).length;
    const occupiedCount = list.filter((unit) =>
        ["occupied", "rented", "leased"].includes(normalizedStatus(unit)),
    ).length;
    const maintenanceCount = list.filter((unit) =>
        ["maintenance", "under-maintenance", "unavailable"].includes(
            normalizedStatus(unit),
        ),
    ).length;

    const rents = list
        .map((u) => Number(u.monthlyRent))
        .filter((n) => Number.isFinite(n));
    const totalMonthlyRent = rents.reduce((sum, n) => sum + n, 0);
    const avgMonthlyRent =
        rents.length > 0 ? Math.round(totalMonthlyRent / rents.length) : 0;

    const occupancyRate =
        list.length > 0
            ? Math.round((occupiedCount / list.length) * 100)
            : 0;

    // ---- Hero stats (4 counts) ----
    const heroStats = [
        {
            label: "All units",
            value: list.length,
            hint: "In this property",
        },
        {
            label: "Available",
            value: availableCount,
            hint: "Ready to lease",
        },
        {
            label: "Occupied",
            value: occupiedCount,
            hint: "Currently leased",
        },
        {
            label: "Maintenance",
            value: maintenanceCount,
            hint: "Under repair",
        },
    ];

    // ---- Info cards (below hero) ----
    const infoCards = [
        {
            label: "Occupancy rate",
            value: `${occupancyRate}%`,
            hint: `${occupiedCount} of ${list.length} units occupied`,
            icon: <TrendingUp className="h-4 w-4 text-white" />,
            iconBg: "bg-emerald-600",
            accent: "from-emerald-600 to-emerald-400",
        },
        {
            label: "Monthly rent",
            value: formatCurrency(totalMonthlyRent),
            hint: "Total across all units",
            icon: <Wallet className="h-4 w-4 text-white" />,
            iconBg: "bg-primary-600",
            accent: "from-primary-600 to-primary-400",
        },
        {
            label: "Avg. rent / unit",
            value: formatCurrency(avgMonthlyRent),
            hint: rents.length > 0 ? `Across ${rents.length} priced units` : "No priced units",
            icon: <DoorOpen className="h-4 w-4 text-white" />,
            iconBg: "bg-violet-600",
            accent: "from-violet-600 to-violet-400",
        },
        {
            label: "Maintenance",
            value: maintenanceCount,
            hint: maintenanceCount > 0 ? "Units needing attention" : "All units clear",
            icon: <Wrench className="h-4 w-4 text-white" />,
            iconBg: "bg-amber-500",
            accent: "from-amber-500 to-amber-300",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const renderRow = (unit, index) => {
        const unitId = unit.id || unit._id;
        const detailsHref = `/dashboard/property-owner/properties/${id}/units/${unitId}`;

        return (
            <tr
                key={unitId || index}
                className="border-b border-gray-100 text-sm font-mono transition-colors last:border-0 hover:bg-gray-50/60"
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
                        className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-100"
                    >
                        View details
                    </Link>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (unit, index) => {
        const unitId = unit.id || unit._id;
        const detailsHref = `/dashboard/property-owner/properties/${id}/units/${unitId}`;

        return (
            <article
                key={unitId || index}
                className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={detailsHref}
                            className="break-words text-sm font-bold text-primary hover:underline"
                        >
                            {unitNumber(unit, index)}
                        </Link>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
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
                        <dd className="mt-1 font-mono font-bold text-gray-900">
                            {unitRent(unit)}
                        </dd>
                    </div>
                </dl>

                <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                    <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <Link
                                href={`/dashboard/property-owner/properties/${id}`}
                                className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute transition-colors hover:text-white"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                Back to property
                            </Link>
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Units console · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                Units
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                View and manage all units across this property — occupancy, rent and status at a glance.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={`/admin/add-new-unit?propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(`/dashboard/property-owner/properties/${id}/units`)}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Add unit
                            </Link>
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                            >
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                                    {typeof stat.value === "number"
                                        ? stat.value.toLocaleString()
                                        : stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ---------- Info cards (derived metrics) ---------- */}
            {list.length > 0 && (
                <div className="grid grid-cols-1 gap-3 @container @sm:grid-cols-2 lg:grid-cols-4">
                    {infoCards.map((card) => (
                        <div
                            key={card.label}
                            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-4"
                        >
                            <div
                                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${card.accent}`}
                            />
                            <div className="relative pl-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 sm:text-[10.5px] sm:tracking-[0.14em]">
                                        {card.label}
                                    </span>
                                    <span
                                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${card.iconBg} shadow-sm sm:h-7 sm:w-7`}
                                    >
                                        {card.icon}
                                    </span>
                                </div>
                                <p className="mt-2 truncate text-[20px] font-bold leading-none tracking-[-0.5px] text-ink tabular-nums sm:text-[22px] sm:tracking-[-0.6px]">
                                    {card.value}
                                </p>
                                <p className="mt-1.5 truncate text-[11px] text-gray-500">
                                    {card.hint}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---------- Units list ---------- */}
            <DashboardGridItem title="Units">
                {list.length === 0 ? (
                    <EmptyState
                        message="No units found for this property."
                        cta="Add a unit"
                        link={`/admin/add-new-unit?propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(`/dashboard/property-owner/properties/${id}/units`)}`}
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
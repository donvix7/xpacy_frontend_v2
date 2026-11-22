import Link from "next/link";
import {
    Building2,
    DoorOpen,
    UserCheck,
    KeyRound,
    PieChart,
    Tag,
    CalendarCheck,
    Wrench,
    ArrowUpRight,
} from "lucide-react";
import DashboardGridItem from "./DashboardGridItems";
import SummaryCards from "./SummaryCards";

export function normalizeDashboardStats(dashboardStats, fallbacks = {}) {
    const totalProperties = Number(
        dashboardStats?.totalProperties ?? fallbacks.totalProperties ?? 0
    );
    const totalUnits = Number(
        dashboardStats?.totalUnits ?? fallbacks.totalUnits ?? 0
    );
    const occupiedUnits = Number(
        dashboardStats?.occupiedUnits ?? fallbacks.occupiedUnits ?? 0
    );
    const vacantUnits = Number(
        dashboardStats?.vacantUnits ??
            fallbacks.vacantUnits ??
            Math.max(0, totalUnits - occupiedUnits)
    );
    const occupancyRate = Number(
        dashboardStats?.occupancyRate ??
            fallbacks.occupancyRate ??
            (totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0)
    );
    const totalListings = Number(
        dashboardStats?.totalListings ?? fallbacks.totalListings ?? 0
    );
    const activeBookings = Number(
        dashboardStats?.activeBookings ?? fallbacks.activeBookings ?? 0
    );
    const openMaintenance = Number(
        dashboardStats?.openMaintenance ?? fallbacks.openMaintenance ?? 0
    );

    return {
        totalProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate: Math.round(occupancyRate),
        totalListings,
        activeBookings,
        openMaintenance,
    };
}

export function DashboardSummaryOverview({
    stats,
    title = "Portfolio Overview",
    variant = "manager",
}) {
    const ownerCards = [
        {
            label: "Total Properties",
            value: stats.totalProperties,
            color: "bg-primary-100",
            icon: <Building2 className="w-5 h-5 text-primary-700" />,
            meta: "In portfolio",
        },
        {
            label: "Total Units",
            value: stats.totalUnits,
            color: "bg-indigo-100",
            icon: <DoorOpen className="w-5 h-5 text-indigo-700" />,
            meta: `${stats.occupiedUnits} occupied · ${stats.vacantUnits} vacant`,
        },
        {
            label: "Occupied Units",
            value: stats.occupiedUnits,
            color: "bg-emerald-100",
            icon: <UserCheck className="w-5 h-5 text-emerald-700" />,
            meta: "Currently leased",
        },
        {
            label: "Vacant Units",
            value: stats.vacantUnits,
            color: "bg-amber-100",
            icon: <KeyRound className="w-5 h-5 text-amber-700" />,
            meta: "Ready for occupancy",
        },
        {
            label: "Occupancy Rate",
            value: `${stats.occupancyRate}%`,
            color: "bg-sky-100",
            icon: <PieChart className="w-5 h-5 text-sky-700" />,
            meta: `${stats.occupiedUnits} of ${stats.totalUnits} units`,
        },
    ];

    const managerExtraCards = [
        {
            label: "Total Listings",
            value: stats.totalListings,
            color: "bg-violet-100",
            icon: <Tag className="w-5 h-5 text-violet-700" />,
            meta: "Across portfolio",
        },
        {
            label: "Active Bookings",
            value: stats.activeBookings,
            color: "bg-teal-100",
            icon: <CalendarCheck className="w-5 h-5 text-teal-700" />,
            meta: "Ongoing & upcoming",
        },
        {
            label: "Open Maintenance",
            value: stats.openMaintenance,
            color: "bg-rose-100",
            icon: <Wrench className="w-5 h-5 text-rose-700" />,
            meta: "Pending resolution",
        },
    ];

    const cards =
        variant === "owner" ? ownerCards : [...ownerCards, ...managerExtraCards];

    return <SummaryCards cards={cards} title={title} />;
}

export function UnitsOccupancySummary({
    stats,
    propertiesHref = "/dashboard/property-owner/properties",
}) {
    const pct = Math.min(100, Math.max(0, stats.occupancyRate));

    return (
        <DashboardGridItem
            title="Units & Occupancy"
            viewAllLink={propertiesHref}
        >
            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-line bg-soft/40 p-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                            Total Units
                        </p>
                        <p className="mt-1 font-mono text-2xl font-bold text-ink">
                            {stats.totalUnits.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            Occupied
                        </p>
                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {stats.occupiedUnits.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 dark:bg-amber-950/20 p-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                            Vacant
                        </p>
                        <p className="mt-1 font-mono text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {stats.vacantUnits.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-mute">Occupancy Rate</span>
                        <span className="font-mono font-bold text-ink">
                            {pct}% ({stats.occupiedUnits}/{stats.totalUnits})
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-soft">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            </div>
        </DashboardGridItem>
    );
}

export function ListingsMaintenanceSummary({
    stats,
    listingsHref = "/listings",
    bookingsHref = "/dashboard/property-owner/bookings",
    servicesHref = "/dashboard/property-owner/services",
}) {
    const items = [
        {
            label: "Total Listings",
            value: stats.totalListings,
            hint: "Published & managed listings",
            href: listingsHref,
            cta: "View listings",
            icon: Tag,
            badgeClass:
                "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
        },
        {
            label: "Active Bookings",
            value: stats.activeBookings,
            hint: "Ongoing & upcoming reservations",
            href: bookingsHref,
            cta: "View bookings",
            icon: CalendarCheck,
            badgeClass:
                "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
        },
        {
            label: "Open Maintenance",
            value: stats.openMaintenance,
            hint: "Work orders awaiting resolution",
            href: servicesHref,
            cta: "View maintenance",
            icon: Wrench,
            badgeClass:
                "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
        },
    ];

    return (
        <DashboardGridItem
            title="Listings, Bookings & Maintenance"
            viewAllLink={listingsHref}
        >
            <div className="flex flex-col divide-y divide-line">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.badgeClass}`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-ink">
                                        {item.label}
                                    </p>
                                    <p className="truncate text-xs text-mute">
                                        {item.hint}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-xl font-bold text-ink tabular-nums">
                                    {item.value.toLocaleString()}
                                </span>
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-soft/50 px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
                                >
                                    <span>{item.cta}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </DashboardGridItem>
    );
}


import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Home,
    Flag,
    Hash,
    Calendar,
    Layers,
    DoorOpen,
    Users,
    LayoutGrid,
    FileText,
    CalendarCheck,
    Plus,
    TrendingUp,
} from "lucide-react";
import { getPropertyById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const detailConfig = [
    { key: "address", label: "Address", icon: Home },
    { key: "city", label: "City", icon: MapPin },
    { key: "state", label: "State / Province", icon: MapPin },
    { key: "country", label: "Country", icon: Flag },
    { key: "postalCode", label: "Postal code", icon: Hash },
    { key: "propertyType", label: "Property type", icon: Building2 },
    { key: "yearBuilt", label: "Year built", icon: Calendar },
    { key: "totalFloors", label: "Total floors", icon: Layers },
    { key: "totalUnits", label: "Total units", icon: DoorOpen },
];

function detailRows(property) {
    return detailConfig
        .map(({ key, label, icon }) => [label, property[key], icon])
        .filter(
            ([, value]) => value !== undefined && value !== null && value !== "",
        );
}

function managerName(manager) {
    const u = manager.user || {};
    return (
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        u.email ||
        "Manager"
    );
}

// Tiles use the same high-contrast pattern as the other summaries
function StatTile({ icon, label, value, href }) {
    const inner = (
        <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-4">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-600 to-primary-400" />
            <div className="relative pl-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 sm:text-[10.5px] sm:tracking-[0.14em]">
                        {label}
                    </span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary-600 text-white shadow-sm sm:h-7 sm:w-7">
                        {icon}
                    </span>
                </div>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-[-0.6px] text-ink tabular-nums sm:text-[24px]">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

export async function generateMetadata({ params }) {
    const pageParams = await params;
    let property = null;
    try {
        property = await getPropertyById(pageParams.id);
    } catch {
        property = null;
    }

    return {
        title: property?.name || "Property",
        description: property?.description || "",
    };
}

export default async function Page({ params }) {
    const pageParams = await params;
    const results = await Promise.allSettled([getPropertyById(pageParams.id)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const property = results[0].status === "fulfilled" ? results[0].value : null;

    if (!property || typeof property !== "object") {
        return (
            <div className="space-y-5 p-2">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/properties"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to properties
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        title="Property not found"
                        message="This property may have been removed or the link may be incorrect."
                        icon={Building2}
                    />
                </div>
            </div>
        );
    }

    const counts = property._count ?? {};
    const managers = property.managers ?? [];
    const owners = property.owners ?? [];
    const media = property.media ?? [];

    // Tile data
    const tiles = [
        {
            icon: <Building2 className="h-4 w-4 text-white" />,
            title: "Units",
            value: counts.units ?? 0,
            href: `/dashboard/user/my-properties/${property.id}/units`,
        },
        {
            icon: <LayoutGrid className="h-4 w-4 text-white" />,
            title: "Buildings",
            value: counts.buildings ?? 0,
            href: `/dashboard/user/my-properties/${property.id}/buildings`,
        },
        {
            icon: <FileText className="h-4 w-4 text-white" />,
            title: "Listings",
            value: counts.listings ?? 0,
            href: `/dashboard/user/my-properties/${property.id}/listings`,
        },
        {
            icon: <FileText className="h-4 w-4 text-white" />,
            title: "Leases",
            value: counts.leases ?? 0,
            href: `/dashboard/user/my-properties/${property.id}/leases`,
        },
        {
            icon: <CalendarCheck className="h-4 w-4 text-white" />,
            title: "Bookings",
            value: counts.bookings ?? 0,
            href: `/dashboard/properties/${property.id}`,
        },
    ];

    // Total record count for the header hint
    const totalRecords = tiles.reduce((sum, t) => sum + (t.value || 0), 0);

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Hero summary ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <Link
                                href="/dashboard/properties"
                                className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute transition-colors hover:text-white"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                Back to properties
                            </Link>
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Property console · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {property.name || "Untitled property"}
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                {property.address || "No address available"}
                                {(property.city || property.state) && (
                                    <>
                                        {" · "}
                                        {[property.city, property.state]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusChips status={property.status || "active"} />
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {tiles.map((tile) => (
                            <Link
                                key={tile.title}
                                href={tile.href}
                                className="group rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.14] sm:p-4"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                        {tile.title}
                                    </dt>
                                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-600 shadow-sm">
                                        {tile.icon}
                                    </span>
                                </div>
                                <dd className="mt-2 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                                    {typeof tile.value === "number"
                                        ? tile.value.toLocaleString()
                                        : tile.value}
                                </dd>
                            </Link>
                        ))}
                    </dl>

                    
                </div>
            </section>

            {/* ---------- Overview tile row ---------- */}
            <DashboardGridItem title="Overview">
                <div className="grid grid-cols-2 gap-3 @container @sm:grid-cols-3 lg:grid-cols-5">
                    {tiles.map((tile) => (
                        <StatTile
                            key={tile.title}
                            icon={tile.icon}
                            label={tile.title}
                            value={tile.value}
                            href={tile.href}
                        />
                    ))}
                </div>
            </DashboardGridItem>

            {/* ---------- Property details ---------- */}
            <DashboardGridItem title="Property Details">
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detailRows(property).map(([label, value, Icon]) => (
                        <div
                            key={label}
                            className="rounded-lg border border-gray-100 bg-white p-3"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50">
                                    <Icon className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                    {label}
                                </dt>
                            </div>
                            <dd className="mt-2 break-words text-[13px] capitalize text-ink">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </DashboardGridItem>

            {property.description && (
                <DashboardGridItem title="Description">
                    <p className="text-sm leading-relaxed text-gray-700">
                        {property.description}
                    </p>
                </DashboardGridItem>
            )}

            <DashboardGridItem title="Managers">
                {managers.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No managers"
                        message="No managers have been assigned to this property yet."
                    />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3.5">Name</th>
                                        <th className="px-4 py-3.5">Contact</th>
                                        <th className="px-4 py-3.5">Role</th>
                                        <th className="px-4 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {managers.map((manager) => {
                                        const name = managerName(manager);
                                        const email =
                                            manager.user?.email || manager.email;
                                        const phone =
                                            manager.user?.phone || manager.phone;
                                        const role =
                                            manager.role
                                                ?.replace(/_/g, " ")
                                                .toLowerCase() || "—";
                                        const status = manager.status || "active";
                                        const profileHref = manager.userId
                                            ? `/dashboard/admin/users/${manager.userId}`
                                            : null;

                                        return (
                                            <tr
                                                key={manager.id}
                                                className="transition-colors hover:bg-gray-50/60"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
                                                            <Users className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {name}
                                                            </p>
                                                            {manager.user?.username &&
                                                                manager.user.username !==
                                                                    name && (
                                                                    <p className="text-xs text-gray-400">
                                                                        @
                                                                        {
                                                                            manager
                                                                                .user
                                                                                .username
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs">
                                                    <p className="text-gray-800">
                                                        {email || "—"}
                                                    </p>
                                                    {phone && (
                                                        <p className="mt-0.5 text-gray-400">
                                                            {phone}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-xs capitalize text-gray-600">
                                                    {role}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusChips status={status} />
                                                    </div>
                                                </td>
                                                
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 md:hidden">
                            {managers.map((manager) => (
                                <Link
                                    key={manager.id}
                                    href={`/dashboard/admin/users/${manager.userId}`}
                                    className="block rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Users className="h-4 w-4 shrink-0 text-primary" />
                                            <h3 className="truncate text-sm font-semibold text-ink">
                                                {managerName(manager)}
                                            </h3>
                                        </div>
                                        <StatusChips
                                            status={manager.status || "active"}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs capitalize text-gray-500">
                                        {manager.role
                                            ?.replace(/_/g, " ")
                                            .toLowerCase() || "—"}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </DashboardGridItem>

            <DashboardGridItem title="Owners">
                {owners.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No owners"
                        message="No owners have been linked to this property yet."
                    />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3.5">Name</th>
                                        <th className="px-4 py-3.5">Contact</th>
                                        <th className="px-4 py-3.5">Role</th>
                                        <th className="px-4 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {owners.map((owner, index) => {
                                        const id = owner.id || owner.userId || index;
                                        const u = owner.user || {};
                                        const name =
                                            [
                                                owner.ownerProfile?.firstName,
                                                owner.ownerProfile?.lastName,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            owner.name ||
                                            u.name ||
                                            owner.email ||
                                            u.email ||
                                            "Owner";
                                        const email =
                                            owner.ownerProfile?.email || u.email;
                                        const phone =
                                            owner.ownerProfile?.phone || u.phone;
                                        const role =
                                            owner.role
                                                ?.replace(/_/g, " ")
                                                .toLowerCase() || "owner";
                                        const status =
                                            owner.status || u.status || "active";

                                        return (
                                            <tr
                                                key={id}
                                                className="transition-colors hover:bg-gray-50/60"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
                                                            <Users className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {name}
                                                            </p>
                                                            {(owner.username ||
                                                                u.username) && (
                                                                <p className="text-xs text-gray-400">
                                                                    @
                                                                    {owner.username ||
                                                                        u.username}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs">
                                                    <p className="text-gray-800">
                                                        {email || "—"}
                                                    </p>
                                                    {phone && (
                                                        <p className="mt-0.5 text-gray-400">
                                                            {phone}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-xs capitalize text-gray-600">
                                                    {role}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusChips status={status} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 md:hidden">
                            {owners.map((owner, index) => {
                                const id = owner.id || owner.userId || index;
                                const u = owner.user || {};
                                const name =
                                    [
                                        owner.first_name ||
                                            u.firstname ||
                                            u.first_name,
                                        owner.last_name ||
                                            u.lastname ||
                                            u.last_name,
                                    ]
                                        .filter(Boolean)
                                        .join(" ") ||
                                    owner.name ||
                                    u.name ||
                                    owner.email ||
                                    u.email ||
                                    "Owner";
                                const email = owner.email || u.email;
                                const role =
                                    owner.role
                                        ?.replace(/_/g, " ")
                                        .toLowerCase() || "owner";
                                const status =
                                    owner.status || u.status || "active";

                                return (
                                    <div
                                        key={id}
                                        className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Users className="h-4 w-4 shrink-0 text-primary" />
                                                <h3 className="truncate text-sm font-semibold text-ink">
                                                    {name}
                                                </h3>
                                            </div>
                                            <StatusChips status={status} />
                                        </div>
                                        <p className="mt-2 text-xs capitalize text-gray-500">
                                            {role}
                                        </p>
                                        {email && (
                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {email}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </DashboardGridItem>

            {media.length > 0 && (
                <DashboardGridItem title="Media">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {media.map((item, i) => (
                            <div
                                key={item.id || i}
                                className="aspect-video overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                            >
                                {item.url ? (
                                    <img
                                        src={item.url}
                                        alt={`${property.name} media ${i + 1}`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </DashboardGridItem>
            )}
        </div>
    );
}
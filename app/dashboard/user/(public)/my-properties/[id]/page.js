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
} from "lucide-react";
import { getProperty, getPropertyById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";

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
            ([, value]) => value !== undefined && value !== null && value !== ""
        );
}

function managerName(manager) {
    const u = manager.user || {};
    return (
        [u.firstName , u.lastName]
            .filter(Boolean)
            .join(" ") ||
        u.username ||
        u.email ||
        "Manager"
    );
}

function StatCard({ icon: Icon, label, value, href }) {
    const inner = (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition ">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <p className="mt-0.5 text-lg font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

export async function generateMetadata({ params }) {
    const pageParams = await params;
    const property = await getPropertyById(pageParams.id);
    console.log("property",property)

    return {
        title: property?.name || "Property",
        description: property?.description || "",
    };
}

export default async function Page({ params }) {
    const pageParams = await params;
    const property = await getPropertyById(pageParams.id);

    if (!property || typeof property !== "object") {
        return (
            <div className="space-y-5 p-2">
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


    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-[28px] font-bold text-primary lg:text-4xl">
                        Property information
                    </p>
                    <p className="mt-1 capitalize text-sm text-gray-500">
                        {property.name || "Property"}
                    </p>
                </div>
               
            </div>

            <DashboardGridItem>
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3 flex w-full items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 p-3">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="break-words text-2xl font-bold text-primary lg:text-3xl">
                                {property.name || "Untitled property"}
                            </h1>
                            <p className="mt-1 break-all text-sm text-gray-500">
                                {property.address || "No address available"}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-full w-full items-start justify-end">
                        <StatusChips status={property.status || "active"} />
                    </div>
                </div>
            </DashboardGridItem>

            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            icon: Building2,
                            label: "Units",
                            value: counts.units ?? 0,
                            href: `/dashboard/properties/${property.id}`,
                        },
                        {
                            icon: Building2,
                            label: "Buildings",
                            value: counts.buildings ?? 0,
                            href: `/dashboard/properties/${property.id}`,
                        },
                        {
                            icon: Building2,
                            label: "Listings",
                            value: counts.listings ?? 0,
                            href: `/dashboard/properties/${property.id}`,
                        },
                        {
                            icon: Building2,
                            label: "Leases",
                            value: counts.leases ?? 0,
                            href: `/dashboard/properties/${property.id}`,
                        },
                        {
                            icon: Building2,
                            label: "Bookings",
                            value: counts.bookings ?? 0,
                            href: `/dashboard/properties/${property.id}`,
                        },

                    ].map((item, index) => (
                        <StatCard
                            key={index}
                            icon={item.icon}
                            label={item.label}
                            value={item.value}
                            href={item.href}
                        />
                    ))}
                </div>
            </DashboardGridItem>

            <DashboardGridItem title="Property Details">
                <dl className="flex flex-col gap-3">
                    {detailRows(property).map(([label, value, Icon]) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="flex min-w-0 flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {label}
                                    </dt>
                                </div>
                                <dd className="mt-1 ml-10 break-words text-sm capitalize text-gray-800">
                                    {value}
                                </dd>
                            </div>
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
                        {/* Tabular format for long/desktop screens */}
                        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3.5">Name</th>
                                        <th className="px-4 py-3.5">Contact</th>
                                        <th className="px-4 py-3.5">Role</th>
                                        <th className="px-4 py-3.5 text-center">Status</th>
                                        <th className="px-4 py-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {managers.map((manager) => {
                                        const name = managerName(manager);
                                        const email = manager.user?.email || manager.email;
                                        const phone = manager.user?.phone || manager.phone;
                                        const role =
                                            manager.role?.replace(/_/g, " ").toLowerCase() ||
                                            "—";
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
                                                                manager.user.username !== name && (
                                                                    <p className="text-xs text-gray-400">
                                                                        @{manager.user.username}
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
                                                <td className="px-4 py-3.5 text-right">
                                                    {profileHref ? (
                                                        <Link
                                                            href={profileHref}
                                                            className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Card grid for small/mobile screens */}
                        <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                            {managers.map((manager) => (
                                <Link
                                    key={manager.id}
                                    href={`/dashboard/admin/users/${manager.userId}`}
                                    className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 shrink-0 text-primary" />
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {managerName(manager)}
                                        </h3>
                                    </div>
                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                                        <span className="capitalize">
                                            {manager.role?.replace(/_/g, " ").toLowerCase() ||
                                                "—"}
                                        </span>
                                    </p>
                                    <div className="mt-3">
                                        <StatusChips
                                            status={manager.status || "active"}
                                        />
                                    </div>
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
                        {/* Tabular format for long/desktop screens */}
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
                                                owner.ownerProfile.firstName,
                                                owner.ownerProfile.lastName,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            owner.name ||
                                            u.name ||
                                            owner.email ||
                                            u.email ||
                                            "Owner";
                                        const email = owner.ownerProfile.email || u.email;
                                        const phone = owner.ownerProfile.phone || u.phone;
                                        const role =
                                            owner.role?.replace(/_/g, " ").toLowerCase() ||
                                            "Owner";
                                        const status = owner.status || u.status || "active";

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
                                                            {(owner.username || u.username) && (
                                                                <p className="text-xs text-gray-400">
                                                                    @{owner.username || u.username}
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

                        {/* Card grid for small/mobile screens */}
                        <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                            {owners.map((owner, index) => {
                                const id = owner.id || owner.userId || index;
                                const u = owner.user || {};
                                const name =
                                    [
                                        owner.first_name || u.firstname || u.first_name,
                                        owner.last_name || u.lastname || u.last_name,
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
                                    owner.role?.replace(/_/g, " ").toLowerCase() ||
                                    "Owner";
                                const status = owner.status || u.status || "active";

                                return (
                                    <div
                                        key={id}
                                        className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 shrink-0 text-primary" />
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {name}
                                            </h3>
                                        </div>
                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                                            <span className="capitalize">{role}</span>
                                        </p>
                                        {email && (
                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {email}
                                            </p>
                                        )}
                                        <div className="mt-3">
                                            <StatusChips status={status} />
                                        </div>
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
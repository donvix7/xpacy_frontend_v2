import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Users,
    Mail,
    Phone,
    Home,
    Globe,
    Clock,
    DollarSign,
    Link2,
    Hash,
    Flag,
    Shield,
    Calendar,
    BadgeCheck,
    User2,
} from "lucide-react";
import {
    getOrganizationById,
    getOrganizationProperties,
    getOrganizationMembers,
    getAdminOrganizationById,
    getAdminOrganizationMembers,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";

const detailConfig = [
    { key: "email", label: "Email", icon: Mail },
    { key: "phone", label: "Phone", icon: Phone },
    { key: "address", label: "Address", icon: Home },
    { key: "city", label: "City", icon: MapPin },
    { key: "state", label: "State / Province", icon: MapPin },
    { key: "country", label: "Country", icon: Flag },
    { key: "timezone", label: "Timezone", icon: Clock },
    { key: "currency", label: "Currency", icon: DollarSign },
    { key: "members", label: "Members", icon: User2 },
    { key: "slug", label: "Slug", icon: Link2 },
];

function detailRows(organization) {
    return detailConfig
        .map(({ key, label, icon }) => [label, organization[key], icon])
        .filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== ""
        );
}

const memberName = (member) => {
    const u = member.user || member.profile || {};
    return (
        [u.firstName || u.firstname, u.lastName || u.lastname]
            .filter(Boolean)
            .join(" ") ||
        u.name ||
        u.username ||
        u.email ||
        member.name ||
        member.email ||
        "Member"
    );
};

export default async function Page({ params }) {
    const { id } = await params;

    const [result, organizationProperties, members] = await Promise.all([
        getAdminOrganizationById(id),
        getOrganizationProperties(id),
        getAdminOrganizationMembers(id),
    ]);

    const organization = result?.organization || result;
    const memberList = Array.isArray(members) ? members : [];
    const propertiesList = Array.isArray(organizationProperties)
        ? organizationProperties
        : [];

    if (!organization || typeof organization !== "object") {
        return (
            <div className="space-y-5 p-2">
                <Link
                    href="/dashboard/admin/organizations"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to organizations
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={Building2}
                        title="Organization not found"
                        message="This organization may have been removed or the link may be incorrect."
                    />
                </div>
            </div>
        );
    }

    // Prefer an explicit count from the API, otherwise fall back to list length
    const totalMembers =
        result?.memberCount ??
        organization?.memberCount ??
        organization?.membersCount ??
        organization?.members?.length ??
        memberList.length;

    // Merge the computed count into the object used for rendering details
    const organizationWithCounts = {
        ...organization,
        members: totalMembers,
    };

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-[28px] font-bold text-primary lg:text-4xl">
                            Organization information
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm capitalize text-gray-500">
                            {organization.name || "Organization"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Identity card */}
            <DashboardGridItem>
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3 flex w-full items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 p-3">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="break-words text-2xl font-bold text-primary">
                                {organization.name}
                            </h1>
                            <p className="mt-1 break-all text-sm text-gray-500">
                                {organization.slug || organization.email || "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-full w-full items-start justify-end">
                        <StatusChips status={organization.status || "active"} />
                    </div>
                </div>
            </DashboardGridItem>

            {/* Details */}
            <DashboardGridItem title="Organization Details">
                <dl className="flex flex-col gap-3">
                    {detailRows(organizationWithCounts).map(([label, value, Icon]) => (
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
                                <dd className="ml-10 mt-1 break-words text-sm text-gray-800">
                                    {value}
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </DashboardGridItem>

            {/* Properties */}
            <DashboardGridItem title="Properties">
                {propertiesList.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="No properties"
                        message="No properties found for this organization."
                    />
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3.5">Property</th>
                                        <th className="px-4 py-3.5">Location</th>
                                        <th className="px-4 py-3.5 text-center">Status</th>
                                        <th className="px-4 py-3.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {propertiesList.map((property) => (
                                        <tr
                                            key={property.id}
                                            className="transition-colors hover:bg-gray-50/60"
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
                                                        <Building2 className="h-4 w-4" />
                                                    </div>
                                                    <p className="font-medium text-gray-900">{property.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-gray-600">
                                                {[property.address, property.city, property.country]
                                                    .filter(Boolean)
                                                    .join(", ") || "—"}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="flex justify-center">
                                                    <StatusChips status={property.status || "active"} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link
                                                    href={`/dashboard/admin/properties/${property.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-100"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                            {propertiesList.map((property) => (
                                <Link
                                    key={property.id}
                                    href={`/dashboard/admin/properties/${property.id}`}
                                    className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-900">{property.name}</h3>
                                        <StatusChips status={property.status || "active"} />
                                    </div>
                                    <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span className="break-words">
                                            {property.address || "—"}
                                        </span>
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </DashboardGridItem>
        </div>
    );
}
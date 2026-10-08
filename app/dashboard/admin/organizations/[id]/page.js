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
} from "lucide-react";
import { getOrganizationById, getOrganizationProperties } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import Image from "next/image";
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
    { key: "slug", label: "Slug", icon: Link2 },
];

function detailRows(organization) {
    return detailConfig
        .map(({ key, label, icon }) => [label, organization[key], icon])
        .filter(([, value]) => value);
}

export default async function Page({ params }) {
    const { id } = await params;
    const result = await getOrganizationById(id);
    const organization = result?.organization || result;
    const organizationProperties = await getOrganizationProperties();

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
                    <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <h1 className="text-xl font-bold text-gray-900">
                        Organization not found
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        This organization may have been removed or the link may be
                        incorrect.
                    </p>
                </div>
            </div>
        );
    }

    const membersCount =
        organization.memberCount ??
        organization.membersCount ??
        organization.members?.length;

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-[28px] font-bold text-primary lg:text-4xl">
                            Organization information
                        </p>
                        <p className="mt-1 capitalize flex items-center gap-2 text-sm text-gray-500">
                            {organization.name || "Organization"}
                        </p>
                    </div>
                </div>
                <Link
                    href={`/dashboard/admin/organizations/${id}/members`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                    <Users className="h-4 w-4" />
                    View members
                    {membersCount !== undefined ? ` (${membersCount})` : ""}
                </Link>
            </div>

            <DashboardGridItem>
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3 flex w-full items-center gap-4">
                        <div className="rounded-full bg-primary-100 p-3 h-14 w-14 flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="break-words text-2xl font-bold text-primary lg:text-3xl">
                                {organization.name}
                            </h1>
                            <p className="mt-1 break-all text-sm text-gray-500">
                                {organization.slug || "No email available"}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-full cw-full items-start justify-end">
                        <StatusChips status={organization.status || "active"} />
                    </div>
                </div>
            </DashboardGridItem>

            <DashboardGridItem title="Organization Details">
                <dl className="flex flex-col gap-3">
                    {detailRows(organization).map(([label, value, Icon]) => (
                        <div key={label} className="flex items-start gap-3">
                            
                            <div className="min-w-0 flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {label}
                                    </dt>
                                </div>
                                <dd className="mt-1 ml-10 break-words text-sm text-gray-800">
                                    {value}
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </DashboardGridItem>

            <DashboardGridItem title="Properties">
                {organizationProperties.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="No properties"
                        message="No properties found for this organization."
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {organizationProperties.map((property) => (
                            <Link
                                key={property.id}
                                href={`/dashboard/admin/properties/${property.id}`}
                                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                            >
                                <h3 className="text-sm font-medium text-gray-900">
                                    {property.name}
                                </h3>
                                <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span className="break-words">
                                        {property.address || "—"}
                                    </span>
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}
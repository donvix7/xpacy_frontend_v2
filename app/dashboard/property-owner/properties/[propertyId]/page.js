import Link from "next/link";
import { Building2, ChevronLeft } from "lucide-react";
import {
    getPropertyById,
    getProperty,
    getAllUnits,
    getOrganizationById,
    getOrganizationMembers,
    getPropertyTenants,
    getPropertyOwner,
} from "@/app/_lib/data-services";
import { SAMPLE_PROPERTY_DETAIL } from "@/app/_lib/sample-properties";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import EmptyState from "@/app/_components/EmptyState";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import PropertyDetailsView from "@/app/_components/PropertyDetailsView";

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const propertyId = resolvedParams?.propertyId || resolvedParams?.id;
    try {
        let property = null;
        try {
            const res = await getPropertyById(propertyId);
            property = res?.data || res?.property || res;
        } catch {
            const res = await getProperty(propertyId);
            property = res?.property || res?.data || res;
        }
        if (!property && propertyId === SAMPLE_PROPERTY_DETAIL.id) {
            property = SAMPLE_PROPERTY_DETAIL;
        }
        return {
            title: property?.name || property?.property_name || "Property",
            description:
                property?.description || property?.property_description || "",
        };
    } catch {
        return {
            title: "Property",
            description: "",
        };
    }
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams?.propertyId || resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string" || !id.trim()) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                <Link
                    href="/dashboard/property-owner/properties"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to properties
                </Link>

                <EmptyState
                    icon={<Building2 className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Invalid property id"
                    message="The property id in the URL is missing or malformed."
                />
            </div>
        );
    }

    const propId = id.trim();

    const results = await Promise.allSettled([
        getPropertyById(propId).catch(() => getProperty(propId)),
        getAllUnits(propId).catch(() => []),
        getPropertyTenants(propId).catch(() => []),
        getPropertyOwner().catch(() => []),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results.slice(0, 2));

    const propResult =
        results[0].status === "fulfilled" ? results[0].value : null;
    const rawProperty =
        propResult?.data ||
        propResult?.property ||
        propResult ||
        (propId === SAMPLE_PROPERTY_DETAIL.id ? SAMPLE_PROPERTY_DETAIL : null);

    const unitsRes =
        results[1].status === "fulfilled" ? results[1].value : [];
    const unitsList = Array.isArray(unitsRes)
        ? unitsRes
        : Array.isArray(unitsRes?.data)
          ? unitsRes.data
          : [];

    const tenantsList =
        results[2].status === "fulfilled" && Array.isArray(results[2].value)
            ? results[2].value
            : [];

    const ownersRes =
        results[3].status === "fulfilled" ? results[3].value : [];
    const availableOwners = Array.isArray(ownersRes)
        ? ownersRes
        : Array.isArray(ownersRes?.data)
          ? ownersRes.data
          : [];

    if (!rawProperty || typeof rawProperty !== "object" || Array.isArray(rawProperty)) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/property-owner/properties"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to properties
                </Link>

                <EmptyState
                    icon={<Building2 className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Property not found"
                    message={`No property was found for id "${propId}". This property may have been removed or the link may be incorrect.`}
                />
            </div>
        );
    }

    const orgId = rawProperty.organizationId || rawProperty.organization_id || null;
    let organizationName = rawProperty.organization?.name || null;
    let availableMembers = [];
    if (orgId) {
        const [orgRes, membersRes] = await Promise.allSettled([
            organizationName ? Promise.resolve(null) : getOrganizationById(orgId),
            getOrganizationMembers(orgId),
        ]);
        if (!organizationName && orgRes.status === "fulfilled" && orgRes.value) {
            const org = orgRes.value?.organization || orgRes.value?.data || orgRes.value;
            organizationName = org?.name || null;
        }
        if (membersRes.status === "fulfilled" && Array.isArray(membersRes.value)) {
            availableMembers = membersRes.value;
        }
    }

    return (
        <PropertyDetailsView
            rawProperty={rawProperty}
            units={unitsList}
            tenants={tenantsList}
            availableOwners={availableOwners}
            availableMembers={availableMembers}
            organizationName={organizationName}
            basePath="/dashboard/property-owner"
            dataErrorMessages={dataErrorMessages}
        />
    );
}

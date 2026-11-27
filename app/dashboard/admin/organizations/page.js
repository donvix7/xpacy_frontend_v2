import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAdminOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminOrganizationsList from "@/app/_components/AdminOrganizationsList";
import HeroBand from "@/app/_components/HeroBand";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function getOrganizationList(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.organizations)) return payload.organizations;
    if (Array.isArray(payload?.data?.organizations))
        return payload.data.organizations;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function getMemberCount(org) {
    return (
        org?._count?.memberships ??
        org?._count?.members ??
        org?.members?.length ??
        org?.memberCount ??
        org?.membersCount ??
        0
    );
}

function getPropertyCount(org) {
    return Number(
        org?._count?.properties ??
        org?.properties?.length ??
        org?.propertyCount ??
        org?.propertiesCount ??
        0
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function Page() {
    const results = await Promise.allSettled([getAllAdminOrganization()]);
    const dataErrorMessages = getSettledErrorMessages(results);

    /* ✅ Extract the raw payload first, then normalize */
    const organizationsRaw =
        results[0].status === "fulfilled" ? results[0].value : null;
    const organizations = getOrganizationList(organizationsRaw);

    /* ---------- Hero stats ---------- */
    const totalOrgs = organizations.length;

    const totalMembers = organizations.reduce(
        (sum, org) => sum + getMemberCount(org),
        0
    );

    const withEmail = organizations.filter((o) =>
        Boolean(o?.email || o?.contactEmail || o?.owner?.email)
    ).length;

    const totalProperties = organizations.reduce(
        (sum, org) => sum + getPropertyCount(org),
        0
    );

    const heroStats = [
        {
            label: "Organizations",
            value: totalOrgs,
            hint: "Registered accounts",
        },
        {
            label: "Members",
            value: totalMembers,
            hint: "Across all orgs",
        },
        {
            label: "Properties",
            value: totalProperties,
            hint: "Across all orgs",
        },
        {
            label: "Contactable",
            value: withEmail,
            hint: "Have an email on file",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-6 p-2">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Hero summary ---------- */}
            <HeroBand
                tagline={`Admin console · ${today}`}
                title="Organizations"
                description="Manage organizations and their members — contacts, locations and membership in one place."
                actions={null}
                stats={heroStats}
            />

            {/* ---------- List ---------- */}
            <DashboardGridItem title={`Organizations (${organizations.length})`}>
                <AdminOrganizationsList organizations={organizations} />
            </DashboardGridItem>
        </div>
    );
}
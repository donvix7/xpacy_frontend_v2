import Link from "next/link";
import { Plus, ArrowRightLeft } from "lucide-react";
import { getAllOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminOrganizationsList from "@/app/_components/AdminOrganizationsList";
import HeroBand from "@/app/_components/HeroBand";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const getOrganizationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.organizations)) return payload.organizations;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

function getMemberCount(org) {
    return org._count?.memberships ?? org.members?.length ?? 0;
}

export default async function PropertyManagerOrganizationsPage() {
    const results = await Promise.allSettled([getAllOrganization()]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const organizations = getOrganizationList(
        results[0].status === "fulfilled" ? results[0].value : []
    );

    // Hero stats
    const totalOrgs = organizations.length;
    const totalMembers = organizations.reduce(
        (sum, o) => sum + getMemberCount(o),
        0
    );
    const withEmail = organizations.filter((o) => !!o.email).length;
    const countries = new Set(
        organizations.map((o) => o.country).filter(Boolean)
    ).size;

    const heroStats = [
        { label: "Organizations", value: totalOrgs, hint: "Managed & affiliated" },
        { label: "Members", value: totalMembers, hint: "Across your orgs" },
        { label: "Coverage", value: countries || 1, hint: "Regions represented" },
        { label: "Verified", value: withEmail, hint: "Contact on file" },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-6 p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Hero summary ---------- */}
            <HeroBand
                tagline={`Property manager console · ${today}`}
                title="Organizations"
                description="View and oversee client organizations, team members, and properties under your management."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/auth/proceed"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                            Switch workspace
                        </Link>
                        <Link
                            href="/auth/subscriptions"
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create organization
                        </Link>
                    </div>
                }
                stats={heroStats}
            />

            {/* ---------- Content ---------- */}
            <DashboardGridItem title={`Organizations (${organizations.length})`}>
                <AdminOrganizationsList
                    organizations={organizations}
                    basePath="/dashboard/property-manager/organizations"
                />
            </DashboardGridItem>
        </div>
    );
}


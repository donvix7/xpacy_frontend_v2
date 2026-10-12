import Link from "next/link";
import { BadgeCheck, Building2, Plus, Users, UsersRound } from "lucide-react";
import { getAllOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import AdminOrganizationsList from "@/app/_components/AdminOrganizationsList";

const getOrganizationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.organizations)) return payload.organizations;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

export default async function Page() {
    const organizations = getOrganizationList(await getAllOrganization());
    const memberCounts = organizations
        .map((organization) => organization.memberCount ?? organization.membersCount ?? organization._count?.memberships ?? organization.members?.length)
        .filter((count) => count !== undefined && count !== null && Number.isFinite(Number(count)))
        .map(Number);
    const summaryCards = [
        { label: "Total Organizations", value: organizations.length, color: "bg-primary-100", icon: <Building2 className="h-5 w-5 text-primary" /> },
        { label: "Active Organizations", value: organizations.filter((organization) => String(organization.status || "").toLowerCase() === "active").length, color: "bg-emerald-100", icon: <BadgeCheck className="h-5 w-5 text-emerald-600" /> },
        { label: "Organizations with Members", value: organizations.filter((organization) => Number(organization.memberCount ?? organization.membersCount ?? organization._count?.memberships ?? organization.members?.length) > 0).length, color: "bg-blue-100", icon: <UsersRound className="h-5 w-5 text-blue-600" /> },
        { label: "Total Members", value: memberCounts.reduce((total, count) => total + count, 0), color: "bg-purple-100", icon: <Users className="h-5 w-5 text-purple-600" /> },
    ];

    return (
        <div className="space-y-6 p-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-[28px] font-bold text-primary lg:text-4xl">Organizations</p>
                    <p className="mt-1 text-sm text-gray-500">Manage organizations and their members.</p>
                </div>
                <Link href="/admin/add-new-organization" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                    <Plus className="h-4 w-4" /> Create organization
                </Link>
            </div>

            <SummaryCards cards={summaryCards} title="Organization Summary" />

            <DashboardGridItem title={`Organizations List (${organizations.length})`}>
                <AdminOrganizationsList organizations={organizations} />
            </DashboardGridItem>
        </div>
    );
}

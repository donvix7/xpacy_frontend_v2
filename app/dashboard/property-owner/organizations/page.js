import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminOrganizationsList from "@/app/_components/AdminOrganizationsList";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const getOrganizationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.organizations)) return payload.organizations;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

export default async function Page() {
    const results = await Promise.allSettled([getAllOrganization()]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const organizations = getOrganizationList(
        results[0].status === "fulfilled" ? results[0].value : []
    );

    return (
        <div className="space-y-6 p-2">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-ink lg:text-4xl">Organizations</h1>
                    <p className="mt-1 text-sm text-mute">Manage organizations and their members.</p>
                </div>
                <Link href="/admin/add-new-organization" className="xp-btn xp-btn-fill gap-2 px-4 py-2.5 text-sm font-semibold">
                    <Plus className="h-4 w-4" /> Create organization
                </Link>
            </div>

            <DashboardGridItem title={`Organizations (${organizations.length})`}>
                <AdminOrganizationsList organizations={organizations} basePath="/dashboard/user/organizations" />
            </DashboardGridItem>
        </div>
    );
}

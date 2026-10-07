import Link from "next/link";
import { Building2, ChevronLeft, MapPin, Users } from "lucide-react";
import { getOrganizationById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

function detailRows(organization) {
    return [
        ["Email", organization.email], ["Phone", organization.phone], ["Address", organization.address],
        ["City", organization.city], ["State / Province", organization.state], ["Country", organization.country],
        ["Timezone", organization.timezone], ["Currency", organization.currency], ["Slug", organization.slug],
    ].filter(([, value]) => value);
}

export default async function Page({ params }) {
    const { id } = await params;
    const result = await getOrganizationById(id);
    const organization = result?.organization || result;

    if (!organization || typeof organization !== "object") {
        return <div className="space-y-5 p-2"><Link href="/dashboard/admin/organizations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to organizations</Link><div className="rounded-xl border border-gray-100 bg-white p-10 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" /><h1 className="text-xl font-bold text-gray-900">Organization not found</h1><p className="mt-2 text-sm text-gray-500">This organization may have been removed or the link may be incorrect.</p></div></div>;
    }

    const membersCount = organization.memberCount ?? organization.membersCount ?? organization.members?.length;
    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4"><div><p className="text-[28px] font-bold text-primary lg:text-4xl">Organization information</p><p className="mt-1 text-sm text-gray-500">{organization.name || "Organization"}</p></div></div>
                <Link href={`/dashboard/admin/organizations/${id}/members`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"><Users className="h-4 w-4" />View members{membersCount !== undefined ? ` (${membersCount})` : ""}</Link>
            </div>
            <DashboardGridItem title="Organization Details">
                <dl className="grid gap-5 ">
                    {detailRows(organization).map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 text-sm text-gray-800">{value}</dd></div>)}
                </dl>
            </DashboardGridItem>
        </div>
    );
}

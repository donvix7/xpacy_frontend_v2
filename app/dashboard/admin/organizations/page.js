import Link from "next/link";
import { Building2, Plus, Users } from "lucide-react";
import { getAllOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

const getOrganizationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.organizations)) return payload.organizations;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

export default async function Page() {
    const organizations = getOrganizationList(await getAllOrganization());

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

            <DashboardGridItem title={`Organizations (${organizations.length})`}>
                {organizations.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                                <tr><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Members</th><th className="px-4 py-3"> </th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {organizations.map((organization) => {
                                    const id = organization.id || organization._id;
                                    return (
                                        <tr key={id || organization.name} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 font-semibold text-gray-900">{organization.name || "Unnamed organization"}<div className="mt-1 text-xs font-normal text-gray-500">{organization.slug || id || ""}</div></td>
                                            <td className="px-4 py-4 text-gray-600">{[organization.city, organization.country].filter(Boolean).join(", ") || "—"}</td>
                                            <td className="px-4 py-4 text-gray-600">{organization.email || "—"}</td>
                                            <td className="px-4 py-4 text-gray-600">{organization.memberCount ?? organization.membersCount ?? organization.members?.length ?? "—"}</td>
                                            <td className="px-4 py-4 text-right"><Link className="font-semibold text-primary hover:underline" href={`/dashboard/admin/organizations/${id}`}>View</Link></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                        <Building2 className="mb-3 h-10 w-10 text-gray-300" />
                        <p className="font-semibold text-gray-800">No organizations yet</p>
                        <p className="mt-1 text-sm text-gray-500">Create an organization to get started.</p>
                        <Link href="/admin/add-new-organization" className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" />Create organization</Link>
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getOrganizationById, getOrganizationMembers } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import Image from "next/image";
import DataTable from "@/app/_components/DataTable";

function getMembers(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.members)) return payload.members;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
}

export default async function Page({ params }) {
    const { id } = await params;
    const [organizationResult, memberResult] = await Promise.all([getOrganizationById(id), getOrganizationMembers(id)]);
    const organization = organizationResult?.organization || organizationResult;
    const members = getMembers(memberResult);
    const nameOf = (member) => member.name || [member.user?.firstName || member.user?.firstname, member.user?.lastName || member.user?.lastname].filter(Boolean).join(" ") || member.fullName || "Unnamed member";
    const imageOf = (member) => {
        const picture = member.display_picture || member.user?.display_picture;
        return picture ? `https://app.xpacy.com/src/upload/display_img/${picture}` : "/avatar.png";
    };
    const emailOf = (member) => member.email || member.user?.email || "—";
    const roleOf = (member) => member.role || member.organizationRole || "—";
    const statusOf = (member) => member.status || "Active";
    const memberHeadings = [
        { heading: "Name" },
        { heading: "Contact/Info" },
        { heading: "Role", center: true },
        { heading: "Status", center: true },
    ];

    const renderRow = (member, index) => (
        <tr key={member._id || member.id || member.userId || index} className="border-b border-primary-100 text-sm text-neutrals-900 transition-colors last:border-0 hover:bg-gray-50">
            <td className="p-4">
                <div className="flex items-center gap-2 text-sm">
                    <Image src={imageOf(member)} alt={nameOf(member)} width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" unoptimized />
                    <span className="truncate font-semibold">{nameOf(member)}</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex flex-col justify-center">
                    <span className="text-gray-900">{emailOf(member)}</span>
                    <span className="text-xs text-gray-500">{member.phone || member.user?.phone || "N/A"}</span>
                </div>
            </td>
            <td className="p-4 text-center capitalize text-gray-600">{roleOf(member)}</td>
            <td className="p-4 text-center capitalize text-gray-600">{statusOf(member)}</td>
        </tr>
    );

    const renderMobileCard = (member, index) => (
        <article key={member._id || member.id || member.userId || index} className="w-full rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <Image src={imageOf(member)} alt={nameOf(member)} width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" unoptimized />
                <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-gray-900">{nameOf(member)}</p>
                    <p className="mt-1 break-all text-xs text-gray-500">{emailOf(member)}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between gap-4"><span className="text-sm text-gray-500">Phone</span><span className="text-right text-sm font-medium text-gray-900">{member.phone || member.user?.phone || "N/A"}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-sm text-gray-500">Role</span><span className="text-right text-sm font-medium capitalize text-gray-900">{roleOf(member)}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-sm text-gray-500">Status</span><span className="text-right text-sm font-medium capitalize text-gray-900">{statusOf(member)}</span></div>
            </div>
        </article>
    );

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <Link href={`/dashboard/admin/organizations/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to organization</Link>
            <div><p className="text-[28px] font-bold text-primary lg:text-4xl">Members</p><p className="mt-1 text-sm text-gray-500">{organization?.name || "Organization"}</p></div>
            <DashboardGridItem title="Organization members">
                <DataTable
                    title="Organization members"
                    headers={memberHeadings}
                    data={members}
                    renderRow={renderRow}
                    renderMobileCard={renderMobileCard}
                    emptyMessage="No members found."
                    showPagination={false}
                />
            </DashboardGridItem>
        </div>
    );
}

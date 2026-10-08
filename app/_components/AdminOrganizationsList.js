import Link from "next/link";
import { Building2 } from "lucide-react";
import DataTable from "@/app/_components/DataTable";

function organizationId(organization) {
    return organization.id || organization._id || organization.organizationId;
}

function memberCount(organization) {
    return organization.memberCount ?? organization.membersCount ?? organization._count?.memberships ?? organization.members?.length;
}

function location(organization) {
    return [organization.city, organization.state, organization.country].filter(Boolean).join(", ") || "—";
}

export default function AdminOrganizationsList({ organizations = [] }) {
    const headers = [
        { heading: "Organization" },
        { heading: "Location" },
        { heading: "Email" },
        { heading: "Members", center: true },
        { heading: "", center: true },
    ];

    const renderRow = (organization, index) => {
        const id = organizationId(organization);
        return (
            <tr key={id || organization.name || index} className="border-b border-primary-100 text-sm text-neutrals-900 transition-colors last:border-0 hover:bg-gray-50">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary"><Building2 className="h-5 w-5" /></span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{organization.name || "Unnamed organization"}</p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">{organization.slug || id || ""}</p>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-gray-600">{location(organization)}</td>
                <td className="p-4 text-gray-600">{organization.email || "—"}</td>
                <td className="p-4 text-center text-gray-600">{memberCount(organization) ?? "—"}</td>
                <td className="p-4 text-center"><Link className="font-semibold text-primary hover:underline" href={`/dashboard/admin/organizations/${id}`}>View</Link></td>
            </tr>
        );
    };

    const renderMobileCard = (organization, index) => {
        const id = organizationId(organization);
        return (
            <article key={id || organization.name || index} className="flex flex-col gap-4 rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary"><Building2 className="h-6 w-6" /></span>
                    <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold text-gray-900">{organization.name || "Unnamed organization"}</p>
                        <p className="mt-1 break-all text-xs text-gray-500">{organization.slug || id || ""}</p>
                    </div>
                </div>
                <dl className="flex flex-col gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div className="flex items-start justify-between gap-4"><dt className="shrink-0 text-gray-500">Location</dt><dd className="text-right text-gray-900">{location(organization)}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="shrink-0 text-gray-500">Email</dt><dd className="break-all text-right text-gray-900">{organization.email || "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-gray-500">Members</dt><dd className="font-medium text-gray-900">{memberCount(organization) ?? "—"}</dd></div>
                </dl>
                <div className="flex justify-end border-t border-gray-100 pt-3">
                    <Link className="text-sm font-semibold text-primary hover:underline" href={`/dashboard/admin/organizations/${id}`}>View organization</Link>
                </div>
            </article>
        );
    };

    return (
        <DataTable
            headers={headers}
            data={organizations}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            emptyMessage="No organizations found."
            showPagination={false}
        />
    );
}

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
            <tr key={id || organization.name || index} className="border-b border-line text-sm text-ink transition-colors last:border-0 hover:bg-soft">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-ink">
                            <Building2 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{organization.name || "Unnamed organization"}</p>
                            <p className="mt-0.5 truncate text-xs text-mute">{organization.slug || id || ""}</p>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-mute">{location(organization)}</td>
                <td className="p-4 text-mute">{organization.email || "—"}</td>
                <td className="p-4 text-center text-mute font-mono">{memberCount(organization) ?? "—"}</td>
                <td className="p-4 text-center">
                    <Link className="xp-btn px-3 py-1.5 text-xs font-mono" href={`/dashboard/admin/organizations/${id}`}>
                        View
                    </Link>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (organization, index) => {
        const id = organizationId(organization);
        return (
            <article key={id || organization.name || index} className="flex flex-col gap-4 rounded-xl border border-line bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft text-ink">
                        <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold text-ink">{organization.name || "Unnamed organization"}</p>
                        <p className="mt-1 break-all text-xs text-mute">{organization.slug || id || ""}</p>
                    </div>
                </div>
                <dl className="flex flex-col gap-2.5 border-t border-line pt-3 text-xs">
                    <div className="flex items-start justify-between gap-4"><dt className="shrink-0 text-mute">Location</dt><dd className="text-right text-ink">{location(organization)}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="shrink-0 text-mute">Email</dt><dd className="break-all text-right text-ink">{organization.email || "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-mute">Members</dt><dd className="font-mono text-ink">{memberCount(organization) ?? "—"}</dd></div>
                </dl>
                <div className="flex justify-end border-t border-line pt-3">
                    <Link className="xp-btn px-3 py-1.5 text-xs font-mono" href={`/dashboard/admin/organizations/${id}`}>
                        View organization
                    </Link>
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
            className="p-0 border-none shadow-none"
        />
    );
}

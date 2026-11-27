import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Mail,
    Phone,
    Home,
    Globe,
    Clock,
    DollarSign,
    Link2,
    Flag,
    Calendar,
} from "lucide-react";
import {
    getAdminOrganizationById,
    getAdminProperties,
    getOrganizationProperties,
    getAdminOrganizationMembers,
    getAuditLogs,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import HeroBand from "@/app/_components/HeroBand";
import AuditLogSection from "@/app/_components/AuditLogSection";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "@/app/_components/DataTable";
import StatusChips from "@/app/_components/StatusChips";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

// ---------- Helpers ----------

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
          });
}

function unwrapOrganization(payload) {
    if (!payload || typeof payload !== "object") return null;
    const candidate =
        payload?.data?.organization ||
        payload?.organization ||
        (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)
            ? payload.data
            : null) ||
        payload;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        return null;
    }
    if (!candidate.id && !candidate._id && !candidate.name && !candidate.slug) {
        return null;
    }
    return candidate;
}

function unwrapArray(payload, keys = []) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
        if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    }
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function statusOf(org) {
    if (!org) return "active";
    const explicit = org.status || org.org_status;
    if (explicit) return String(explicit).toLowerCase();
    const flag = org.isActive ?? org.is_active;
    if (typeof flag === "boolean") {
        return flag ? "active" : "inactive";
    }
    return "active";
}

function formatRole(role) {
    const raw =
        role?.name ||
        role?.value ||
        (typeof role === "string" ? role : "") ||
        "Member";
    return String(raw)
        .trim()
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

const memberName = (member) => {
    const u = member?.user || member?.profile || {};
    return (
        [u.firstName || u.firstname || u.first_name, u.lastName || u.lastname || u.last_name]
            .filter(Boolean)
            .join(" ") ||
        u.name ||
        u.username ||
        u.email ||
        member?.name ||
        member?.email ||
        "Member"
    );
};

function buildDetailRows(org) {
    const status = statusOf(org);
    return [
        { label: "Organization Name", value: org.name, icon: Building2 },
        { label: "Slug", value: org.slug, icon: Link2, preserveCase: true },
        { label: "Email", value: org.email, icon: Mail, preserveCase: true },
        { label: "Phone", value: org.phone, icon: Phone, preserveCase: true },
        { label: "Address", value: org.address, icon: Home },
        { label: "City", value: org.city, icon: MapPin },
        { label: "State / Province", value: org.state || org.province, icon: MapPin },
        { label: "Country", value: org.country, icon: Flag },
        { label: "Timezone", value: org.timezone, icon: Clock, preserveCase: true },
        { label: "Currency", value: org.currency, icon: DollarSign, preserveCase: true },
        { label: "Website", value: org.website, icon: Globe, preserveCase: true },
        {
            label: "Status",
            value:
                status.charAt(0).toUpperCase() +
                status.slice(1).toLowerCase(),
            icon: Building2,
        },
        {
            label: "Created",
            value: formatDate(org.created_at || org.createdAt),
            icon: Calendar,
        },
    ].filter(
        ({ value }) =>
            value !== undefined && value !== null && value !== "" && value !== "—",
    );
}

// ---------- Page ----------

export default async function Page({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string" || !id.trim()) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                <Link
                    href="/dashboard/admin/organizations"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to organizations
                </Link>

                <EmptyState
                    message="Invalid organization id"
                    description="The organization id in the URL is missing or malformed."
                />
            </div>
        );
    }

    const orgId = id.trim();

    const results = await Promise.allSettled([
        getAdminOrganizationById(orgId),
        getOrganizationProperties(orgId),
        getAdminOrganizationMembers(orgId, 100),
        getAdminProperties(),
        getAuditLogs({ organizationId: orgId }),
    ]);

    // Only surface errors from the primary org/members endpoints (properties/audit have fallbacks)
    const dataErrorMessages = getSettledErrorMessages([results[0], results[2]]);

    const result = results[0].status === "fulfilled" ? results[0].value : null;
    const orgPropsRaw = results[1].status === "fulfilled" ? results[1].value : [];
    const membersRaw = results[2].status === "fulfilled" ? results[2].value : [];
    const allAdminPropsRaw = results[3].status === "fulfilled" ? results[3].value : [];
    const auditLogsRaw = results[4].status === "fulfilled" ? results[4].value : [];

    const organization = unwrapOrganization(result);

    if (!organization) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/admin/organizations"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to organizations
                </Link>

                <EmptyState
                    message="Organization not found"
                    description={`No organization was found for id "${orgId}". This organization may have been removed or the link may be incorrect.`}
                />
            </div>
        );
    }

    const directMembers = unwrapArray(membersRaw, ["members", "memberships"]);
    const embeddedMembers = unwrapArray(
        organization?.memberships || organization?.members,
        ["members", "memberships"]
    );
    const memberList = directMembers.length > 0 ? directMembers : embeddedMembers;

    const directProperties = unwrapArray(orgPropsRaw, ["properties"]);
    const embeddedProperties = unwrapArray(organization?.properties, ["properties"]);
    const adminFilteredProperties = unwrapArray(allAdminPropsRaw, ["properties"]).filter(
        (p) => {
            const pOrgId = String(
                p?.organizationId ||
                    p?.organization_id ||
                    p?.organization?.id ||
                    p?.organization?._id ||
                    ""
            ).trim();
            return pOrgId === orgId;
        }
    );

    const propertiesList =
        directProperties.length > 0
            ? directProperties
            : embeddedProperties.length > 0
              ? embeddedProperties
              : adminFilteredProperties;

    const totalProperties = Number(
        organization?._count?.properties ??
            result?.propertyCount ??
            organization?.propertyCount ??
            organization?.propertiesCount ??
            propertiesList.length
    );

    const totalMembers = Number(
        organization?._count?.memberships ??
            organization?._count?.members ??
            result?.memberCount ??
            organization?.memberCount ??
            organization?.membersCount ??
            memberList.length
    );

    const status = statusOf(organization);
    const createdDate = formatDate(organization.created_at || organization.createdAt);
    const details = buildDetailRows(organization);
    const auditLogs = unwrapArray(auditLogsRaw, ["logs", "auditLogs"]);

    const heroStats = [
        {
            label: "Properties",
            value: totalProperties,
            hint: "Managed properties",
        },
        {
            label: "Members",
            value: totalMembers,
            hint: "Active team size",
        },
        {
            label: "Status",
            value:
                status.charAt(0).toUpperCase() +
                status.slice(1).toLowerCase(),
            hint: "Account state",
        },
        {
            label: "Created",
            value: createdDate,
            hint: "Registration date",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const hasContactActions = Boolean(
        organization.email || organization.phone || organization.website
    );

    const heroActions = hasContactActions ? (
        <>
            {organization.email && (
                <a
                    href={`mailto:${organization.email}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    Send email
                </a>
            )}
            {organization.phone && (
                <a
                    href={`tel:${organization.phone}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    Call
                </a>
            )}
            {organization.website && (
                <a
                    href={
                        organization.website.startsWith("http")
                            ? organization.website
                            : `https://${organization.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    Website
                </a>
            )}
        </>
    ) : null;

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/admin/organizations"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to organizations
            </Link>

            {/* ---------- Hero ---------- */}
            <HeroBand
                tagline={`Organization profile · ${today}`}
                title={organization.name || "Organization"}
                description={
                    organization.slug
                        ? `@${organization.slug}`
                        : organization.email ||
                          [organization.city, organization.state, organization.country]
                              .filter(Boolean)
                              .join(", ") ||
                          "No additional information"
                }
                badge={<StatusChips status={status} />}
                stats={heroStats}
                actions={heroActions}
            />

            {/* ---------- Organization information ---------- */}
            <DashboardGridItem title="Organization information">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {details.map(({ label, value, icon: Icon, preserveCase }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-gray-100 bg-white p-3 dark:border-line dark:bg-card"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50">
                                    <Icon
                                        className="h-3.5 w-3.5 text-primary"
                                        aria-hidden="true"
                                    />
                                </div>
                                <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-mute">
                                    {label}
                                </dt>
                            </div>
                            <dd
                                className={`mt-2 break-words text-[13px] text-ink ${
                                    preserveCase ? "" : "capitalize"
                                }`}
                            >
                                {value}
                            </dd>
                        </div>
                    ))}
                </div>
            </DashboardGridItem>

            

            {/* ---------- Organization members ---------- */}
            <DashboardGridItem title={`Organization members (${totalMembers})`}>
                {memberList.length === 0 ? (
                    <EmptyState
                        message="No members"
                        description={`No members found for ${organization.name || "this organization"}.`}
                    />
                ) : (
                    <DataTable
                        data={memberList}
                        showPagination={memberList.length > 10}
                        pageSize={10}
                        className="p-0 border-none shadow-none"
                        rowKey={(member, index) => member.id ?? member.userId ?? index}
                        columns={[
                            {
                                heading: "Member",
                                render: (member) => {
                                    const name = memberName(member);
                                    const email = member.user?.email || member.email;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-semibold uppercase text-ink">
                                                {name.charAt(0) || "M"}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium capitalize text-ink">
                                                    {name}
                                                </p>
                                                {email && (
                                                    <p className="truncate text-xs text-mute">
                                                        {email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Role",
                                className: "text-mute",
                                render: (member) =>
                                    formatRole(
                                        member?.role ||
                                            member?.organizationRole ||
                                            member?.memberRole
                                    ),
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (member) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={
                                                member.status ||
                                                (member.isActive === false ? "inactive" : "active")
                                            }
                                        />
                                    </div>
                                ),
                            },
                            {
                                heading: "Joined",
                                className: "text-xs text-mute",
                                render: (member) =>
                                    formatDate(member.created_at || member.createdAt),
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Audit logs ---------- */}
            <AuditLogSection logs={auditLogs} />
        </div>
    );
}

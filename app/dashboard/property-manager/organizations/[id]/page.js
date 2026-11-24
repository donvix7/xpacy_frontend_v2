import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Users,
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
    getOrganizationById,
    getOrganizationProperties,
    getOrganizationMembers,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "@/app/_components/DataTable";
import StatusChips from "@/app/_components/StatusChips";
import CopyButton from "@/app/_components/CopyButton";
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

const memberName = (member) => {
    const u = member.user || member.profile || {};
    return (
        [u.firstName || u.firstname, u.lastName || u.lastname]
            .filter(Boolean)
            .join(" ") ||
        u.name ||
        u.username ||
        u.email ||
        member.name ||
        member.email ||
        "Member"
    );
};

function buildDetailRows(org) {
    const status = statusOf(org);
    const websiteHref = org.website
        ? org.website.startsWith("http")
            ? org.website
            : `https://${org.website}`
        : null;

    return [
        { label: "Organization Name", value: org.name, icon: Building2 },
        {
            label: "Email",
            value: org.email,
            icon: Mail,
            href: org.email ? `mailto:${org.email}` : null,
            copyValue: org.email,
        },
        {
            label: "Phone",
            value: org.phone,
            icon: Phone,
            href: org.phone ? `tel:${org.phone}` : null,
            copyValue: org.phone,
            mono: true,
        },
        { label: "Address", value: org.address, icon: Home },
        { label: "City", value: org.city, icon: MapPin },
        { label: "State / Province", value: org.state || org.province, icon: MapPin },
        { label: "Country", value: org.country, icon: Flag },
        { label: "Timezone", value: org.timezone, icon: Clock },
        {
            label: "Website",
            value: org.website,
            icon: Globe,
            href: websiteHref,
            external: true,
            copyValue: org.website,
        },
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

const keyValueColumns = [
    {
        heading: "Field",
        render: (row) => {
            const Icon = row.icon;
            return (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-950/40">
                        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-mute">
                        {row.label}
                    </span>
                </div>
            );
        },
    },
    {
        heading: "Details",
        render: (row) => (
            <div
                className={`flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-ink ${
                    row.mono ? "font-mono" : ""
                }`}
            >
                {row.href ? (
                    <a
                        href={row.href}
                        target={row.external ? "_blank" : undefined}
                        rel={row.external ? "noopener noreferrer" : undefined}
                        className="transition-colors hover:text-primary hover:underline"
                    >
                        {row.value}
                    </a>
                ) : (
                    <span>{row.value}</span>
                )}
            </div>
        ),
    },
    {
        heading: "",
        align: "right",
        render: (row) =>
            row.copyValue ? (
                <div className="flex justify-end">
                    <CopyButton
                        value={row.copyValue}
                        label={row.label}
                        iconSize={13}
                    />
                </div>
            ) : null,
    },
];

// ---------- Page ----------

export default async function PropertyManagerOrganizationDetailPage({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string" || !id.trim()) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                <Link
                    href="/dashboard/property-manager/organizations"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to organizations
                </Link>

                <EmptyState
                    icon={<Building2 className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Invalid organization id"
                    message="The organization id in the URL is missing or malformed."
                />
            </div>
        );
    }

    const orgId = id.trim();

    const results = await Promise.allSettled([
        getOrganizationById(orgId),
        getOrganizationMembers(orgId),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const result = results[0].status === "fulfilled" ? results[0].value : null;
    const members = results[1].status === "fulfilled" ? results[1].value : [];
    const organization = result?.organization || result;
    const memberList = Array.isArray(members) ? members : [];
    console.log(result)
    if (!organization || typeof organization !== "object" || Array.isArray(organization)) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/property-manager/organizations"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to organizations
                </Link>

                <EmptyState
                    icon={<Building2 className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Organization not found"
                    message={`No organization was found for id "${orgId}". This organization may have been removed or you do not have permission to view it.`}
                />
            </div>
        );
    }

    const totalMembers =
        result?.memberCount ??
        organization?.memberCount ??
        organization?.membersCount ??
        organization?.members?.length ??
        memberList.length;

    const status = statusOf(organization);
    const createdDate = formatDate(organization.created_at || organization.createdAt);
    const details = buildDetailRows(organization);

    const heroStats = [
        {
            label: "Properties",
            value: result._count.properties,
            hint: "Active team size",
        },
        {
            label: "Members",
            value: result._count.memberships,
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

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/property-manager/organizations"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to organizations
            </Link>

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Organization profile · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {organization.name || "Organization"}
                            </h1>
                            <p className="mt-2 max-w-xl break-all text-[13.5px] leading-relaxed text-side-mute">
                                {organization.slug
                                    ? `@${organization.slug}`
                                    : organization.email || [organization.city, organization.state, organization.country].filter(Boolean).join(", ") || "No additional information"}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusChips status={status} />
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                            >
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 truncate text-[18px] font-semibold leading-tight tracking-[-0.3px] text-white sm:text-[20px]">
                                    {stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>

                    {/* ---------- Action row ---------- */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                        {organization.email && (
                            <Link
                                href={`mailto:${organization.email}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                Send email
                            </Link>
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
                                href={organization.website.startsWith("http") ? organization.website : `https://${organization.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                Website
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- Organization information ---------- */}
            <DashboardGridItem title="Organization information">
                <DataTable
                    data={details}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0 border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

           

            {/* ---------- Organization members ---------- */}
            <DashboardGridItem title="Organization members">
                {memberList.length === 0 ? (
                    <EmptyState
                        icon={<Users className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No members"
                        message={`No members found for ${organization.name || "this organization"}.`}
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
                                className: "capitalize text-mute",
                                render: (member) => member.role ?? "Member",
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (member) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={member.status || (member.isActive === false ? "inactive" : "active")}
                                        />
                                    </div>
                                ),
                            },
                            {
                                heading: "Joined",
                                className: "text-xs text-mute",
                                render: (member) => formatDate(member.created_at || member.createdAt),
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

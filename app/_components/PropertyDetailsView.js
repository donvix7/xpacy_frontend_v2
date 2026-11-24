import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Users,
    Home,
    DollarSign,
    Flag,
    Calendar,
    DoorOpen,
    Layers,
    Hash,
    Plus,
    Clock,
    Compass,
    FileText,
    BookOpen,
    Tag,
    Image as ImageIcon,
    Briefcase,
    ArrowUpRight,
    Pencil,
    UserRound,
    Wrench,
    Files,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "@/app/_components/DataTable";
import StatusChips from "@/app/_components/StatusChips";
import CopyButton from "@/app/_components/CopyButton";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import {
    DeletePropertyButton,
    AddManagerButton,
    RemoveManagerButton,
    AddOwnerButton,
} from "@/app/_components/PropertyActionControls";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "short",
              day: "numeric",
          });
}

function titleCase(value) {
    if (!value) return "—";
    return String(value)
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusOf(property) {
    if (!property) return "active";
    const explicit =
        property.status ||
        property.property_status ||
        property.availability_status;
    if (explicit) return String(explicit).toLowerCase();
    const flag = property.isActive ?? property.is_active;
    if (typeof flag === "boolean") {
        return flag ? "active" : "inactive";
    }
    return "active";
}

function personName(person) {
    const u = person?.user || person?.ownerProfile || person?.profile || {};
    return (
        [
            u.firstName || u.firstname || person?.firstName || person?.firstname,
            u.lastName || u.lastname || person?.lastName || person?.lastname,
        ]
            .filter(Boolean)
            .join(" ") ||
        person?.name ||
        u.name ||
        u.username ||
        person?.username ||
        person?.email ||
        u.email ||
        "Assigned Member"
    );
}

function personEmail(person) {
    const u = person?.user || person?.ownerProfile || person?.profile || {};
    return u.email || person?.email || null;
}

export function normalizeProperty(p) {
    if (!p) return null;
    const name = p.name || p.property_name || p.title || "Untitled Property";
    const status = statusOf(p);
    const propertyType = p.propertyType || p.property_type || "RESIDENTIAL";
    const address = p.address || "";
    const city = p.city || "";
    const state = p.state || p.province || "";
    const country = p.country || "";
    const postalCode = p.postalCode || p.postal_code || p.zipCode || "";
    const latitude = p.latitude ?? null;
    const longitude = p.longitude ?? null;
    const yearBuilt = p.yearBuilt ?? p.year_built ?? null;
    const totalFloors = p.totalFloors ?? p.total_floors ?? null;
    const totalUnits = p.totalUnits ?? p.total_units ?? p._count?.units ?? null;
    const description = p.description || p.property_description || "";
    const rawPrice = p.price ?? p.property_price ?? null;
    const price =
        rawPrice !== null && !Number.isNaN(Number(rawPrice))
            ? Number(rawPrice)
            : null;
    const createdAt = p.createdAt || p.created_at || p.date_added || null;
    const updatedAt = p.updatedAt || p.updated_at || null;
    const organizationId = p.organizationId || p.organization_id || null;
    const media =
        Array.isArray(p.media) && p.media.length > 0
            ? p.media
            : Array.isArray(p.images)
              ? p.images.map((img) =>
                    typeof img === "string"
                        ? { url: img }
                        : { url: img.image_url || img.url }
                )
              : [];
    const managers = Array.isArray(p.managers) ? p.managers : [];
    const owners = Array.isArray(p.owners) ? p.owners : [];
    const counts = {
        units: p._count?.units ?? 0,
        buildings: p._count?.buildings ?? 0,
        listings: p._count?.listings ?? 0,
        leases: p._count?.leases ?? 0,
        bookings: p._count?.bookings ?? 0,
    };

    return {
        ...p,
        name,
        status,
        propertyType,
        address,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        yearBuilt,
        totalFloors,
        totalUnits,
        description,
        price,
        createdAt,
        updatedAt,
        organizationId,
        media,
        managers,
        owners,
        counts,
    };
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
                    <Link
                        href={row.href}
                        className="inline-flex items-center gap-1 transition-colors hover:text-primary hover:underline"
                    >
                        <span>{row.value}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-mute" />
                    </Link>
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

function buildDetailRows(property, basePath, organizationName) {
    const hasCoords =
        property.latitude !== null &&
        property.latitude !== undefined &&
        property.longitude !== null &&
        property.longitude !== undefined;
    const resolvedOrgName =
        organizationName ||
        property.organization?.name ||
        (property.organizationId ? "View Organization" : null);

    return [
        { label: "Property Name", value: property.name, icon: Building2 },
        {
            label: "Property Type",
            value: titleCase(property.propertyType),
            icon: Building2,
        },
        {
            label: "Status",
            value: titleCase(property.status),
            icon: Tag,
        },
        { label: "Address", value: property.address, icon: Home },
        { label: "City", value: property.city, icon: MapPin },
        { label: "State / Province", value: property.state, icon: MapPin },
        { label: "Country", value: property.country, icon: Flag },
        {
            label: "Postal Code",
            value: property.postalCode,
            icon: Hash,
            copyValue: property.postalCode || null,
            mono: true,
        },
        hasCoords && {
            label: "Coordinates",
            value: `${property.latitude}, ${property.longitude}`,
            icon: Compass,
            copyValue: `${property.latitude}, ${property.longitude}`,
            mono: true,
        },
        {
            label: "Year Built",
            value: property.yearBuilt ? String(property.yearBuilt) : null,
            icon: Calendar,
        },
        {
            label: "Total Floors",
            value:
                property.totalFloors !== null && property.totalFloors !== undefined
                    ? String(property.totalFloors)
                    : null,
            icon: Layers,
        },
        {
            label: "Total Units",
            value:
                property.totalUnits !== null && property.totalUnits !== undefined
                    ? String(property.totalUnits)
                    : null,
            icon: DoorOpen,
        },
        {
            label: "Price / Rent",
            value:
                property.price !== null && property.price !== undefined
                    ? `₦${Number(property.price).toLocaleString()}`
                    : null,
            icon: DollarSign,
            mono: true,
        },
        resolvedOrgName && {
            label: "Organization",
            value: resolvedOrgName,
            icon: Briefcase,
            href: property.organizationId
                ? `${basePath}/organizations/${property.organizationId}`
                : null,
        },
        {
            label: "Created",
            value: formatDate(property.createdAt),
            icon: Calendar,
        },
        {
            label: "Last Updated",
            value: formatDate(property.updatedAt),
            icon: Clock,
        },
    ]
        .filter(Boolean)
        .filter(
            ({ value }) =>
                value !== undefined && value !== null && value !== "" && value !== "—"
        );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function PropertyDetailsView({
    rawProperty,
    units = [],
    tenants = [],
    maintenanceRequests = [],
    availableOwners = [],
    availableMembers = [],
    organizationName = null,
    basePath = "/dashboard/property-owner",
    dataErrorMessages = [],
}) {
    const property = normalizeProperty(rawProperty);
    const details = buildDetailRows(property, basePath, organizationName);
    const unitsList = Array.isArray(units) ? units : [];
    const tenantsList = Array.isArray(tenants) ? tenants : [];
    const maintenanceList = Array.isArray(maintenanceRequests)
        ? maintenanceRequests
        : [];

    const peopleList = [
        ...property.managers.map((m) => ({
            ...m,
            group: "Manager",
            roleLabel: titleCase(m.role || "Manager"),
        })),
        ...property.owners.map((o) => ({
            ...o,
            group: "Owner",
            roleLabel: titleCase(o.role || "Owner"),
        })),
    ];

    const totalUnitsCount = property.totalUnits ?? unitsList.length ?? 0;

    const heroStats = [
        {
            label: "Total Units",
            value: totalUnitsCount,
            hint: `${property.counts.units} unit${property.counts.units === 1 ? "" : "s"} created`,
        },
        {
            label: "Property Type",
            value: titleCase(property.propertyType),
            hint: [
                property.totalFloors ? `${property.totalFloors} floor${property.totalFloors === 1 ? "" : "s"}` : null,
                property.yearBuilt ? `Built ${property.yearBuilt}` : null,
            ]
                .filter(Boolean)
                .join(" · ") || "Classification",
        },
        {
            label: "Team",
            value: peopleList.length,
            hint: `${property.managers.length} manager${property.managers.length === 1 ? "" : "s"} · ${property.owners.length} owner${property.owners.length === 1 ? "" : "s"}`,
        },
        {
            label: "Leases & Bookings",
            value: property.counts.leases + property.counts.bookings,
            hint: `${property.counts.leases} leases · ${property.counts.bookings} bookings`,
        },
    ];

    const countCards = [
        { label: "Units", href: `${basePath}/properties/${property.id}/units`, value: property.counts.units, icon: DoorOpen },
        { label: "Buildings", href: `${basePath}/properties/${property.id}/buildings`, value: property.counts.buildings, icon: Building2 },
        { label: "Listings", href: `${basePath}/properties/${property.id}/listings`, value: property.counts.listings, icon: Tag },
        { label: "Leases", href: `${basePath}/properties/${property.id}/leases`, value: property.counts.leases, icon: FileText },
        { label: "Bookings", href: `${basePath}/properties/${property.id}/bookings`, value: property.counts.bookings, icon: BookOpen },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const locationText = [
        property.address,
        property.city,
        property.state,
        property.country,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={`${basePath}/properties`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to properties
            </Link>

            {/* ---------- Hero Band ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Property profile · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px] capitalize">
                                {property.name}
                            </h1>
                            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-side-mute">
                                {locationText || "No address provided"}
                                {property.postalCode ? ` · ${property.postalCode}` : ""}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusChips status={property.status} />
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

                    {/* Action row */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                        <Link
                            href={`/admin/add-new-property?propertyId=${encodeURIComponent(property.id)}&returnTo=${encodeURIComponent(`${basePath}/properties/${property.id}`)}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit property
                        </Link>
                        <Link
                            href={`/admin/add-new-maintenance?propertyId=${encodeURIComponent(property.id)}&returnTo=${encodeURIComponent(`${basePath}/properties/${property.id}`)}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                            Maintenance request
                        </Link>
                        {property.organizationId && (
                            <Link
                                href={`${basePath}/organizations/${property.organizationId}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                                Organization
                            </Link>
                        )}
                        <Link
                            href={`${basePath}/properties/${encodeURIComponent(property.id)}/documents`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <Files className="h-3.5 w-3.5" aria-hidden="true" />
                            All Documents
                        </Link>
                        <Link
                            href={`${basePath}/properties/${encodeURIComponent(property.id)}/media`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Media
                        </Link>

                        <DeletePropertyButton
                            propertyId={property.id}
                            propertyName={property.name}
                            redirectTo={`${basePath}/properties`}
                        />
                    </div>
                </div>
            </section>

            {/* ---------- Portfolio Overview (_count) ---------- */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {countCards.map(({ label, value, icon: Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                    >

                        <div
                            className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 shadow-sm"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-mute">
                                {label}
                            </p>
                            <p className="text-lg font-bold leading-tight text-ink tabular-nums">
                                {value}
                            </p>
                        </div>
                    </div>
                    </Link>
                ))}
            </div>

            {/* ---------- Description ---------- */}
            {property.description && (
                <DashboardGridItem title="Description">
                    <p className="text-sm leading-relaxed text-ink">
                        {property.description}
                    </p>
                </DashboardGridItem>
            )}

            {/* ---------- Property Information (DataTable) ---------- */}
            <DashboardGridItem title="Property Information">
                <DataTable
                    data={details}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0 border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

            {/* ---------- Managers & Owners (DataTable) ---------- */}
            <DashboardGridItem title={`Managers & Owners (${peopleList.length})`}>
                <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                    <AddManagerButton
                        propertyId={property.id}
                        availableMembers={availableMembers}
                    />
                    <AddOwnerButton
                        propertyId={property.id}
                        availableOwners={availableOwners}
                    />
                </div>
                {peopleList.length === 0 ? (
                    <EmptyState
                        icon={<Users className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No managers or owners assigned"
                        message={`No managers or owners are currently linked to ${property.name}.`}
                    />
                ) : (
                    <DataTable
                        data={peopleList}
                        showPagination={peopleList.length > 10}
                        className="p-0 border-none shadow-none"
                        rowKey={(person, index) => person.id ?? person.userId ?? index}
                        columns={[
                            {
                                heading: "Person",
                                render: (person) => {
                                    const name = personName(person);
                                    const email = personEmail(person);
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-ink truncate">
                                                    {name}
                                                </p>
                                                <p className="text-xs text-mute truncate">
                                                    {email || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Role",
                                render: (person) => (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center rounded-md bg-soft px-2.5 py-1 text-xs font-semibold text-ink">
                                            {person.roleLabel}
                                        </span>
                                        {person.ownershipPercentage != null && (
                                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                                {person.ownershipPercentage}%
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                heading: "Assignment",
                                className: "text-xs text-mute",
                                render: (person) =>
                                    person.startDate || person.endDate ? (
                                        <div className="space-y-0.5">
                                            <p>Start: {formatDate(person.startDate)}</p>
                                            {person.endDate && (
                                                <p>End: {formatDate(person.endDate)}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <span>Assigned {formatDate(person.createdAt)}</span>
                                    ),
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (person) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={(person.status || "active").toLowerCase()}
                                        />
                                    </div>
                                ),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (person) =>
                                    person.group === "Manager" && (person.id || person.userId) ? (
                                        <div className="flex justify-end">
                                            <RemoveManagerButton
                                                propertyId={property.id}
                                                managerId={person.id || person.userId}
                                                managerName={personName(person)}
                                            />
                                        </div>
                                    ) : null,
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Property Tenants (DataTable) ---------- */}
            <DashboardGridItem title={`Tenants (${tenantsList.length})`}>
                <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                    <Link
                        href={`/admin/add-new-tenant?propertyId=${encodeURIComponent(property.id)}&returnTo=${encodeURIComponent(`${basePath}/properties/${property.id}`)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add tenant
                    </Link>
                </div>
                {tenantsList.length === 0 ? (
                    <EmptyState
                        icon={<UserRound className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No tenants assigned"
                        message={`No tenants are currently residing in ${property.name}.`}
                    />
                ) : (
                    <DataTable
                        data={tenantsList}
                        showPagination={tenantsList.length > 10}
                        className="p-0 border-none shadow-none"
                        rowKey={(tenant, index) => tenant.id ?? tenant._id ?? index}
                        columns={[
                            {
                                heading: "Tenant",
                                render: (tenant) => {
                                    const name = personName(tenant);
                                    const email = personEmail(tenant);
                                    const tId = tenant.id || tenant._id;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                {tId ? (
                                                    <Link
                                                        href={`${basePath}/tenants/${tId}`}
                                                        className="font-semibold text-ink hover:text-primary hover:underline block truncate"
                                                    >
                                                        {name}
                                                    </Link>
                                                ) : (
                                                    <p className="font-semibold text-ink truncate">{name}</p>
                                                )}
                                                <p className="text-xs text-mute truncate">
                                                    {email || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Phone",
                                className: "font-mono text-xs text-mute",
                                render: (tenant) => tenant.phone || tenant.phoneNumber || "—",
                            },
                            {
                                heading: "Unit / Occupation",
                                className: "text-xs text-ink",
                                render: (tenant) => {
                                    const unitLabel = tenant.unit?.unitNumber
                                        ? `Unit ${tenant.unit.unitNumber}`
                                        : tenant.unit?.name || null;
                                    return (
                                        <div>
                                            <p className="font-medium">
                                                {unitLabel || tenant.occupation || "—"}
                                            </p>
                                            {unitLabel && tenant.occupation && (
                                                <p className="text-mute">{tenant.occupation}</p>
                                            )}
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (tenant) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={(tenant.status || "active").toLowerCase()}
                                        />
                                    </div>
                                ),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (tenant) => {
                                    const tId = tenant.id || tenant._id;
                                    return tId ? (
                                        <Link
                                            href={`${basePath}/tenants/${tId}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                        >
                                            View
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    ) : null;
                                },
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Maintenance Requests (DataTable) ---------- */}
            <DashboardGridItem title={`Maintenance Requests (${maintenanceList.length})`}>
                <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                    <Link
                        href={`/admin/add-new-maintenance?propertyId=${encodeURIComponent(property.id)}&returnTo=${encodeURIComponent(`${basePath}/properties/${property.id}`)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New maintenance request
                    </Link>
                </div>
                {maintenanceList.length === 0 ? (
                    <EmptyState
                        icon={<Wrench className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No maintenance requests"
                        message={`No maintenance requests have been logged for ${property.name} yet.`}
                    />
                ) : (
                    <DataTable
                        data={maintenanceList}
                        showPagination={maintenanceList.length > 10}
                        className="p-0 border-none shadow-none"
                        rowKey={(req, index) => req.id ?? req._id ?? index}
                        columns={[
                            {
                                heading: "Request",
                                render: (req) => {
                                    const reqId = req.id || req._id;
                                    const unitLabel = req.unit?.unitNumber
                                        ? `Unit ${req.unit.unitNumber}`
                                        : req.unit?.name || null;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                                                <Wrench className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                {reqId ? (
                                                    <Link
                                                        href={`${basePath}/properties/${encodeURIComponent(property.id)}/maintenance/${encodeURIComponent(reqId)}`}
                                                        className="font-semibold text-ink hover:text-primary hover:underline block truncate"
                                                    >
                                                        {req.title || "Maintenance Request"}
                                                    </Link>
                                                ) : (
                                                    <p className="font-semibold text-ink truncate">
                                                        {req.title || "Maintenance Request"}
                                                    </p>
                                                )}
                                                <p className="text-xs text-mute truncate">
                                                    {unitLabel || req.description || "Entire property"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Category",
                                className: "text-xs text-ink",
                                render: (req) => titleCase(req.category),
                            },
                            {
                                heading: "Priority",
                                center: true,
                                render: (req) => {
                                    const p = String(req.priority || "MEDIUM").toUpperCase();
                                    const pillClass =
                                        p === "URGENT" || p === "HIGH"
                                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                            : p === "MEDIUM"
                                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                              : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
                                    return (
                                        <div className="flex justify-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pillClass}`}
                                            >
                                                {titleCase(p)}
                                            </span>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Date",
                                className: "font-mono text-xs text-mute",
                                render: (req) =>
                                    formatDate(req.scheduledAt || req.createdAt),
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (req) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={(req.status || "open").toLowerCase()}
                                        />
                                    </div>
                                ),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (req) => {
                                    const reqId = req.id || req._id;
                                    return reqId ? (
                                        <Link
                                            href={`${basePath}/properties/${encodeURIComponent(property.id)}/maintenance/${encodeURIComponent(reqId)}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                        >
                                            View
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    ) : null;
                                },
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Units (DataTable) ---------- */}
            <DashboardGridItem title={`Units (${unitsList.length})`}>
                {unitsList.length === 0 ? (
                    <EmptyState
                        icon={<DoorOpen className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No units yet"
                        message={`No units have been added to ${property.name} yet (${property.totalUnits ?? 0} planned).`}
                    />
                ) : (
                    <DataTable
                        data={unitsList}
                        showPagination={unitsList.length > 10}
                        className="p-0 border-none shadow-none"
                        rowKey={(unit, index) => unit.id ?? unit._id ?? index}
                        columns={[
                            {
                                heading: "Unit",
                                render: (unit, index) => (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft text-ink">
                                            <DoorOpen className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-ink">
                                                {unit.unitNumber || unit.name || `Unit ${index + 1}`}
                                            </p>
                                            {unit.floorNumber !== undefined &&
                                                unit.floorNumber !== null && (
                                                    <p className="text-xs text-mute">
                                                        Floor {unit.floorNumber}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                heading: "Type / Bedrooms",
                                className: "text-xs text-mute",
                                render: (unit) =>
                                    titleCase(unit.unitType) !== "—"
                                        ? titleCase(unit.unitType)
                                        : unit.bedrooms
                                          ? `${unit.bedrooms} Bed`
                                          : "—",
                            },
                            {
                                heading: "Price / Rent",
                                render: (unit) => {
                                    const amount =
                                        unit.rentAmount ?? unit.price ?? unit.rent;
                                    return amount !== null && amount !== undefined ? (
                                        <span className="font-mono font-semibold text-ink">
                                            ₦{Number(amount).toLocaleString()}
                                        </span>
                                    ) : (
                                        "—"
                                    );
                                },
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (unit) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={(
                                                unit.status ||
                                                unit.availabilityStatus ||
                                                "available"
                                            ).toLowerCase()}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Media ---------- */}
            <DashboardGridItem title={`Media (${property.media.length})`}>
                {property.media.length === 0 ? (
                    <EmptyState
                        icon={<ImageIcon className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No media uploaded"
                        message={`No photos or media files have been uploaded for ${property.name} yet.`}
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {property.media.map((item, index) => (
                            <div
                                key={item.id || item.url || index}
                                className="overflow-hidden rounded-xl border border-line bg-soft aspect-4/3"
                            >
                                <img
                                    src={item.url || item.image_url}
                                    alt={item.caption || `${property.name} media ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}


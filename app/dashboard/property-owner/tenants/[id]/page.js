import Link from "next/link";
import {
    ChevronLeft,
    User,
    UserRound,
    Mail,
    Phone,
    Home,
    Calendar,
    DollarSign,
    Clock,
    ShieldCheck,
    MapPin,
    Briefcase,
    FileText,
    Wallet,
    Hash,
    IdCard,
    Contact,
    Building2,
    DoorOpen,
    CheckCircle2,
    ArrowUpRight,
    Pencil,
} from "lucide-react";
import { getTenantById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "@/app/_components/DataTable";
import StatusChips from "@/app/_components/StatusChips";
import CopyButton from "@/app/_components/CopyButton";
import LinkTenantToUserButton from "@/app/_components/LinkTenantToUserButton";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { formatCurrency } from "@/app/_lib/utils";
import { SAMPLE_TENANT_DETAIL } from "@/app/_lib/sample-tenants";

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

function displayName(tenant) {
    if (!tenant) return "Tenant";
    const fullName = [tenant.firstName, tenant.lastName].filter(Boolean).join(" ");
    if (fullName) return fullName;
    if (tenant.name) return tenant.name;
    if (tenant.user?.firstName || tenant.user?.lastName) {
        return [tenant.user.firstName, tenant.user.lastName].filter(Boolean).join(" ");
    }
    if (tenant.user?.name) return tenant.user.name;
    return tenant.email || "Tenant";
}

function statusOf(tenant) {
    if (!tenant) return "active";
    const explicit = tenant.status || tenant.tenant_status || tenant.tenantStatus;
    if (explicit) return String(explicit).toLowerCase();
    const flag = tenant.isActive ?? tenant.is_active;
    if (typeof flag === "boolean") {
        return flag ? "active" : "inactive";
    }
    return "active";
}

function titleCase(value) {
    if (!value) return "—";
    return String(value)
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatIdType(type) {
    if (!type) return "—";
    const map = {
        "drivers-license": "Driver's License",
        nin: "National ID (NIN)",
        passport: "International Passport",
        voters: "Voter's Card",
    };
    return map[type.toLowerCase()] || titleCase(type);
}

function buildDetailRows(tenant) {
    const identification = tenant.identification || {};
    const idType =
        tenant.idType ||
        tenant.identificationType ||
        identification.type ||
        identification.idType;
    const idNumber =
        tenant.idNumber ||
        tenant.identificationNumber ||
        identification.number ||
        identification.idNumber;
    const phone = tenant.phone || tenant.phoneNumber;

    return [
        { label: "First Name", value: tenant.firstName, icon: User },
        { label: "Last Name", value: tenant.lastName, icon: User },
        {
            label: "Email Address",
            value: tenant.email,
            icon: Mail,
            href: tenant.email ? `mailto:${tenant.email}` : null,
            copyValue: tenant.email,
        },
        {
            label: "Phone Number",
            value: phone,
            icon: Phone,
            href: phone ? `tel:${phone}` : null,
            copyValue: phone,
            mono: true,
        },
        { label: "Occupation", value: tenant.occupation, icon: Briefcase },
        { label: "Gender", value: titleCase(tenant.gender), icon: UserRound },
        { label: "Date of Birth", value: formatDate(tenant.dateOfBirth), icon: Calendar },
        { label: "ID Type", value: formatIdType(idType), icon: IdCard },
        { label: "ID Number", value: idNumber, icon: Hash, copyValue: idNumber, mono: true },
        { label: "ID Issued Date", value: formatDate(identification.issuedDate), icon: Calendar },
        { label: "ID Expiry Date", value: formatDate(identification.expiryDate), icon: Calendar },
        {
            label: "Linked User Account",
            value:
                tenant.user?.email ||
                tenant.userId ||
                "Not linked",
            icon: ShieldCheck,
            copyValue: tenant.userId || tenant.user?.id || null,
            mono: Boolean(tenant.userId && !tenant.user?.email),
        },
        {
            label: "Registration Date",
            value: formatDate(tenant.createdAt || tenant.created_at),
            icon: Calendar,
        },
        {
            label: "Last Updated",
            value: formatDate(tenant.updatedAt || tenant.updated_at),
            icon: Clock,
        },
    ].filter(
        ({ value }) =>
            value !== undefined && value !== null && value !== "" && value !== "—"
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
                        className="transition-colors hover:text-primary hover:underline"
                    >
                        {row.value}
                    </a>
                ) : (
                    <span>{row.value}</span>
                )}
                {row.badge && (
                    <span className="rounded-md bg-soft px-2 py-0.5 text-[11px] font-semibold text-mute">
                        {row.badge}
                    </span>
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

function resolveLeases(tenant) {
    if (Array.isArray(tenant.leases) && tenant.leases.length > 0) {
        return tenant.leases;
    }
    if (tenant.lease) {
        return [tenant.lease];
    }
    if (tenant.currentLease) {
        return [tenant.currentLease];
    }
    return [];
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function TenantDetailsPage({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string" || !id.trim()) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                <Link
                    href="/dashboard/property-owner/tenants"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to tenants
                </Link>

                <EmptyState
                    icon={<UserRound className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Invalid tenant ID"
                    message="The tenant ID in the URL is missing or malformed."
                />
            </div>
        );
    }

    const tenantId = id.trim();

    const results = await Promise.allSettled([getTenantById(tenantId)]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const result = results[0].status === "fulfilled" ? results[0].value : null;

    // Normalize response wrapper: { success: true, data: { ... } } or { tenant: { ... } }
    const tenant =
        result?.data?.tenant ??
        result?.data ??
        result?.tenant ??
        result ??
        (tenantId === SAMPLE_TENANT_DETAIL.id ? SAMPLE_TENANT_DETAIL : null);

    if (!tenant || typeof tenant !== "object" || Array.isArray(tenant)) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/property-owner/tenants"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to tenants
                </Link>

                <EmptyState
                    icon={<UserRound className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Tenant not found"
                    message={`No tenant was found for ID "${tenantId}". The record may have been removed or the link is incorrect.`}
                />
            </div>
        );
    }

    const tenantName = displayName(tenant);
    const status = statusOf(tenant);
    const details = buildDetailRows(tenant);
    const leases = resolveLeases(tenant);

    // Active Lease details
    const activeLease = leases[0] || null;
    const property =
        tenant.property ||
        activeLease?.property ||
        (Array.isArray(activeLease?.property) ? activeLease.property[0] : null);
    const propertyName =
        property?.name || property?.title || property?.property_name || "—";
    const propertyId = property?.id || property?._id;

    const unit =
        tenant.unit ||
        activeLease?.unit ||
        (Array.isArray(activeLease?.unit) ? activeLease.unit[0] : null);
    const unitName =
        unit?.unitNumber
            ? `Unit ${unit.unitNumber}`
            : unit?.name || unit?.unitName || "—";

    const rentAmount =
        tenant.rentAmount ??
        activeLease?.rentAmount ??
        activeLease?.rent ??
        activeLease?.amount;

    const idDoc = tenant.identification || {};

    // Employment details
    const emp = tenant.employmentInformation || tenant.employmentInfo || tenant.employment || {};
    const employer = emp.employer || emp.company || emp.employerName || tenant.employer;
    const jobTitle = emp.position || emp.jobTitle || emp.role || tenant.occupation;
    const monthlyIncome = emp.monthlyIncome || emp.income || emp.salary || tenant.monthlyIncome;
    const workAddress = emp.workAddress || emp.address;
    const workEmail = emp.workEmail;
    const workPhone = emp.workPhone;

    const hasEmployment = Boolean(employer || jobTitle || monthlyIncome || workAddress || workEmail || workPhone);

    // Emergency / Next of kin
    const emg = tenant.emergencyContact || tenant.nextOfKin || tenant.guarantor || {};
    const emgName = typeof emg === "string" ? emg : emg.name || emg.fullName;
    const emgRelation = typeof emg === "object" ? emg.relationship || emg.relation : null;
    const emgPhone = typeof emg === "object" ? emg.phone || emg.phoneNumber : null;
    const emgEmail = typeof emg === "object" ? emg.email : null;
    const emgAddress = typeof emg === "object" ? emg.address : null;

    const hasEmergency = Boolean(emgName || emgPhone || emgEmail || emgAddress);

    // Hero stats (context-aware for tenants with or without leases)
    const heroStats = [
        {
            label: propertyName !== "—" ? "Property" : "Assigned Unit",
            value: propertyName !== "—" ? propertyName : "Not assigned",
            hint: unitName !== "—" ? unitName : "No active unit",
        },
        {
            label: "Status",
            value: titleCase(status),
            hint: "Tenancy state",
        },
        {
            label: rentAmount != null ? "Rent" : (jobTitle ? "Occupation" : "Leases"),
            value: rentAmount != null
                ? formatCurrency(rentAmount)
                : (jobTitle ? titleCase(jobTitle) : `${leases.length} leases`),
            hint: rentAmount != null
                ? (activeLease?.billingCycle ? titleCase(activeLease.billingCycle) : "Per cycle")
                : (employer || "Registered"),
        },
        {
            label: idDoc.type ? "Identity Doc" : "Joined",
            value: idDoc.type ? formatIdType(idDoc.type) : formatDate(tenant.createdAt || tenant.created_at),
            hint: idDoc.number ? `No: ${idDoc.number}` : "Onboarding date",
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

            {/* Back link */}
            <Link
                href="/dashboard/property-owner/tenants"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to tenants
            </Link>

            {/* ---------- Hero Section (1:1 with Organization ID page) ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Tenant profile · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {tenantName}
                            </h1>
                            <p className="mt-2 max-w-xl break-all text-[13.5px] leading-relaxed text-side-mute">
                                {[
                                    propertyName !== "—" ? propertyName : null,
                                    unitName !== "—" ? unitName : null,
                                    tenant.email,
                                ]
                                    .filter(Boolean)
                                    .join(" · ") || "Tenant Record"}
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

                    {/* Action row */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                        <Link
                            href={`/admin/add-new-tenant?tenantId=${encodeURIComponent(tenant.id || tenantId)}&returnTo=${encodeURIComponent(`/dashboard/property-owner/tenants/${tenant.id || tenantId}`)}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit tenant
                        </Link>
                        <LinkTenantToUserButton
                            tenantId={tenant.id || tenantId}
                            tenantName={tenantName}
                            tenantEmail={tenant.email || ""}
                            linkedUserId={tenant.userId || tenant.user?.id || null}
                            linkedUserEmail={tenant.user?.email || null}
                        />
                        {tenant.email && (
                            <Link
                                href={`mailto:${tenant.email}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                Send email
                            </Link>
                        )}
                        {(tenant.phone || tenant.phoneNumber) && (
                            <a
                                href={`tel:${tenant.phone || tenant.phoneNumber}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                                Call
                            </a>
                        )}
                        {propertyId && (
                            <Link
                                href={`/dashboard/property-owner/properties/${propertyId}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                                View property
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- Identity Verification & Document Banner ---------- */}
            {idDoc.type && (
                <div className="rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <IdCard className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-ink text-base">
                                        {formatIdType(idDoc.type)}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verified
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-mute">
                                    <span>Number: {idDoc.number || "—"}</span>
                                    {idDoc.number && (
                                        <CopyButton
                                            value={idDoc.number}
                                            label="ID Number"
                                            iconSize={12}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 border-t border-line pt-3 text-xs sm:border-t-0 sm:pt-0">
                            {idDoc.issuedDate && (
                                <div>
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-mute block">
                                        Issued Date
                                    </span>
                                    <span className="mt-0.5 font-medium text-ink block">
                                        {formatDate(idDoc.issuedDate)}
                                    </span>
                                </div>
                            )}
                            {idDoc.expiryDate && (
                                <div>
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-mute block">
                                        Expiry Date
                                    </span>
                                    <span className="mt-0.5 font-medium text-ink block">
                                        {formatDate(idDoc.expiryDate)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Tenant information ---------- */}
            <DashboardGridItem title="Tenant information">
                <DataTable
                    data={details}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0 border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

            {/* ---------- Employment & Financial Profile ---------- */}
            {hasEmployment && (
                <DashboardGridItem title="Employment & Financial Profile">
                    <DataTable
                        data={[
                            employer && {
                                label: "Employer",
                                value: employer,
                                icon: Building2,
                            },
                            jobTitle && {
                                label: "Position / Occupation",
                                value: titleCase(jobTitle),
                                icon: Briefcase,
                            },
                            emp.employmentType && {
                                label: "Employment Type",
                                value: titleCase(emp.employmentType),
                                icon: ShieldCheck,
                            },
                            monthlyIncome != null && {
                                label: "Monthly Income",
                                value: formatCurrency(monthlyIncome),
                                icon: Wallet,
                                mono: true,
                            },
                            workAddress && {
                                label: "Work Address",
                                value: workAddress,
                                icon: MapPin,
                            },
                            workEmail && {
                                label: "Work Email",
                                value: workEmail,
                                icon: Mail,
                                href: `mailto:${workEmail}`,
                                copyValue: workEmail,
                            },
                            workPhone && {
                                label: "Work Phone",
                                value: workPhone,
                                icon: Phone,
                                href: `tel:${workPhone}`,
                                copyValue: workPhone,
                                mono: true,
                            },
                        ].filter(Boolean)}
                        columns={keyValueColumns}
                        showPagination={false}
                        className="p-0 border-none shadow-none"
                        rowKey={(row) => row.label}
                    />
                </DashboardGridItem>
            )}

            {/* ---------- Emergency Contact / Next of Kin ---------- */}
            {hasEmergency && (
                <DashboardGridItem title="Emergency Contact & Next of Kin">
                    <DataTable
                        data={[
                            emgName && {
                                label: "Contact Name",
                                value: emgName,
                                icon: Contact,
                                badge: emgRelation ? titleCase(emgRelation) : null,
                            },
                            emgPhone && {
                                label: "Phone Number",
                                value: emgPhone,
                                icon: Phone,
                                href: `tel:${emgPhone}`,
                                copyValue: emgPhone,
                                mono: true,
                            },
                            emgEmail && {
                                label: "Email Address",
                                value: emgEmail,
                                icon: Mail,
                                href: `mailto:${emgEmail}`,
                                copyValue: emgEmail,
                            },
                            emgAddress && {
                                label: "Address",
                                value: emgAddress,
                                icon: Home,
                            },
                        ].filter(Boolean)}
                        columns={keyValueColumns}
                        showPagination={false}
                        className="p-0 border-none shadow-none"
                        rowKey={(row) => row.label}
                    />
                </DashboardGridItem>
            )}

            {/* ---------- Lease & Property Information ---------- */}
            <DashboardGridItem title="Leases & Tenancy History">
                {leases.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No active leases"
                        message={`No active or past leases found for ${tenantName}. This tenant is registered but not currently assigned to a property unit.`}
                    />
                ) : (
                    <DataTable
                        data={leases}
                        showPagination={leases.length > 5}
                        pageSize={5}
                        className="p-0 border-none shadow-none"
                        rowKey={(lease, index) => lease.id ?? lease._id ?? index}
                        columns={[
                            {
                                heading: "Property / Unit",
                                render: (lease) => {
                                    const p = Array.isArray(lease?.property) ? lease.property[0] : lease?.property;
                                    const u = Array.isArray(lease?.unit) ? lease.unit[0] : lease?.unit;
                                    const pName = p?.name || p?.title || propertyName;
                                    const uName = u?.unitNumber ? `Unit ${u.unitNumber}` : u?.name || unitName;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft text-ink">
                                                <DoorOpen className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-ink text-[13px]">
                                                    {pName}
                                                </p>
                                                <p className="text-xs text-mute font-mono">
                                                    {uName}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Rent Amount",
                                render: (lease) => {
                                    const amt = lease.rentAmount ?? lease.amount ?? lease.rent;
                                    return (
                                        <span className="font-mono text-[12.5px] font-semibold text-ink">
                                            {amt != null ? formatCurrency(amt) : "—"}
                                        </span>
                                    );
                                },
                            },
                            {
                                heading: "Lease Period",
                                className: "text-xs text-mute",
                                render: (lease) => (
                                    <div className="space-y-0.5">
                                        <p>
                                            <span className="text-gray-400">Start:</span>{" "}
                                            {formatDate(lease.startDate || lease.start_date)}
                                        </p>
                                        <p>
                                            <span className="text-gray-400">End:</span>{" "}
                                            {formatDate(lease.endDate || lease.end_date)}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (lease) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={lease.status || (lease.isActive ? "active" : "completed")}
                                        />
                                    </div>
                                ),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (lease) => {
                                    const lId = lease.id ?? lease._id;
                                    return lId ? (
                                        <Link
                                            href={`/dashboard/property-owner/leases/${lId}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-[11px] font-medium text-ink hover:text-primary transition-colors"
                                        >
                                            View
                                            <ArrowUpRight className="h-3 w-3" />
                                        </Link>
                                    ) : null;
                                },
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

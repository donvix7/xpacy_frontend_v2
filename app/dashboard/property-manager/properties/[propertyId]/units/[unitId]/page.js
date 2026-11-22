import Link from "next/link";
import {
    ChevronLeft,
    DoorOpen,
    Building2,
    Home,
    MapPin,
    Wallet,
    Tag,
    Activity,
    Calendar,
    Clock,
    BedDouble,
    Bath,
    Ruler,
    Sofa,
    Layers,
    FileText,
    Pencil,
    ArrowUpRight,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import DeleteUnitButton from "@/app/_components/DeleteUnitButton";
import StatusChips from "@/app/_components/StatusChips";
import { getUnitById, getPropertyById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { toDataServiceError } from "@/app/_lib/api-error";

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

const titleCase = (value) =>
    typeof value === "string" && value.length
        ? value
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase())
        : value || "—";

const yesNo = (value) => (value === true ? "Yes" : value === false ? "No" : "—");

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
                className={`text-[13.5px] font-medium text-ink ${
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
];

async function fetchUnitData(unitId) {
    const res = await getUnitById(unitId);
    if (!res) return null;
    if (res?.data && typeof res.data === "object") return res.data;
    if (res?.unit && typeof res.unit === "object") return res.unit;
    if (typeof res === "object") return res;
    return null;
}

export async function generateMetadata({ params }) {
    const resolved = await params;
    const unitId = resolved?.unitId;
    let unit = null;
    try {
        unit = await fetchUnitData(unitId);
    } catch {
        unit = null;
    }
    const label = unit?.unitNumber ? `Unit ${unit.unitNumber}` : "Unit Details";
    return {
        title: `${label} | Xpacy`,
        description: unit?.description || "Unit details and lease history.",
    };
}

export default async function ViewUnitDetailsPage({ params }) {
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;
    const unitId = resolved?.unitId;
    const baseHref = `/dashboard/property-owner/properties/${id}`;

    const dataErrorMessages = [];
    let unit = null;
    let property = null;

    const [unitRes, propertyRes] = await Promise.allSettled([
        fetchUnitData(unitId),
        id ? getPropertyById(id) : Promise.resolve(null),
    ]);

    if (unitRes.status === "fulfilled") {
        unit = unitRes.value;
    } else {
        dataErrorMessages.push(toDataServiceError(unitRes.reason, "getUnitById").message);
    }

    if (propertyRes.status === "fulfilled" && propertyRes.value) {
        const rawProp = propertyRes.value;
        property = rawProp?.data ?? rawProp?.property ?? rawProp;
    }

    if (!unit) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={`${baseHref}/units`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to units
                </Link>
                <EmptyState
                    icon={<DoorOpen className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Unit not found"
                    message="This unit may have been removed, or the link is incorrect."
                />
            </div>
        );
    }

    const unitLabel = unit.unitNumber ? `Unit ${unit.unitNumber}` : "Unit";
    const unitType = titleCase(unit.unitType);
    const unitStatus = unit.status || "AVAILABLE";
    const bedrooms = unit.bedrooms != null ? String(unit.bedrooms) : "—";
    const bathrooms = unit.bathrooms != null ? String(unit.bathrooms) : "—";
    const squareMeters = unit.squareMeters != null ? `${unit.squareMeters} m²` : "—";
    const floor = unit.floor != null ? String(unit.floor) : "—";

    const buildingId = unit.buildingId || unit.building?.id || null;
    const buildingName = unit.building?.name || unit.buildingName || null;

    const propertyName =
        property?.name ||
        property?.property_name ||
        unit.property?.name ||
        "Property";
    const propertyAddress =
        property?.address ||
        [property?.city, property?.state].filter(Boolean).join(", ") ||
        "—";

    const leases = Array.isArray(unit.leases) ? unit.leases : [];

    const unitDetailsRows = [
        { label: "Unit Number", value: unit.unitNumber, icon: DoorOpen },
        { label: "Unit Type", value: unitType, icon: Tag },
        { label: "Status", value: titleCase(unitStatus), icon: Activity },
        { label: "Floor", value: floor, icon: Layers },
        { label: "Bedrooms", value: bedrooms, icon: BedDouble },
        { label: "Bathrooms", value: bathrooms, icon: Bath },
        { label: "Size", value: squareMeters, icon: Ruler },
        { label: "Furnished", value: yesNo(unit.furnished), icon: Sofa },
        {
            label: "Monthly Rent",
            value: unit.monthlyRent != null ? formatCurrency(unit.monthlyRent) : null,
            icon: Wallet,
            mono: true,
        },
        {
            label: "Security Deposit",
            value:
                unit.securityDeposit != null
                    ? formatCurrency(unit.securityDeposit)
                    : null,
            icon: Wallet,
            mono: true,
        },
        {
            label: "Sale Price",
            value: unit.salePrice != null && Number(unit.salePrice) > 0
                ? formatCurrency(unit.salePrice)
                : null,
            icon: Wallet,
            mono: true,
        },
        {
            label: "Shortlet Price",
            value:
                unit.shortletPrice != null && Number(unit.shortletPrice) > 0
                    ? formatCurrency(unit.shortletPrice)
                    : null,
            icon: Wallet,
            mono: true,
        },
        buildingName && {
            label: "Building",
            value: buildingName,
            icon: Building2,
            href: buildingId ? `${baseHref}/buildings/${buildingId}` : null,
        },
        {
            label: "Property",
            value: propertyName,
            icon: Home,
            href: baseHref,
        },
        { label: "Address", value: propertyAddress, icon: MapPin },
        {
            label: "Created At",
            value: formatDateTime(unit.createdAt),
            icon: Calendar,
        },
        {
            label: "Last Updated",
            value: formatDateTime(unit.updatedAt),
            icon: Clock,
        },
    ]
        .filter(Boolean)
        .filter(
            ({ value }) =>
                value !== undefined && value !== null && value !== "" && value !== "—"
        );

    const editHref = `/admin/add-new-unit?unitId=${encodeURIComponent(
        unit.id || unitId
    )}&propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(
        `${baseHref}/units/${unit.id || unitId}`
    )}`;

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={`${baseHref}/units`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to units
            </Link>

            <HeroBand
                tagline="Unit Profile"
                title={unitLabel}
                description={[unitType, buildingName, propertyName]
                    .filter(Boolean)
                    .join(" · ")}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusChips status={unitStatus} />
                        <Link
                            href={editHref}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit unit
                        </Link>
                        <DeleteUnitButton
                            unitId={unit.id || unitId}
                            propertyId={id}
                            unitLabel={unitLabel}
                            redirectTo={`${baseHref}/units`}
                        />
                    </div>
                }
                stats={[
                    { label: "Bedrooms", value: bedrooms, hint: "Sleeping rooms" },
                    { label: "Bathrooms", value: bathrooms, hint: "Bath facilities" },
                    { label: "Size", value: squareMeters, hint: "Floor area" },
                    {
                        label: "Monthly Rent",
                        value:
                            unit.monthlyRent != null
                                ? formatCurrency(unit.monthlyRent)
                                : "—",
                        hint: floor !== "—" ? `Floor ${floor}` : "Rent amount",
                    },
                ]}
            />

            {/* Unit Information (DataTable) */}
            <DashboardGridItem title="Unit Information">
                <DataTable
                    data={unitDetailsRows}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0 border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

            {/* Description */}
            <DashboardGridItem title="Description">
                {unit.description ? (
                    <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
                        {unit.description}
                    </p>
                ) : (
                    <p className="text-sm italic text-mute">
                        No description provided for this unit.
                    </p>
                )}
            </DashboardGridItem>

            {/* Leases */}
            <DashboardGridItem title={`Leases (${leases.length})`}>
                {leases.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No leases"
                        message="This unit doesn't have any leases yet."
                    />
                ) : (
                    <DataTable
                        data={leases}
                        showPagination={leases.length > 10}
                        className="p-0 border-none shadow-none"
                        rowKey={(lease, index) => lease.id ?? lease._id ?? index}
                        columns={[
                            {
                                heading: "Lease",
                                render: (lease, index) => {
                                    const leaseId = lease.id || lease._id;
                                    const href = `${baseHref}/leases/${leaseId}`;
                                    return (
                                        <Link
                                            href={href}
                                            className="font-mono font-semibold text-primary hover:underline"
                                        >
                                            {lease.leaseNumber || `Lease ${index + 1}`}
                                        </Link>
                                    );
                                },
                            },
                            {
                                heading: "Tenant",
                                render: (lease) => {
                                    const tp = lease.tenantProfile || lease.tenant || {};
                                    return (
                                        [tp.firstName || tp.firstname, tp.lastName || tp.lastname]
                                            .filter(Boolean)
                                            .join(" ") ||
                                        tp.name ||
                                        tp.email ||
                                        "—"
                                    );
                                },
                            },
                            {
                                heading: "Term",
                                className: "text-xs text-mute font-mono",
                                render: (lease) =>
                                    `${formatDate(lease.startDate)} – ${formatDate(lease.endDate)}`,
                            },
                            {
                                heading: "Rent",
                                center: true,
                                render: (lease) => (
                                    <span className="font-mono font-semibold text-ink">
                                        {lease.rentAmount != null
                                            ? formatCurrency(lease.rentAmount)
                                            : "—"}
                                    </span>
                                ),
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (lease) => (
                                    <div className="flex justify-center">
                                        <StatusChips status={lease.status} />
                                    </div>
                                ),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (lease) => {
                                    const leaseId = lease.id || lease._id;
                                    return leaseId ? (
                                        <Link
                                            href={`${baseHref}/leases/${leaseId}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink hover:border-primary hover:text-primary"
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
        </div>
    );
}

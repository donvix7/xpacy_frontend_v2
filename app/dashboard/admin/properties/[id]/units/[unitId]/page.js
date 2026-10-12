import Link from "next/link";
import {
    ChevronLeft,
    DoorOpen,
    Building2,
    Hash,
    Layers,
    BedDouble,
    Bath,
    Ruler,
    Sofa,
    Wallet,
    Shield,
    Tag,
    Calendar,
    CalendarCheck,
    Home,
    MapPin,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import {  getPropertyById, getUnitById } from "@/app/_lib/data-services";

/* ---------------- helpers ---------------- */

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

const titleCase = (value) =>
    !value
        ? "—"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

const formatMoney = (amount, currency = "NGN") => {
    if (amount === null || amount === undefined) return "—";
    return amount.toLocaleString("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    });
};

/* ---------------- presentational ---------------- */

function StatCard({ icon: Icon, label, value, subtext }) {
    return (
        <div className="flex items-center gap-3.5 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-lg font-bold text-gray-900">{value}</p>
                {subtext && (
                    <p className="mt-0.5 text-xs capitalize text-gray-400">{subtext}</p>
                )}
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    if (value === null || value === undefined || value === "" || value === "—") return null;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-gray-800">
                    {value}
                </dd>
            </div>
        </div>
    );
}

/* ---------------- metadata ---------------- */

export async function generateMetadata({ params }) {
    const { unitId } = await params;
    const unit = await getUnitById(unitId);
    const title = unit?.unitNumber ? `Unit ${unit.unitNumber}` : "Unit Details";
    return {
        title: `${title} - Unit Details`,
        description: unit?.description || `Details for ${title}`,
    };
}

/* ---------------- page ---------------- */

export default async function UnitDetailsPage({ params }) {
    const { id, unitId } = await params;

    const [unit, property] = await Promise.all([
        getUnitById(unitId),
        getPropertyById(id),
    ]);

    if (!unit || typeof unit !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                <Link
                    href={`/dashboard/admin/properties/${id}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to property
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={DoorOpen}
                        title="Unit not found"
                        message="This unit may have been removed, or the link is incorrect."
                    />
                </div>
            </div>
        );
    }

    /* ---- derived values ---- */
    const unitNumber = unit.unitNumber ? `Unit ${unit.unitNumber}` : "—";
    const unitType = titleCase(unit.unitType);
    const status = unit.status || "UNKNOWN";
    const floor = unit.floor != null ? `Floor ${unit.floor}` : null;
    const bedrooms = unit.bedrooms != null
        ? `${unit.bedrooms} bedroom${unit.bedrooms !== 1 ? "s" : ""}`
        : null;
    const bathrooms = unit.bathrooms != null
        ? `${unit.bathrooms} bathroom${unit.bathrooms !== 1 ? "s" : ""}`
        : null;
    const sqm = unit.squareMeters != null ? `${unit.squareMeters} m²` : null;
    const furnished = unit.furnished != null ? (unit.furnished ? "Furnished" : "Unfurnished") : null;

    const monthlyRent = formatMoney(unit.monthlyRent);
    const securityDeposit = formatMoney(unit.securityDeposit);
    const salePrice = unit.salePrice != null ? formatMoney(unit.salePrice) : null;
    const shortletPrice = unit.shortletPrice != null ? formatMoney(unit.shortletPrice) : null;

    const propertyName = property?.name || property?.title || "—";
    const propertyAddress = [property?.address, property?.city, property?.country]
        .filter(Boolean)
        .join(", ") || "—";

    const createdDate = formatDate(unit.createdAt);
    const updatedDate = formatDate(unit.updatedAt);

    /* ---- render ---- */

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link
                        href={`/dashboard/admin/properties/${id}`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to property
                    </Link>
                    <p className="break-words text-[28px] font-bold text-primary lg:text-4xl">
                        {unitNumber}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {unitType} • {propertyName}
                    </p>
                </div>
                <div className="mt-2">
                    <StatusChips status={status} />
                </div>
            </div>

            {/* Overview Stat Cards */}
            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Wallet} label="Monthly Rent" value={monthlyRent} />
                    <StatCard icon={Shield} label="Security Deposit" value={securityDeposit} />
                    <StatCard icon={BedDouble} label="Bedrooms" value={bedrooms ?? "—"} />
                    <StatCard icon={Bath} label="Bathrooms" value={bathrooms ?? "—"} />
                </div>
            </DashboardGridItem>

            {/* Details Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Unit Details */}
                <DashboardGridItem title="Unit Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={DoorOpen} label="Unit Number" value={unitNumber} />
                        <DetailRow icon={Building2} label="Unit Type" value={unitType} />
                        <DetailRow icon={Layers} label="Floor" value={floor} />
                        <DetailRow icon={BedDouble} label="Bedrooms" value={bedrooms} />
                        <DetailRow icon={Bath} label="Bathrooms" value={bathrooms} />
                        <DetailRow icon={Ruler} label="Size" value={sqm} />
                        <DetailRow icon={Sofa} label="Furnished" value={furnished} />
                        <DetailRow icon={Hash} label="Unit ID" value={unit.id} />
                        <DetailRow icon={Hash} label="Building ID" value={unit.buildingId} />
                        {unit.description && (
                            <DetailRow icon={Tag} label="Description" value={unit.description} />
                        )}
                    </dl>
                </DashboardGridItem>

                {/* Property Info */}
                <DashboardGridItem title="Property">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Home} label="Property Name" value={propertyName} />
                        <DetailRow icon={MapPin} label="Address" value={propertyAddress} />
                        <DetailRow icon={Hash} label="Property ID" value={unit.propertyId} />
                    </dl>
                </DashboardGridItem>

                {/* Financial Details */}
                <DashboardGridItem title="Financial Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Wallet} label="Monthly Rent" value={monthlyRent} />
                        <DetailRow icon={Shield} label="Security Deposit" value={securityDeposit} />
                        {salePrice && (
                            <DetailRow icon={Tag} label="Sale Price" value={salePrice} />
                        )}
                        {shortletPrice && (
                            <DetailRow icon={Tag} label="Shortlet Price" value={shortletPrice} />
                        )}
                    </dl>
                </DashboardGridItem>

                {/* Timeline */}
                <DashboardGridItem title="Timeline">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Calendar} label="Created" value={createdDate} />
                        <DetailRow icon={CalendarCheck} label="Last Updated" value={updatedDate} />
                    </dl>
                </DashboardGridItem>
            </div>
        </div>
    );
}

import Link from "next/link";
import {
    ChevronLeft,
    Building2,
    Home,
    DoorOpen,
    MapPin,
    Hash,
    Wallet,
    Shield,
    Calendar,
    CalendarCheck,
    Clock,
    Tag,
    Coins,
    FileText,
    BadgeCheck,
    BedDouble,
    Bath,
    Layers,
    Ruler,
    Sofa,
    Package,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getSingleListing, getListingById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

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

const money = (amount, currency = "NGN") =>
    amount === null || amount === undefined
        ? "—"
        : formatCurrency(amount, currency);

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
    if (!value || value === "—") return null;
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

function BadgePill({ label }) {
    return (
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
            {label}
        </span>
    );
}

/* ---------------- data fetching ---------------- */

async function fetchListingData(listingId, propertyId) {
    // 1. Direct fetch by listingId
    if (listingId) {
        const listing = await getSingleListing(listingId);
        if (listing && typeof listing === "object" && (listing.id || listing._id)) {
            return listing;
        }
    }

    // 2. Fallback: scan property listings
    if (propertyId) {
        const propertyListings = await getListingById(propertyId);
        if (Array.isArray(propertyListings)) {
            return (
                propertyListings.find(
                    (l) => l.id === listingId || l._id === listingId
                ) || null
            );
        }
        if (
            propertyListings &&
            typeof propertyListings === "object" &&
            (propertyListings.id === listingId || propertyListings._id === listingId)
        ) {
            return propertyListings;
        }
    }

    return null;
}

/* ---------------- metadata ---------------- */

export async function generateMetadata({ params }) {
    const { listing: listingId, id } = await params;
    const listing = await fetchListingData(listingId, id);
    const title = listing?.title || "Listing Details";
    return {
        title: `${title} - Listing Details`,
        description: listing?.description || `Details for listing ${title}`,
    };
}

/* ---------------- page ---------------- */

export default async function ViewListingDetailsPage({ params }) {
    const { id, listing: listingId } = await params;

    const listing = await fetchListingData(listingId, id);

    if (!listing || typeof listing !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                <Link
                    href={`/dashboard/user/my-properties/${id}/listings`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to listings
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={FileText}
                        title="Listing not found"
                        message="This listing may have been removed, or the link is incorrect."
                    />
                </div>
            </div>
        );
    }

    /* ---- derived values ---- */
    const currency = listing.currency || "NGN";

    const listingTitle =
        listing.title ||
        `Listing #${(listing.id || listingId || "").slice(0, 8) || "Details"}`;
    const status = listing.status || "UNKNOWN";
    const listingType = titleCase(listing.listingType);
    const price = money(listing.price, currency);
    const deposit = money(listing.deposit, currency);

    // Embedded unit object
    const unit = listing.unit || null;
    const unitNumber = unit?.unitNumber ? `Unit ${unit.unitNumber}` : "—";
    const unitType = titleCase(unit?.unitType);
    const floor = unit?.floor != null ? `Floor ${unit.floor}` : null;
    const bedrooms = unit?.bedrooms != null ? `${unit.bedrooms} bedroom${unit.bedrooms !== 1 ? "s" : ""}` : null;
    const bathrooms = unit?.bathrooms != null ? `${unit.bathrooms} bathroom${unit.bathrooms !== 1 ? "s" : ""}` : null;
    const sqm = unit?.squareMeters != null ? `${unit.squareMeters} m²` : null;
    const furnished = unit?.furnished != null ? (unit.furnished ? "Furnished" : "Unfurnished") : null;
    const unitMonthlyRent = unit?.monthlyRent != null ? money(unit.monthlyRent, currency) : null;
    const unitSecurityDeposit = unit?.securityDeposit != null ? money(unit.securityDeposit, currency) : null;
    const unitStatus = unit?.status ? titleCase(unit.status) : null;

    // Embedded property object
    const property = listing.property || null;
    const propertyName = property?.name || property?.title || "—";
    const propertyAddress = property?.address || "—";
    const propertyCity = property?.city || null;
    const propertyCountry = property?.country || null;
    const locationParts = [propertyAddress, propertyCity, propertyCountry].filter(
        (p) => p && p !== "—"
    );
    const fullAddress = locationParts.length ? locationParts.join(", ") : "—";

    // Dates
    const publishedDate = formatDate(listing.publishedAt);
    const expiresDate = listing.expiresAt ? formatDate(listing.expiresAt) : "No expiry set";
    const createdDate = formatDate(listing.createdAt);
    const updatedDate = formatDate(listing.updatedAt);

    /* ---- render ---- */

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link
                        href={`/dashboard/user/my-properties/${id}/listings`}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to listings
                    </Link>
                    <p className="break-words text-[28px] font-bold text-primary lg:text-4xl">
                        {listingTitle}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {listingType} listing • {unitNumber} • {propertyName}
                    </p>
                </div>
                <div className="mt-2">
                    <StatusChips status={status} />
                </div>
            </div>

            {/* Overview Stat Cards */}
            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Wallet} label="Price" value={price} subtext={currency} />
                    <StatCard icon={Shield} label="Deposit" value={deposit} subtext={currency} />
                    <StatCard icon={Tag} label="Listing Type" value={listingType} />
                    <StatCard icon={CalendarCheck} label="Published" value={publishedDate} />
                </div>
            </DashboardGridItem>

            {/* Details Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Property Info */}
                <DashboardGridItem title="Property">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Home} label="Property Name" value={propertyName} />
                        <DetailRow icon={MapPin} label="Address" value={fullAddress} />
                        <DetailRow icon={Hash} label="Property ID" value={listing.propertyId} />
                    </dl>
                </DashboardGridItem>

                {/* Listing Details */}
                <DashboardGridItem title="Listing Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={BadgeCheck} label="Status" value={titleCase(status)} />
                        <DetailRow icon={Tag} label="Listing Type" value={listingType} />
                        <DetailRow icon={Coins} label="Currency" value={currency} />
                        {listing.description && (
                            <DetailRow
                                icon={FileText}
                                label="Description"
                                value={listing.description}
                            />
                        )}
                        <DetailRow icon={Hash} label="Listing ID" value={listing.id} />
                    </dl>
                </DashboardGridItem>

                {/* Unit Details */}
                {unit && (
                    <DashboardGridItem title="Unit Details">
                        <dl className="flex flex-col gap-4">
                            <DetailRow icon={DoorOpen} label="Unit Number" value={unitNumber} />
                            <DetailRow icon={Building2} label="Unit Type" value={unitType} />
                            <DetailRow icon={Layers} label="Floor" value={floor} />
                            <DetailRow icon={BedDouble} label="Bedrooms" value={bedrooms} />
                            <DetailRow icon={Bath} label="Bathrooms" value={bathrooms} />
                            <DetailRow icon={Ruler} label="Size" value={sqm} />
                            <DetailRow icon={Sofa} label="Furnished" value={furnished} />
                            <DetailRow icon={BadgeCheck} label="Unit Status" value={unitStatus} />
                            <DetailRow icon={Hash} label="Unit ID" value={unit.id} />
                        </dl>
                    </DashboardGridItem>
                )}

                {/* Financial Details */}
                <DashboardGridItem title="Financial Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Wallet} label="Listing Price" value={price} />
                        <DetailRow icon={Shield} label="Listing Deposit" value={deposit} />
                        {unitMonthlyRent && (
                            <DetailRow icon={Wallet} label="Unit Monthly Rent" value={unitMonthlyRent} />
                        )}
                        {unitSecurityDeposit && (
                            <DetailRow icon={Shield} label="Unit Security Deposit" value={unitSecurityDeposit} />
                        )}
                        <DetailRow icon={Coins} label="Currency" value={currency} />
                    </dl>
                </DashboardGridItem>

                {/* Availability & Timeline */}
                <DashboardGridItem title="Availability & Timeline">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Calendar} label="Published At" value={publishedDate} />
                        <DetailRow icon={Clock} label="Expires At" value={expiresDate} />
                        <DetailRow icon={Calendar} label="Created" value={createdDate} />
                        <DetailRow icon={CalendarCheck} label="Last Updated" value={updatedDate} />
                        {listing.availability && (
                            <DetailRow icon={Package} label="Availability" value={listing.availability} />
                        )}
                    </dl>
                </DashboardGridItem>
            </div>

            {/* Amenities */}
            {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
                <DashboardGridItem title="Amenities">
                    <ul className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity, idx) => (
                            <li key={idx}>
                                <BadgePill
                                    label={
                                        typeof amenity === "string"
                                            ? titleCase(amenity)
                                            : amenity?.name || "Amenity"
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </DashboardGridItem>
            )}
        </div>
    );
}
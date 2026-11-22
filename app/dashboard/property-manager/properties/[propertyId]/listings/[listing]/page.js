import Link from "next/link";
import {
    ChevronLeft,
    Building2,
    Home,
    DoorOpen,
    MapPin,
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
    Pencil,
    ArrowUpRight,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import DeleteListingButton from "@/app/_components/DeleteListingButton";
import ListingStatusControls from "@/app/_components/ListingStatusControls";
import StatusChips from "@/app/_components/StatusChips";
import { getSingleListing, getListingById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { toDataServiceError } from "@/app/_lib/api-error";

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

const formatAvailability = (avail) => {
    if (!avail) return null;
    if (typeof avail === "string") return avail.trim() || null;
    if (typeof avail === "object" && !Array.isArray(avail)) {
        const entries = Object.entries(avail).filter(
            ([, v]) => v !== undefined && v !== null && v !== ""
        );
        if (entries.length === 0) return null;
        return entries
            .map(([k, v]) => {
                const label = titleCase(k.replace(/([A-Z])/g, " $1"));
                const formattedVal =
                    k.toLowerCase().includes("date") || k.toLowerCase().includes("from")
                        ? formatDate(v) !== "—"
                            ? formatDate(v)
                            : String(v)
                        : typeof v === "boolean"
                          ? v
                              ? "Yes"
                              : "No"
                          : String(v);
                return `${label}: ${formattedVal}`;
            })
            .join(" · ");
    }
    return null;
};

const normalizeAmenities = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) {
        return amenities
            .map((a) => (typeof a === "string" ? titleCase(a) : a?.name || null))
            .filter(Boolean);
    }
    if (typeof amenities === "object") {
        return Object.entries(amenities)
            .filter(([, v]) => Boolean(v))
            .map(([k, v]) =>
                typeof v === "string"
                    ? `${titleCase(k.replace(/([A-Z])/g, " $1"))}: ${v}`
                    : titleCase(k.replace(/([A-Z])/g, " $1"))
            );
    }
    return [];
};

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

async function fetchListingData(listingId, propertyId) {
    let listing = null;
    try {
        const res = await getSingleListing(listingId);
        listing = res?.data ?? res?.listing ?? res ?? null;
    } catch {
        listing = null;
    }

    if (listing && typeof listing === "object" && (listing.id || listing._id)) {
        return listing;
    }

    if (propertyId) {
        const all = await getListingById(propertyId);
        if (Array.isArray(all)) {
            return (
                all.find((l) => l.id === listingId || l._id === listingId) ||
                null
            );
        }
    }

    return null;
}

/* ---------------- metadata ---------------- */

export async function generateMetadata({ params }) {
    const resolved = await params;
    const listingId = resolved?.listing;
    const id = resolved?.propertyId || resolved?.id;
    let listing = null;
    try {
        listing = await fetchListingData(listingId, id);
    } catch {
        listing = null;
    }
    return {
        title: listing?.title ? `${listing.title} | Xpacy` : "Listing Details | Xpacy",
        description: listing?.description || "Listing details and unit overview.",
    };
}

/* ---------------- page ---------------- */

export default async function ViewListingDetailsPage({ params }) {
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;
    const listingId = resolved?.listing;
    const baseHref = `/dashboard/property-owner/properties/${id}`;

    const dataErrorMessages = [];
    let listing = null;

    try {
        listing = await fetchListingData(listingId, id);
    } catch (err) {
        dataErrorMessages.push(toDataServiceError(err, "getSingleListing").message);
    }

    if (!listing) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={`${baseHref}/listings`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to listings
                </Link>
                <EmptyState
                    icon={<FileText className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Listing not found"
                    message="This listing may have been removed, or the link is incorrect."
                />
            </div>
        );
    }

    const listingTitle = listing.title || "Untitled Listing";
    const currency = listing.currency || "NGN";
    const status = listing.status || "ACTIVE";
    const listingType = titleCase(listing.listingType);
    const price = money(listing.price, currency);
    const deposit = money(listing.deposit, currency);

    // Embedded unit object
    const unit = listing.unit || null;
    const unitNumber = unit?.unitNumber ? `Unit ${unit.unitNumber}` : "—";
    const unitType = titleCase(unit?.unitType);
    const floor = unit?.floor != null ? `Floor ${unit.floor}` : null;
    const bedrooms =
        unit?.bedrooms != null
            ? `${unit.bedrooms} bedroom${unit.bedrooms !== 1 ? "s" : ""}`
            : null;
    const bathrooms =
        unit?.bathrooms != null
            ? `${unit.bathrooms} bathroom${unit.bathrooms !== 1 ? "s" : ""}`
            : null;
    const sqm = unit?.squareMeters != null ? `${unit.squareMeters} m²` : null;
    const furnished =
        unit?.furnished != null
            ? unit.furnished
                ? "Furnished"
                : "Unfurnished"
            : null;
    const unitMonthlyRent =
        unit?.monthlyRent != null ? money(unit.monthlyRent, currency) : null;
    const unitSecurityDeposit =
        unit?.securityDeposit != null
            ? money(unit.securityDeposit, currency)
            : null;
    const unitStatus = unit?.status ? titleCase(unit.status) : null;

    // Embedded property object
    const property = listing.property || null;
    const propertyName = property?.name || property?.title || "Property";
    const propertyAddress = property?.address || "—";
    const propertyCity = property?.city || null;
    const propertyCountry = property?.country || null;
    const locationParts = [propertyAddress, propertyCity, propertyCountry].filter(
        (p) => p && p !== "—"
    );
    const fullAddress =
        listing.location || (locationParts.length ? locationParts.join(", ") : "—");

    // Dates & availability
    const publishedDate = formatDate(listing.publishedAt);
    const expiresDate = listing.expiresAt
        ? formatDate(listing.expiresAt)
        : "No expiry set";
    const createdDate = formatDate(listing.createdAt);
    const updatedDate = formatDate(listing.updatedAt);
    const availabilityText = formatAvailability(listing.availability);
    const amenitiesList = normalizeAmenities(listing.amenities);

    const listingDetailsRows = [
        { label: "Listing Title", value: listingTitle, icon: FileText },
        { label: "Listing Type", value: listingType, icon: Tag },
        { label: "Status", value: titleCase(status), icon: BadgeCheck },
        { label: "Price", value: price, icon: Wallet, mono: true },
        { label: "Deposit", value: deposit, icon: Shield, mono: true },
        { label: "Currency", value: currency, icon: Coins, mono: true },
        { label: "Property", value: propertyName, icon: Home, href: baseHref },
        { label: "Location / Address", value: fullAddress, icon: MapPin },
        availabilityText && {
            label: "Availability",
            value: availabilityText,
            icon: Package,
        },
        { label: "Published At", value: publishedDate, icon: Calendar },
        { label: "Expires At", value: expiresDate, icon: Clock },
        { label: "Created", value: createdDate, icon: Calendar },
        { label: "Last Updated", value: updatedDate, icon: CalendarCheck },
    ]
        .filter(Boolean)
        .filter(
            ({ value }) =>
                value !== undefined && value !== null && value !== "" && value !== "—"
        );

    const unitDetailsRows = unit
        ? [
              {
                  label: "Unit Number",
                  value: unitNumber,
                  icon: DoorOpen,
                  href: unit.id ? `${baseHref}/units/${unit.id}` : null,
              },
              { label: "Unit Type", value: unitType, icon: Building2 },
              { label: "Floor", value: floor, icon: Layers },
              { label: "Bedrooms", value: bedrooms, icon: BedDouble },
              { label: "Bathrooms", value: bathrooms, icon: Bath },
              { label: "Size", value: sqm, icon: Ruler },
              { label: "Furnished", value: furnished, icon: Sofa },
              { label: "Unit Status", value: unitStatus, icon: BadgeCheck },
              {
                  label: "Unit Monthly Rent",
                  value: unitMonthlyRent,
                  icon: Wallet,
                  mono: true,
              },
              {
                  label: "Unit Security Deposit",
                  value: unitSecurityDeposit,
                  icon: Shield,
                  mono: true,
              },
          ].filter(
              ({ value }) =>
                  value !== undefined &&
                  value !== null &&
                  value !== "" &&
                  value !== "—"
          )
        : [];

    const editHref = `/admin/add-new-listing?listingId=${encodeURIComponent(
        listing.id || listingId
    )}&propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(
        `${baseHref}/listings/${listing.id || listingId}`
    )}`;

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={`${baseHref}/listings`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to listings
            </Link>

            <HeroBand
                tagline="Listing Profile"
                title={listingTitle}
                description={[`${listingType} listing`, unitNumber !== "—" ? unitNumber : null, propertyName]
                    .filter(Boolean)
                    .join(" · ")}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusChips status={status} />
                        <ListingStatusControls
                            listingId={listing.id || listingId}
                            propertyId={id}
                            listingTitle={listingTitle}
                            currentStatus={status}
                        />
                        <Link
                            href={editHref}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit listing
                        </Link>
                        
                    </div>
                }
                stats={[
                    { label: "Price", value: price, hint: currency },
                    { label: "Deposit", value: deposit, hint: currency },
                    { label: "Listing Type", value: listingType, hint: "Category" },
                    { label: "Published", value: publishedDate, hint: expiresDate },
                ]}
            />

            {/* Listing Information (DataTable) */}
            <DashboardGridItem title="Listing Information">
                <DataTable
                    data={listingDetailsRows}
                    columns={keyValueColumns}
                    showPagination={false}
                    className="p-0 border-none shadow-none"
                    rowKey={(row) => row.label}
                />
            </DashboardGridItem>

            {/* Unit Details (DataTable) */}
            {unitDetailsRows.length > 0 && (
                <DashboardGridItem title="Unit Details">
                    <DataTable
                        data={unitDetailsRows}
                        columns={keyValueColumns}
                        showPagination={false}
                        className="p-0 border-none shadow-none"
                        rowKey={(row) => row.label}
                    />
                </DashboardGridItem>
            )}

            {/* Description */}
            <DashboardGridItem title="Description">
                {listing.description ? (
                    <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
                        {listing.description}
                    </p>
                ) : (
                    <p className="text-sm italic text-mute">
                        No description provided for this listing.
                    </p>
                )}
            </DashboardGridItem>

            {/* Amenities */}
            {amenitiesList.length > 0 && (
                <DashboardGridItem title={`Amenities (${amenitiesList.length})`}>
                    <ul className="flex flex-wrap gap-2">
                        {amenitiesList.map((label, idx) => (
                            <li key={idx}>
                                <span className="inline-flex items-center rounded-full border border-line bg-soft px-3 py-1 text-xs font-medium text-ink">
                                    {label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </DashboardGridItem>
            )}
        </div>
    );
}

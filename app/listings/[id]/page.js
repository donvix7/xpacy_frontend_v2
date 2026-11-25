import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Building2,
  MapPin,
  DoorOpen,
  Layers,
  Sofa,
  Calendar,
  Shield,
  Tag,
  Check,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { RiHotelBedLine } from "react-icons/ri";
import { LuBath } from "react-icons/lu";
import { FaRegSquare } from "react-icons/fa6";
import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import PropertyDetailsHeader from "@/app/_components/PropertyDetailsHeader";
import PropertySavedIcon from "@/app/_components/ProperySavedIcon";
import ListingPropertyUnitsSection from "@/app/_components/ListingPropertyUnitsSection";
import { getSingleListing, getPropertyById, getAllUnits } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function titleCase(value) {
  if (!value) return "—";
  return String(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function formatAvailability(avail) {
  if (!avail) return null;
  if (typeof avail === "string") return avail.trim() || null;
  if (typeof avail === "object" && !Array.isArray(avail)) {
    const entries = Object.entries(avail).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    if (!entries.length) return null;
    return entries.map(([k, v]) => ({
      label: titleCase(k.replace(/([A-Z])/g, " $1")),
      value:
        k.toLowerCase().includes("date") || k.toLowerCase().includes("from")
          ? formatDate(v) !== "—"
            ? formatDate(v)
            : String(v)
          : String(v),
    }));
  }
  return null;
}

function normalizeAmenities(amenities) {
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
}

function extractImages(listing, property) {
  const sources = [
    ...(Array.isArray(listing?.media) ? listing.media : []),
    ...(Array.isArray(listing?.images) ? listing.images : []),
    ...(Array.isArray(property?.media) ? property.media : []),
    ...(Array.isArray(property?.images) ? property.images : []),
  ];
  const urls = sources
    .map((item) => {
      if (typeof item === "string") {
        return /^https?:\/\//i.test(item)
          ? item
          : `https://app.xpacy.com/src/upload/properties/${item}`;
      }
      const u = item?.url || item?.image_url;
      if (!u) return null;
      return /^https?:\/\//i.test(u)
        ? u
        : `https://app.xpacy.com/src/upload/properties/${u}`;
    })
    .filter(Boolean);
  return [...new Set(urls)];
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */
export async function generateMetadata({ params }) {
  const resolved = await params;
  const id = Array.isArray(resolved?.id) ? resolved.id[0] : resolved?.id;
  try {
    const listing = await getSingleListing(id);
    return {
      title: listing?.title ? `${listing.title} | Xpacy Listings` : "Listing | Xpacy",
      description: listing?.description || "View published property listing details.",
    };
  } catch {
    return {
      title: "Listing | Xpacy",
      description: "View published property listing details.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function PublicListingDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const id = Array.isArray(resolvedParams?.id)
    ? resolvedParams.id[0]
    : resolvedParams?.id;
  const organizationId =
    typeof resolvedQuery?.organizationId === "string"
      ? resolvedQuery.organizationId.trim()
      : "";

  if (!id) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const isAuthenticated = Boolean(token?.value);

  let listing = null;
  try {
    listing = await getSingleListing(id);
  } catch {
    listing = null;
  }

  if (!listing || typeof listing !== "object") {
    try {
      const propRes = await getPropertyById(id);
      const prop = propRes?.data ?? propRes?.property ?? propRes ?? null;
      if (prop && typeof prop === "object" && (prop.id || prop._id || prop.name)) {
        listing = {
          id: prop.id || prop._id || id,
          propertyId: prop.id || prop._id || id,
          title: prop.name || prop.property_name || "Property",
          description: prop.description || prop.property_description || "",
          status: prop.status || prop.property_status || "ACTIVE",
          listingType: prop.propertyType || prop.property_type || "RESIDENTIAL",
          price: prop.price ?? prop.property_price ?? null,
          currency: prop.currency || "NGN",
          property: prop,
        };
      }
    } catch {
      listing = null;
    }
  }

  if (!listing || typeof listing !== "object") {
    notFound();
  }

  // Enrich with property if not embedded
  let property = listing.property || null;
  if (!property && listing.propertyId) {
    try {
      const propRes = await getPropertyById(listing.propertyId);
      property = propRes?.data ?? propRes?.property ?? propRes ?? null;
    } catch {
      property = null;
    }
  }

  const unit = listing.unit || null;
  const title = listing.title || property?.name || "Property Listing";
  const kind = String(listing.listingType || listing.listing_type || "RENT").toUpperCase();
  const categoryLabel = kind.includes("SHORT")
    ? "Shortlet"
    : kind === "SALE" || kind === "BUY"
      ? "For Sale"
      : "For Rent";

  const address =
    listing.location ||
    [property?.address, property?.city, property?.state, property?.country]
      .filter(Boolean)
      .join(", ") ||
    "Location available on request";

  const currency = listing.currency || "NGN";
  const priceText =
    listing.price != null ? formatCurrency(listing.price, currency) : "Price on request";
  const depositText =
    listing.deposit != null && Number(listing.deposit) > 0
      ? formatCurrency(listing.deposit, currency)
      : null;

  const images = extractImages(listing, property);
  const amenities = normalizeAmenities(listing.amenities);
  const availability = formatAvailability(listing.availability);
  const backHref = organizationId
    ? `/listings?organizationId=${encodeURIComponent(organizationId)}`
    : "/listings";

  const resolvedListingId = listing.id || listing._id || id;
  const resolvedUnitId = listing.unitId || unit?.id || unit?._id || "";
  const resolvedPropertyId =
    listing.propertyId || property?.id || property?._id || unit?.propertyId || "";

  // Fetch all units belonging to this property
  let propertyUnits = Array.isArray(property?.units) ? property.units : [];
  if (resolvedPropertyId) {
    try {
      const unitsRes = await getAllUnits(resolvedPropertyId);
      const fetchedUnits = Array.isArray(unitsRes)
        ? unitsRes
        : Array.isArray(unitsRes?.data)
          ? unitsRes.data
          : [];
      if (fetchedUnits.length > 0) {
        propertyUnits = fetchedUnits;
      }
    } catch {
      // keep embedded property.units fallback if any
    }
  }
  const currentListingPath = organizationId
    ? `/listings/${encodeURIComponent(resolvedListingId)}?organizationId=${encodeURIComponent(organizationId)}`
    : `/listings/${encodeURIComponent(resolvedListingId)}`;
  const bookingParams = new URLSearchParams();
  if (resolvedListingId) bookingParams.set("listingId", String(resolvedListingId));
  if (resolvedUnitId) bookingParams.set("unitId", String(resolvedUnitId));
  if (resolvedPropertyId) bookingParams.set("propertyId", String(resolvedPropertyId));
  bookingParams.set("returnTo", currentListingPath);
  const bookingHref = `/admin/add-new-booking?${bookingParams.toString()}`;

  const bedrooms = unit?.bedrooms ?? property?.total_bedrooms ?? null;
  const bathrooms = unit?.bathrooms ?? property?.total_bathrooms ?? null;
  const sqm = unit?.squareMeters ?? property?.property_square_area ?? null;
  const floor = unit?.floor ?? null;
  const furnished =
    unit?.furnished === true
      ? "Furnished"
      : unit?.furnished === false
        ? "Unfurnished"
        : null;

  return (
    <>
      <AppHeader />
      <main className="flex flex-col px-6 md:px-[7%] pb-16">
        <div className="pt-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back to listings
          </Link>
        </div>

        {/* Header matching Shortlet page */}
        <PropertyDetailsHeader
          propertyName={title}
          propertyStatus={categoryLabel}
          propertyAddress={address}
        >
          <PropertySavedIcon propertyId={listing.propertyId || listing.id} />
        </PropertyDetailsHeader>

        {/* Photo Gallery matching PropertyPhotoSection */}
        <div className="grid min-w-0 auto-rows-[130px] grid-cols-2 gap-2 sm:gap-3 md:auto-rows-auto md:grid-cols-4 md:grid-rows-3 md:gap-6">
          <div className="relative col-span-2 row-span-2 h-[260px] md:col-span-3 md:row-span-3 md:h-[520px] overflow-hidden rounded-xl bg-gray-100">
            {images[0] ? (
              <Image
                fill
                src={images[0]}
                unoptimized
                alt={title}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                <Building2 className="h-14 w-14 opacity-50" />
                <span className="text-xs font-medium">No photos uploaded yet</span>
              </div>
            )}
          </div>
          {images.slice(1, 4).map((img, i) => (
            <div key={img || i} className="relative min-h-0 overflow-hidden rounded-xl bg-gray-100">
              <Image
                fill
                src={img}
                unoptimized
                alt={`${title} photo ${i + 2}`}
                className="object-cover"
              />
            </div>
          ))}
          {images.length <= 1 && (
            <div className="hidden md:flex md:row-span-3 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-center text-gray-400">
              <Sparkles className="h-7 w-7 opacity-60" />
              <span className="text-xs font-medium">
                {unit?.unitNumber ? `Unit ${unit.unitNumber}` : categoryLabel}
              </span>
            </div>
          )}
        </div>

        {/* Main 4-Column Layout matching Shortlet page */}
        <div className="md:grid md:grid-cols-4 gap-12 py-12 flex flex-col">
          {/* Left 3 Columns */}
          <div className="flex min-w-0 flex-col gap-10 md:col-span-3">
            {/* Specification Bar */}
           

            <div className="border-b border-neutral-200" />

            {/* Description */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-primary-900 sm:text-[1.375rem]">
                Description
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {listing.description ||
                  property?.description ||
                  "No detailed description provided for this listing yet."}
              </p>
            </div>

            <div className="border-b border-neutral-200" />

            {/* Unit & Property Overview */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-primary-900 sm:text-[1.375rem]">
                Property & Unit Details
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property?.name && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
                    <Building2 className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Property
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.name}
                      </p>
                    </div>
                  </div>
                )}

                {unit?.unitNumber && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
                    <DoorOpen className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Unit
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Unit {unit.unitNumber}
                        {unit.unitType ? ` · ${titleCase(unit.unitType)}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {furnished && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
                    <Sofa className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Furnishing
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {furnished}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Units in this Property */}
            <div className="border-b border-neutral-200" />
            <ListingPropertyUnitsSection
              units={propertyUnits}
              currency={currency}
              listingId={resolvedListingId}
              propertyId={resolvedPropertyId}
              returnTo={currentListingPath}
              isAuthenticated={isAuthenticated}
            />

            {/* Amenities */}
            {amenities.length > 0 && (
              <>
                <div className="border-b border-neutral-200" />
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold text-primary-900 sm:text-[1.375rem]">
                    Amenities
                  </h2>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {amenities.map((label, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-xs"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Right 1 Column: Sticky Pricing & Action Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-28 space-y-5 rounded-2xl border border-primary-100 bg-white p-6 shadow-lg">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary">
                  <Tag className="h-3.5 w-3.5" />
                  {categoryLabel}
                </span>
                <p className="mt-3 font-mono text-2xl font-extrabold text-primary sm:text-3xl">
                  {priceText}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {kind === "RENT"
                    ? "Rental price"
                    : kind.includes("SHORT")
                      ? "Shortlet rate"
                      : "Asking price"}{" "}
                  · {currency}
                </p>
              </div>

              <div className="space-y-2.5 border-y border-gray-100 py-4 text-sm">
                {depositText && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Shield className="h-4 w-4 text-gray-400" />
                      Deposit
                    </span>
                    <span className="font-mono font-semibold text-gray-900">
                      {depositText}
                    </span>
                  </div>
                )}

                {listing.publishedAt && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Published
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDate(listing.publishedAt)}
                    </span>
                  </div>
                )}

                {Array.isArray(availability) &&
                  availability.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900">
                        {item.value}
                      </span>
                    </div>
                  ))}

                {typeof availability === "string" && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium text-gray-900">
                      {availability}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href={
                    isAuthenticated
                      ? bookingHref
                      : `/auth/log-in?redirectUrl=${encodeURIComponent(bookingHref)}`
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
                >
                  <span>
                    {isAuthenticated ? "Book / Inquire" : "Sign in to Book"}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <Link
                  href={backHref}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Browse more listings
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}


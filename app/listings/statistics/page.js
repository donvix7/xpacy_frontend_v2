import { cookies } from "next/headers";
import Link from "next/link";
import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import ListingInsightsClient from "./ListingInsightsClient";
import { filterPropertiesByOrganization, getListingById, getOrganizationProperties, getPublicOrganizationById, getMyProperties, getManagedProperties, getMyRentedProperties } from "@/app/_lib/data-services";
import { isValidOrganizationId } from "@/app/_lib/public-navigation";
import EmptyState from "@/app/_components/EmptyState";

function toListingArray(payload) {
  if (Array.isArray(payload)) return payload;
  for (const candidate of [payload?.listings, payload?.records, payload?.results, payload?.items, payload?.data, payload?.data?.listings, payload?.data?.records, payload?.data?.results, payload?.data?.items]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return payload && typeof payload === "object" && (payload.id || payload._id || payload.title || payload.listingType) ? [payload] : [];
}

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase().replace(/[\s_-]/g, "");
}

export default async function ListingStatisticsPage({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userRole = normalizeRole(cookieStore.get("userRole")?.value);
  const organizationRole = normalizeRole(cookieStore.get("organizationRole")?.value);
  const allowedRoles = new Set([
    "propertyowner",
    "owner",
    "organizationowner",
    "organizationadmin",
    "organizationadministrator",
    "orgadmin",
    "facilitymanager",
  ]);
  const isAllowedRole = allowedRoles.has(userRole) || allowedRoles.has(organizationRole);

  if (!cookieStore.get("token")?.value || !isAllowedRole) {
    return (
      <div className="w-full h-full">
        <AppHeader />
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState message="Only property owners and facility managers can view listing statistics." />
        </main>
        <Footer />
      </div>
    );
  }

  const organizationId = typeof params?.organizationId === "string" ? params.organizationId.trim() : "";
  if (!isValidOrganizationId(organizationId)){
    return(
     <div className="w-full h-full"><AppHeader /><main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col w-full gap-4 border-b border-primary-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Organization Insights</p>
      </div>
      <Link href={`/listings?organizationId=${encodeURIComponent(organizationId)}`} className="inline-flex w-fit rounded-lg border border-primary px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-50">Back to Listings</Link>
    </div>
    <EmptyState
    message={"Must be invited or belong to an organization to view statistics"}
    />
    </main><Footer /></div>
    )
  } 
  const organization = await getPublicOrganizationById(organizationId);

  const propertyResults = await Promise.allSettled([
    getMyProperties(),
    getManagedProperties(),
    getMyRentedProperties(),
    getOrganizationProperties(organizationId),
  ]);
  const propertySources = propertyResults.flatMap((result) => result.status === "fulfilled" && Array.isArray(result.value) ? result.value : []);
  const uniqueProperties = filterPropertiesByOrganization(propertySources, organizationId).filter((property, index, all) => {
    const id = property.id || property._id || property.propertyId;
    return id && all.findIndex((item) => (item.id || item._id || item.propertyId) === id) === index;
  });
  const listings = (await Promise.all(uniqueProperties.map(async (property) => {
    const propertyId = property.id || property._id || property.propertyId;
    if (!propertyId) return [];
    try {
      return toListingArray(await getListingById(propertyId, cookieStore.get("token")?.value)).map((listing) => ({
        ...listing,
        property: { ...property, ...(listing.property && typeof listing.property === "object" ? listing.property : {}) },
      }));
    } catch {
      return [];
    }
  }))).flat();

  const statistics = listings.map((listing) => {
    const property = listing.property || {};
    const location = listing.location;
    return {
      ...listing,
      listing_title: listing.title || listing.name || "Untitled listing",
      property_name: property.property_name || property.name || property.title || listing.title || "Untitled property",
      property_type: property.property_type || property.propertyType || property.type || listing.unit?.unitType || "Other",
      listing_type: listing.listingType || listing.listing_type || listing.category || "Other",
      property_status: listing.status || property.status || property.property_status || "UNKNOWN",
      property_price: listing.price ?? property.property_price ?? property.price,
      views: Number(listing.views ?? property.views) || 0,
      enquiries: Number(listing.enquiries ?? listing.inquiries ?? listing.enquiry_count ?? property.enquiries ?? property.inquiries) || 0,
      contactedCount: Number(listing.contactedCount ?? listing.contacted_count ?? property.contactedCount ?? property.contacted_count) || 0,
      city: (typeof location === "object" ? location?.city : null) || property.city || listing.city,
      state: (typeof location === "object" ? location?.state : null) || property.state || listing.state,
      address: (typeof location === "string" ? location : location?.address) || property.address || listing.address,
      images: property.images || (listing.image ? [listing.image] : []),
    };
  });

  return <><AppHeader /><main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4 border-b border-primary-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Organization Insights</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-primary">{organization?.name || organization?.organizationName || "Organization"} Listing Statistics</h1>
        <p className="mt-1 text-sm text-gray-500">Explore listing performance, demand trends, and pricing insights.</p>
      </div>
      <Link href={`/listings?organizationId=${encodeURIComponent(organizationId)}`} className="inline-flex w-fit rounded-lg border border-primary px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-50">Back to Listings</Link>
    </div>
    <ListingInsightsClient listings={statistics} />
  </main><Footer /></>;
}

import { cookies } from "next/headers";
import {
  filterPropertiesByOrganization,
  getOrganizationById,
  getOrganizationProperties,
  getListingById,
  getPublicOrganizationById,
  getMyProperties,
  getManagedProperties,
  getMyRentedProperties,
} from "@/app/_lib/data-services";
import AdminListingsClient from "./AdminListingsClient";
import AppHeader from "../_components/AppHeader";
import { isValidOrganizationId } from "../_lib/public-navigation";
import { notFound } from "next/navigation";
import Footer from "../_components/Footer";
import DataErrorNotice from "../_components/DataErrorNotice";
import { getSettledErrorMessages } from "../_lib/api-error";

export const metadata = {
  title: "Explore Organization Properties & Listings",
  description: "Browse all properties and listings for this organization.",
};

function toListingArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.listings)) return payload.data.listings;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (
    payload &&
    typeof payload === "object" &&
    (payload.id || payload._id || payload.title || payload.listingType)
  ) {
    return [payload];
  }
  return [];
}

function propertyToCardItem(property) {
  const propertyId = property?.id || property?._id || property?.propertyId;
  return {
    id: propertyId,
    propertyId,
    title: property?.name || property?.property_name || property?.title || "Property",
    description: property?.description || property?.property_description || "",
    status: property?.status || property?.property_status || "ACTIVE",
    listingType:
      property?.listingType ||
      property?.listing_type ||
      property?.propertyType ||
      property?.property_type ||
      "RESIDENTIAL",
    price: property?.price ?? property?.property_price ?? null,
    currency: property?.currency || "NGN",
    property,
  };
}

export default async function AdminListingsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // 1. Resolve organizationId from URL query params OR signed-in organization cookie
  const rawQueryOrgId = params?.organizationId || params?.orgId;
  const organizationIdFromQuery =
    typeof rawQueryOrgId === "string"
      ? rawQueryOrgId.trim()
      : Array.isArray(rawQueryOrgId)
        ? String(rawQueryOrgId[0] || "").trim()
        : "";
  const cookieOrganizationId = String(
    cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      ""
  ).trim();

  const organizationId = organizationIdFromQuery || cookieOrganizationId || "";

  // 2. Fetch organization details + property sources in parallel
  const hasValidOrgId = isValidOrganizationId(organizationId);

  const results = await Promise.allSettled([
    hasValidOrgId ? getOrganizationProperties(organizationId) : Promise.resolve([]),
    token ? getMyProperties().catch(() => []) : Promise.resolve([]),
    token ? getManagedProperties().catch(() => []) : Promise.resolve([]),
    token ? getMyRentedProperties().catch(() => []) : Promise.resolve([]),
    hasValidOrgId
      ? getPublicOrganizationById(organizationId).catch(() => null)
      : Promise.resolve(null),
  ]);

  const dataErrorMessages = getSettledErrorMessages(results.slice(0, 1));

  const orgProperties =
    results[0].status === "fulfilled" && Array.isArray(results[0].value)
      ? results[0].value
      : [];
  const myProperties =
    results[1].status === "fulfilled" && Array.isArray(results[1].value)
      ? results[1].value
      : [];
  const managedProperties =
    results[2].status === "fulfilled" && Array.isArray(results[2].value)
      ? results[2].value
      : [];
  const rentedProperties =
    results[3].status === "fulfilled" && Array.isArray(results[3].value)
      ? results[3].value
      : [];

  let organization =
    results[4].status === "fulfilled" ? results[4].value : null;

  if (hasValidOrgId && !organization && token) {
    try {
      const orgRes = await getOrganizationById(organizationId);
      organization = orgRes?.organization || orgRes?.data || orgRes || null;
    } catch {
      organization = null;
    }
  }

  if (organizationIdFromQuery && hasValidOrgId && !organization && orgProperties.length === 0) {
    notFound();
  }

  const allUserProperties = [
    ...myProperties,
    ...managedProperties,
    ...rentedProperties,
  ];

  let listings = [];

  if (hasValidOrgId) {
    try {
      const scopedFromUser = filterPropertiesByOrganization(
        allUserProperties,
        organizationId
      );

      // Merge org properties + user's org-scoped properties and dedupe by property id
      const merged = [...orgProperties, ...scopedFromUser];
      const seenIds = new Set();
      const uniqueProperties = merged.filter((property) => {
        const propId = String(
          property?.id || property?._id || property?.propertyId || ""
        ).trim();
        if (!propId || seenIds.has(propId)) return false;
        seenIds.add(propId);
        return true;
      });

      // Enrich each property with its listings if available, otherwise display the property itself
      const itemsByProperty = await Promise.all(
        uniqueProperties.map(async (property) => {
          const propertyId = String(
            property.id || property._id || property.propertyId
          ).trim();

          try {
            const fetchedListings = await getListingById(propertyId, token);
            const propertyListings = toListingArray(fetchedListings);

            if (propertyListings.length > 0) {
              return propertyListings.map((listing) => ({
                ...listing,
                property: {
                  ...property,
                  ...(listing.property &&
                  typeof listing.property === "object" &&
                  !Array.isArray(listing.property)
                    ? listing.property
                    : {}),
                },
                propertyId: listing.propertyId || propertyId,
              }));
            }
          } catch {
            // Fall back to showing the property card itself
          }

          return [propertyToCardItem(property)];
        })
      );

      listings = itemsByProperty.flat();
    } catch (error) {
      console.warn(
        "Failed to load organization properties for listings page:",
        error
      );
    }
  } else {
    // No organizationId in URL or session → show user's properties as fallback
    const seenIds = new Set();
    listings = allUserProperties
      .filter((property) => {
        const propId = String(property?.id || property?._id || "").trim();
        if (!propId || seenIds.has(propId)) return false;
        seenIds.add(propId);
        return true;
      })
      .map(propertyToCardItem);
  }

  return (
    <div>
      <AppHeader />
      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {dataErrorMessages.length > 0 ? (
          <DataErrorNotice messages={dataErrorMessages} />
        ) : null}
        <AdminListingsClient
          listings={listings}
          organization={organization}
          organizationId={organizationId}
        />
      </div>
      <Footer />
    </div>
  );
}

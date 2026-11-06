import { cookies } from "next/headers";
import {
  filterPropertiesByOrganization,
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

export const metadata = {
  title: "Organization Property Listings",
  description: "Browse published property listings from this organization.",
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
  if (payload && typeof payload === "object" && (payload.id || payload._id || payload.title || payload.listingType)) {
    return [payload];
  }
  return [];
}

export default async function AdminListingsPage({ searchParams }) {
  // 1. Fetch all property sources in parallel — never throws
  const results = await Promise.allSettled([
    getMyProperties(),
    getManagedProperties(),
    getMyRentedProperties(),
  ]);

  // 2. Extract fulfilled values (unwrapping settled results)
  const [myPropertiesRes, managedPropertiesRes, rentedPropertiesRes] = results;

  const myProperties =
    myPropertiesRes.status === "fulfilled" ? myPropertiesRes.value ?? [] : [];
  const managedProperties =
    managedPropertiesRes.status === "fulfilled"
      ? managedPropertiesRes.value ?? []
      : [];
  const rentedProperties =
    rentedPropertiesRes.status === "fulfilled" ? rentedPropertiesRes.value ?? [] : [];

  // 3. Combine everything into one list, then scope + dedupe by property id
  const params = await searchParams;
  const cookieStore = await cookies();
  const allResultsProperties = [
    ...(Array.isArray(myProperties) ? myProperties : []),
    ...(Array.isArray(managedProperties) ? managedProperties : []),
    ...(Array.isArray(rentedProperties) ? rentedProperties : []),
  ];
  const organizationIdFromQuery =
    typeof params?.organizationId === "string"
      ? params.organizationId.trim()
      : "";
  const cookieOrganizationId = cookieStore.get("organizationId")?.value || "";
  const organizationId = organizationIdFromQuery || cookieOrganizationId || "";

  console.log("organizationId", organizationId);

  const organization = isValidOrganizationId(organizationId)
    ? await getPublicOrganizationById(organizationId)
    : null;
  if (isValidOrganizationId(organizationId) && !organization) notFound();

  let listings = [];

  if (isValidOrganizationId(organizationId)) {
    try {
      // 4. Scope the merged result set to this organization (if applicable)
      const scopedFromResults = filterPropertiesByOrganization(
        allResultsProperties,
        organizationId
      );

      // 5. Optionally merge in org-scoped public listings as a fallback
      //    (remove this block if results alone are sufficient)
      const scopedProperties = await getOrganizationProperties(organizationId);
      const merged = [
        ...scopedFromResults,
        ...(Array.isArray(scopedProperties) ? scopedProperties : []),
      ];

      // 6. Dedupe by property id
      const uniqueProperties = merged.filter((property, index, properties) => {
        const propertyId =
          property.id || property._id || property.propertyId;
        if (!propertyId) return false;
        return (
          properties.findIndex(
            (candidate) =>
              (candidate.id || candidate._id || candidate.propertyId) ===
              propertyId
          ) === index
        );
      });
      // 7. Fetch full listing details for each property
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      const listingsByProperty = await Promise.all(
        uniqueProperties.map(async (property) => {
          const propertyId =
            property.id || property._id || property.propertyId;
          if (!propertyId) return [];

          const fetchedListings = await getListingById(propertyId, token);
          const propertyListingArray = toListingArray(fetchedListings);

          return propertyListingArray.map((listing) => ({
            ...listing,
            property: {
              ...property,
              ...(listing.property && typeof listing.property === "object" && !Array.isArray(listing.property)
                ? listing.property
                : {}),
            },
            propertyId: listing.propertyId || propertyId,
          }));
        })
      );

      listings = listingsByProperty.flat();
    } catch (error) {
      console.warn(
        "Failed to load organization properties for listings page:",
        error
      );
    }
  } else {
    // 8. No organizationId → show only properties from the results variable
    //    (Home / Blogs / public Listings fallback)
    listings = allResultsProperties;
  }

  return (
    <div>
      <AppHeader />
      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <AdminListingsClient
          listings={listings}
          organization={organization}
          organizationId={organizationId}
        />
      </div>
      <Footer/>
    </div>
  );
}

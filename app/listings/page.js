import { cookies } from "next/headers";
import { filterPropertiesByOrganization, getOrganizationProperties, getProperties, getListingById, getPublicOrganizationById } from "@/app/_lib/data-services";
import AdminListingsClient from "./AdminListingsClient";
import AppHeader from "../_components/AppHeader";
import { isValidOrganizationId } from "../_lib/public-navigation";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Organization Property Listings",
  description: "Browse published property listings from this organization.",
};

export default async function AdminListingsPage({ searchParams }) {
  const params = await searchParams;
  const organizationId = typeof params?.organizationId === "string" ? params.organizationId.trim() : "";
  const organization = isValidOrganizationId(organizationId) ? await getPublicOrganizationById(organizationId) : null;
  if (isValidOrganizationId(organizationId) && !organization) notFound();
  let listings = [];

  if (isValidOrganizationId(organizationId)) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const [scopedProperties, [publicProperties]] = await Promise.all([
        getOrganizationProperties(organizationId),
        getProperties({ organizationId, limit: 100 }),
      ]);
      const organizationProperties = filterPropertiesByOrganization(
        scopedProperties.length ? scopedProperties : publicProperties,
        organizationId
      );
      const listingsByProperty = await Promise.all(organizationProperties.map(async (property) => {
        const propertyId = property.id || property._id || property.propertyId;
        if (!propertyId) return [];
        const propertyListings = await getListingById(propertyId, token);
        console.log(propertyListings);
        const propertyListingArray = Array.isArray(propertyListings)
          ? propertyListings
          : Array.isArray(propertyListings?.data)
            ? propertyListings.data
            : [];
        return propertyListingArray.map((listing) => ({
          ...listing,
          property: listing.property || property,
          propertyId: listing.propertyId || propertyId,
        }));
      }));
      listings = listingsByProperty.flat();
    } catch (error) {
      console.warn("Failed to load organization properties for listings page:", error);
    }
  }

  return (
    <div>
            <AppHeader />
<div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <AdminListingsClient listings={listings} organization={organization} organizationId={organizationId} />
    </div>
    </div>
    
  );
}

import ListingsDirectoryTab from "./ListingsDirectoryTab";
import Link from "next/link";

export default function AdminListingsClient({ listings = [], organization, organizationId }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-primary-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            {organization?.name ? `${organization.name} Listings` : "Property Listings"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Browse available properties and units from this organization.</p>
        </div>
        <Link href={`/listings/statistics?organizationId=${encodeURIComponent(organizationId || "")}`} className="inline-flex w-fit items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-900">
          View Listing Statistics
        </Link>
      </div>
      <ListingsDirectoryTab listings={listings} organizationId={organizationId} />
    </div>
  );
}

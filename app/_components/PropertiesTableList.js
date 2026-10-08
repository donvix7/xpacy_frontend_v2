import Link from "next/link";
import { formatCurrency } from "@/app/_lib/utils";
import EmptyState from "@/app/_components/EmptyState";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import StatusChips from "./StatusChips";
import PropertyOptionsMenu from "./PropertyOptionsMenu";
import SearchInput from "./SearchInput";
import DashboardFilter from "./DashboardFilter";
import DataTable from "./DataTable";

const legacyTableHeadings = [
    { heading: "Property" },
    { heading: "Views" },
    { heading: "Property Status", center: true },
    { heading: "Availability Status", center: true },
    { heading: "Featured", center: true },
    { heading: "Price", center: true },
    { heading: "Reserve Amount", center: true },
    { heading: "" }
];

const organizationTableHeadings = [
    { heading: "Property" },
    { heading: "Type" },
    { heading: "Status", center: true },
    { heading: "Units", center: true },
    { heading: "Buildings", center: true },
    { heading: "Organization" },
    { heading: "" },
];

export default function PropertiesTableList({ properties, bookings = [], pagination, baseUrl = "/dashboard/property-owner/properties", ctaLink = "/dashboard/property-owner/properties/add", recent = false }) {
  console.log("properties",properties)  
  if (!properties?.length) return <EmptyState message={"No properties found."} />

    const isOrganizationProperty = properties.some((property) =>
        property && ("propertyType" in property || "totalUnits" in property || "organizationId" in property)
    );
    const tableHeadings = isOrganizationProperty ? organizationTableHeadings : legacyTableHeadings;

    const getActiveBooking = (propertyId) => {
        if (!bookings.length) return null;
        return bookings.find(b => 
            (b.property_id === propertyId || b.property?._id === propertyId) && 
            ['active', 'confirmed'].includes(b.status?.toLowerCase())
        );
    };

    const displayProperties = recent ? properties.slice(0, 4) : properties;

    const renderRow = (property) => {
        const activeBooking = getActiveBooking(property.id || property._id);
        const name = property?.property_name || property?.name || "Untitled property";
        const status = property?.status || property?.property_status || "N/A";
        const location = [property?.city, property?.state].filter(Boolean).join(", ") || property?.address || "Location unavailable";
        const Views = property?.views || "N/A";
        const Featured = property?.featured ? "Yes" : "No";
         
        return (
            <tr key={property.id || property._id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50/50 transition-colors last:border-0">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {property.images?.[0] ? (
                                <Image 
                                    src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`} 
                                    alt={name} 
                                    className="object-cover" 
                                    fill 
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                            )}
                        </div>
                        <div className="flex flex-col max-w-[200px]">
                            <span className="font-semibold text-gray-900 truncate" title={name}>{name}</span>
                            <div className="flex items-center text-gray-500 text-xs mt-0.5">
                                <FaMapMarkerAlt size={10} className="mr-1 shrink-0" />
                                <span className="truncate">{location}</span>
                            </div>
                        </div>
                    </div>
                </td>
                {isOrganizationProperty ? (
                    <>
                        <td className="p-4 text-capitalize text-xs">{(property.propertyType || "N/A").replaceAll("_", " ")}</td>
                        <td className="p-4"><StatusChips status={status} /></td>
                        <td className="p-4">{property.totalUnits ?? property._count?.units ?? "N/A"}</td>
                        <td className="p-4">{property._count?.buildings ?? "N/A"}</td>
                        <td className="p-4">{property.organization?.name || "N/A"}</td>
                    </>
                ) : (
                    <>
                        <td className="p-4 ">{Views}</td>
                        <td className="p-4"><div className="flex justify-center captitalize"><StatusChips status={status} /></div></td>
                        <td className="p-4"><div className="flex justify-center captitalize"><StatusChips status={property.availability_status || "N/A"} /></div></td>
                        <td className="p-4 text-gray-600 font-mono text-xs">{Featured}</td>
                        <td className="p-4 text-primary font-bold">{property.property_price ? formatCurrency(property.property_price) : "N/A"}</td>
                        <td className="p-4 text-primary font-bold">{property.reserve_amount || activeBooking?.amount ? formatCurrency(property.reserve_amount || activeBooking?.amount) : "None"}</td>
                    </>
                )}
                <td className="p-4 relative text-center">
                    <div className="flex justify-center">
                        <PropertyOptionsMenu id={property.id || property._id} />
                    </div>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (property) => {
        const activeBooking = getActiveBooking(property.id || property._id);
        const name = property?.property_name || property?.name || "Untitled property";
        const status = property?.status || property?.property_status || "N/A";
        const location = [property?.city, property?.state].filter(Boolean).join(", ") || property?.address || "Location unavailable";
        const Views = property?.views || "N/A";
        const Featured = property?.featured ? "Yes" : "No";

        return (
            <div key={property.id || property._id} className="flex flex-col gap-4 p-4 border-b border-primary-100 bg-white last:border-0 w-full border-2">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col items-center gap-3 relative w-full">
                        <div className="flex items-start justify-between w-full gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                {property.images?.[0] ? (
                                    <Image
                                        src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`}
                                        alt={name}
                                        className="object-cover"
                                        fill
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                        No Img
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 self-end">
                                <PropertyOptionsMenu id={property.id || property._id} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-3 w-full">
                            <div className="flex justify-between items-center gap-2">
                                <label className="text-sm text-gray-500">Name</label>
                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={name}>
                                    {name}
                                </span>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                                <label className="text-sm text-gray-500">Location</label>
                                <div className="flex items-center text-xs text-gray-500 truncate max-w-[200px]">
                                    <FaMapMarkerAlt size={10} className="mr-1 shrink-0 text-gray-400" />
                                    <span className="truncate">{location}</span>
                                </div>
                            </div>

                            {isOrganizationProperty ? (
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-gray-500">Type</label>
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize w-fit bg-blue-100 text-blue-700">
                                        {(property.propertyType || "N/A").replaceAll("_", " ")}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-gray-500">Price</label>
                                    <span className="text-sm font-bold text-primary font-mono">
                                        {property.property_price ? formatCurrency(property.property_price) : "N/A"}
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 p-3 text-sm text-gray-600 bg-gray-50 rounded-lg">
                                {isOrganizationProperty ? (
                                    <>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Units</span>
                                            <span className="font-medium text-gray-900">
                                                {property.totalUnits ?? property._count?.units ?? "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Buildings</span>
                                            <span className="font-medium text-gray-900">
                                                {property._count?.buildings ?? "N/A"}
                                            </span>
                                        </div>
                                        {property.organization?.name && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-500">Organization</span>
                                                <span className="font-medium text-gray-900 truncate max-w-[140px]">
                                                    {property.organization.name}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Status</span>
                                            <StatusChips status={status} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Views</span>
                                            <span className="font-medium text-gray-900">{Views}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Property Status</span>
                                            <StatusChips status={status} />
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Availability</span>
                                            <StatusChips status={property.availability_status || "N/A"} />
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Featured</span>
                                            <span className="font-medium text-gray-900">{Featured}</span>
                                        </div>
                                        {(property.reserve_amount || activeBooking?.amount) && (
                                            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-200">
                                                <span className="font-semibold text-gray-500">Reserve</span>
                                                <span className="font-bold text-primary font-mono">
                                                    {formatCurrency(property.reserve_amount || activeBooking?.amount)}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const headerActions = recent ? (
        <Link href={baseUrl} className="text-sm text-primary hover:underline font-medium shrink-0 whitespace-nowrap">
            View All
        </Link>
    ) : (
        <div className="flex items-center gap-4 shrink-0">
            <SearchInput />
            <DashboardFilter />
        </div>
    );

    return (
        <DataTable
            title="Property Overview"
            headers={tableHeadings}
            data={displayProperties}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            headerActions={headerActions}
            showPagination={!recent}
            pagination={pagination}
        />
    );
}

import Link from "next/link";
import { formatCurrency } from "@/app/_lib/utils";
import EmptyState from "@/app/_components/EmptyState";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import { format } from "date-fns";
import StatusChips from "./StatusChips";
import PropertyOptionsMenu from "./PropertyOptionsMenu";
import SearchInput from "./SearchInput";
import DashboardFilter from "./DashboardFilter";
import DataTable from "./DataTable";

const tableHeadings = [
    { heading: "Property" },
    { heading: "Views" },
    { heading: "Property Status", center: true },
    { heading: "Availability Status", center: true },
    { heading: "Featured", center: true },
    { heading: "Price", center: true },
    { heading: "Reserve Amount", center: true },
    { heading: "" }
];

export default function PropertiesTableList({ properties, bookings = [], pagination, baseUrl = "/dashboard/property-owner/properties", ctaLink = "/dashboard/property-owner/properties/add", recent = false }) {
    if (!properties?.length) return <EmptyState message={"No properties found."} />

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
        const Views = property?.views || "N/A";
        const propertyStatus = property?.property_status  || "N/A";
        const Featured = property?.featured ? "Yes" : "No";
         
        return (
            <tr key={property.id || property._id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50/50 transition-colors last:border-0">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {property.images?.[0] ? (
                                <Image 
                                    src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`} 
                                    alt={property.property_name} 
                                    className="object-cover" 
                                    fill 
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                            )}
                        </div>
                        <div className="flex flex-col max-w-[200px]">
                            <span className="font-semibold text-gray-900 truncate" title={property.property_name}>{property.property_name}</span>
                            <div className="flex items-center text-gray-500 text-xs mt-0.5">
                                <FaMapMarkerAlt size={10} className="mr-1 shrink-0" />
                                <span className="truncate">{property.city}, {property.state}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-center">
                    {Views}
                </td>
                <td className="p-4">
                    <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap`}>
                            {propertyStatus}
                        </span>
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex justify-center">
                        <StatusChips status={property.availability_status || 'N/A'} />
                    </div>
                </td>
                <td className="p-4 text-center text-gray-600 font-mono text-xs">
                    {Featured}
                </td>
                <td className="p-4 text-center text-primary font-bold">
                     {property.property_price ? formatCurrency(property.property_price) : "N/A"}
                </td>
                <td className="p-4 text-center text-primary font-bold">
                    {property.reserve_amount || activeBooking?.amount ? formatCurrency(property.reserve_amount || activeBooking?.amount) : "None"}
                </td>
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
        const Views = property?.views || "N/A";
        const propertyStatus = property?.property_status || "N/A";
        const Featured = property?.featured ? "Yes" : "No";

        return (
            <div key={property.id || property._id} className="flex flex-col gap-4 p-4 border-b border-primary-100 bg-white last:border-0 font-mono">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 overflow-hidden">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {property.images?.[0] ? (
                                <Image 
                                    src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`} 
                                    alt={property.property_name} 
                                    className="object-cover" 
                                    fill 
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <h3 className="font-bold text-sm text-neutrals-900 truncate">{property.property_name}</h3>
                            <div className="flex items-center text-gray-500 text-xs truncate">
                                <FaMapMarkerAlt size={10} className="mr-1 shrink-0" />
                                <span className="truncate">{property.city}, {property.state}</span>
                            </div>
                            <p className="text-sm font-bold text-primary mt-1">
                                {property.property_price ? formatCurrency(property.property_price) : "N/A"}
                            </p>
                        </div>
                    </div>
                    <PropertyOptionsMenu id={property.id || property._id} />
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-[10px] uppercase font-bold">
                    <div className="flex flex-col">
                        <span className="text-gray-400 mb-1">Views</span>
                        <span className="text-gray-900 truncate">{Views}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-400 mb-1">Property Status</span>
                        <span className={`px-2 py-0.5 rounded-full `}>
                            {propertyStatus}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 mb-1">Availability Status</span>
                        <StatusChips status={property.availability_status || 'N/A'} />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-400 mb-1">Featured</span>
                        <span className="text-gray-900">{Featured}</span>
                    </div>
                    <div className="flex flex-col col-span-2 border-t border-gray-100 pt-2">
                        <div className="flex flex-col">
                            <span className="text-gray-400 uppercase">Reserve Amount</span>
                            <span className="text-primary">{property.reserve_amount || activeBooking?.amount ? formatCurrency(property.reserve_amount || activeBooking?.amount) : "None"}</span>
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
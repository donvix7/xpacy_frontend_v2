import Image from "next/image";
import { formatCurrency } from "../_lib/utils";
import StatusChips from "./StatusChips";
import TableOptionsMenu from "./TableOptionsMenu";
import DataTable from "./DataTable";
import { FaMapMarkerAlt } from "react-icons/fa";

const tableHeadings = [
    { heading: "Property" },
    { heading: "Owner’s Information" },
    { heading: "Views" },
    { heading: "Property Status", center: true },
    { heading: "Availability Status", center: true },
    { heading: "Featured", center: true },
    { heading: "Price", center: true },
    { heading: "" }
];

export default async function AdminPropertyList({ properties, bookings = [], pagination }) {

    const getActiveBooking = (propertyId) => {
        if (!bookings?.length) return null;
        return bookings.find(b => 
            (b.property_id === propertyId || b.property?._id === propertyId) && 
            ['active', 'confirmed'].includes(b.status?.toLowerCase())
        );
    };

    const renderRow = (property) => {
        const activeBooking = getActiveBooking(property.id || property._id);
        const Views = property?.views || "N/A";
        const propertyStatus = property?.property_status || "N/A";
        const Featured = property?.featured ? "Yes" : "No";

        return (
            <tr key={property.id || property._id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50/50 transition-colors last:border-0">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {property?.images?.[0] ? (
                                <Image 
                                    src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`} 
                                    alt={property.property_name || "property-image"} 
                                    className="object-cover" 
                                    fill 
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                            )}
                        </div>
                        <div className="flex flex-col max-w-[200px]">
                            <span className="font-semibold text-gray-900 truncate" title={property?.property_name}>{property?.property_name}</span>
                            <div className="flex items-center text-gray-500 text-xs mt-0.5">
                                <FaMapMarkerAlt size={10} className="mr-1 shrink-0" />
                                <span className="truncate">{property?.city}, {property?.state}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex flex-col justify-center max-w-[150px]">
                        <strong className="font-semibold truncate" title={`${property?.propertyOwner?.first_name} ${property?.propertyOwner?.last_name}`}>{property?.propertyOwner?.first_name} {property?.propertyOwner?.last_name}</strong>
                        {property?.propertyOwner?.phone && <span className="text-xs text-gray-500 truncate" title={property?.propertyOwner?.phone}>{property?.propertyOwner?.phone}</span>}
                        <span className="text-xs text-gray-500 truncate block" title={property?.propertyOwner?.email}>{property?.propertyOwner?.email}</span>
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
                        <StatusChips status={property?.availability_status || 'N/A'} />
                    </div>
                </td>
                <td className="p-4 text-center text-gray-600 font-mono text-xs">
                    {Featured}
                </td>
                <td className="p-4 text-center text-primary font-bold">
                    {property?.property_price ? formatCurrency(property?.property_price) : "N/A"}
                </td>
                
                <td className="p-4 relative text-center">
                    <div className="flex justify-center">
                        <TableOptionsMenu id={property?.id || property?._id} />
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
                <div className="flex items-start  gap-4">
                    <div className="flex gap-3 overflow-hidden w-full relative">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {property?.images?.[0] ? (
                                <Image 
                                    src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`} 
                                    alt={property.property_name || "property-image"} 
                                    className="object-cover" 
                                    fill 
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 w-full ">
                            <div className="flex self-end absolute right-0 top-0 backdrop-blur-sm">
                                <TableOptionsMenu id={property?.id || property?._id} />
                            </div>

                            <div className="flex items-center gap-2">
                                 <h3 className="font-bold text-sm text-neutrals-900 truncate">{property?.property_name}</h3>

                            </div>
                            <div className="flex items-center gap-2">
                                <label className="font-semibold text-sm text-neutrals-900 truncate">Location:</label>
                                <FaMapMarkerAlt size={10} className="mr-1 shrink-0" />
                                <span className="truncate">{property?.city}, {property?.state}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="font-semibold text-sm text-neutrals-900 truncate">Price:</label>
                                <p className="text-sm font-bold text-primary mt-1">
                                    {property?.property_price ? formatCurrency(property?.property_price) : "N/A"}
                                </p>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <label className="font-semibold text-gray-500 uppercase">Owner:</label>
                                <div className="flex flex-col items-end max-w-[150px]">
                                    <span className="font-medium text-gray-900 truncate w-full text-right" title={`${property?.propertyOwner?.first_name} ${property?.propertyOwner?.last_name}`}>{property?.propertyOwner?.first_name} {property?.propertyOwner?.last_name}</span>
                                    <span className="text-[10px] text-gray-500 truncate w-full text-right" title={property?.propertyOwner?.email}>{property?.propertyOwner?.email}</span>
                                </div>
                        </div>

                        <div className="flex justify-between">
                            <label className="text-gray-400 mb-1">Views</label>
                            <span className="text-gray-900 truncate">{Views}</span>
                        </div>
                        <div className="flex justify-between">
                            <label className="text-gray-400 mb-1">Property Status</label>
                            <span className={`px-2 py-0.5 rounded-full `}>
                                {propertyStatus}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <label className="text-gray-400 mb-1">Status</label>
                            <StatusChips status={property?.availability_status || 'N/A'} />
                        </div>
                        <div className="flex justify-between">
                            <label className="text-gray-400 mb-1">Featured</label>
                            <span className="text-gray-900">{Featured}</span>
                        </div>

                        </div>
                    </div>
                </div>
                    
                </div>
        );
    };

    return (
        <DataTable
            headers={tableHeadings}
            data={properties}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={true}
            pagination={pagination}
            className="p-0! border-none shadow-none bg-transparent "
        />
    );
}
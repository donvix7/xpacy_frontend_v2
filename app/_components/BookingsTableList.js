import Image from "next/image";
import UserFilterMenu from "./UserFilterMenu";
import { format } from "date-fns";
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { formatCurrency } from "../_lib/utils";
import EmptyState from "./EmptyState";
import DataTable from "./DataTable";
import Link from "next/link";

const tableHeadings = [
    { heading: "Property Name/Address" },
    { heading: "Payment Status", center: true },
    { heading: "Property Status", center: true },
    { heading: "Start Date", center: true },
    { heading: "Current Price", center: true },
    { heading: "" }
];

export default function BookingsTableList({ bookings }) {

    if (!bookings?.length) return <EmptyState message={"Opps you don't have any bookings yet."} />

    const renderRow = (booking) => {
        const actions = [
            {
                label: "View booking",
                href: `/dashboard/user/booked-services/${booking?.id}`
            }
        ];

        return (
        <tr key={booking.id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50/50 transition-colors last:border-0">
            <td className="p-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-16 h-12 relative shrink-0">
                        <Image src={`https://app.xpacy.com/src/upload/properties/${booking?.property.images[0]}`} alt="property" className="object-cover rounded-md" unoptimized fill />
                    </div>
                    <span className="truncate max-w-[250px]" title={`${booking?.property?.property_name}, ${booking?.property?.city}`}>{booking?.property?.property_name}, {booking?.property?.city}, {booking?.property?.state}</span>
                </div>
            </td>
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    {(() => {
                        const status = booking?.status || "Pending";
                        const statusLower = status.toLowerCase();
                        let statusColor = "bg-error";
                        if (['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes(statusLower)) statusColor = "bg-green-500";
                        else if (['pending', 'processing'].includes(statusLower)) statusColor = "bg-orange-500 text-black";
                        
                        return (
                            <span className={`${statusColor} text-secondary-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap`}>
                                {status}
                            </span>
                        )
                    })()}
                </div>
            </td>
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    <span className="bg-[#EBE1CE] text-[#816535] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">
                        {booking?.property?.property_status}
                    </span>
                </div>
            </td>
            <td className="p-4 text-center">
                {format(new Date(booking?.start_date), "dd/MM/yy")}
            </td>
            <td className="p-4 text-center font-bold text-primary">
                {formatCurrency(booking?.property?.property_price)}
            </td>
            <td className="p-4 relative text-center">
                <div className="flex justify-center">
                    <Link href={`/dashboard/user/my-properties/${booking?.property?.id}`} className="text-primary px-2.5 py-1 text-sm font-bold whitespace-nowrap hover:underline">
                        View
                    </Link>
                </div>
            </td>
        </tr>
        );
    };

    const renderMobileCard = (booking) => {
        const actions = [
            {
                label: "View booking",
                href: `/dashboard/user/booked-services/${booking?.id}`
            }
        ];

        return (
        <div key={booking.id} className="flex flex-col gap-4 p-4 border-b border-primary-100 bg-white last:border-0 font-mono">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="bg-[#EBE1CE] text-[#816535] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {booking?.property?.property_status}
                    </span>
                </div>
                <TableItemOptionsMenu menuId={`booking-menu-mobile-${booking?.id}`} actions={actions} />
            </div>

            <div className="flex items-center gap-3">
                <div className="w-20 h-16 relative shrink-0">
                    <Image src={`https://app.xpacy.com/src/upload/properties/${booking?.property.images[0]}`} alt="property" className="object-cover rounded-md" unoptimized fill />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{booking?.property?.property_name}</h3>
                    <p className="text-xs text-gray-500">{booking?.property?.city}, {booking?.property?.state}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-xs">
                <div className="flex flex-col">
                    <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Current Price</span>
                    <span className="font-bold text-gray-900">{formatCurrency(booking?.property?.property_price)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Payment Status</span>
                    {(() => {
                        const status = booking?.status || "Pending";
                        const statusLower = status.toLowerCase();
                        let statusColor = "bg-error";
                        if (['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes(statusLower)) statusColor = "bg-green-500";
                        else if (['pending', 'processing'].includes(statusLower)) statusColor = "bg-yellow-500 text-black";
                        
                        return (
                            <span className={`${statusColor} text-secondary-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
                                {status}
                            </span>
                        )
                    })()}
                </div>
                <div className="flex flex-col col-span-2 border-t border-gray-100 pt-2">
                    <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Booking Date</span>
                    <span className="text-gray-700">{format(new Date(booking?.start_date), "dd/MM/yy")}</span>
                </div>
            </div>
        </div>
        );
    };

    return (
        <DataTable
            title="Properties Overview"
            headers={tableHeadings}
            data={bookings}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            headerActions={<UserFilterMenu />}
        />
    );
}
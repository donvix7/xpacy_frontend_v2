import { getAdminBooking,  } from "../_lib/data-services";
import { cookies } from "next/headers";
import EmptyState from "./EmptyState";
import StatusChips from "./StatusChips";
import DataTable from "./DataTable";
import BookingOptionsMenu from "./BookingOptionsMenu";
import { formatCurrency } from "../_lib/utils";
import { format } from "date-fns";

const tableHeadings = [
    { heading: "Property" },
    { heading: "Tenant/Buyer" },
    { heading: "Date" },
    { heading: "Status", center: true },
    { heading: "Amount", right: true },
    { heading: "" }
];

export default async function AdminBookingList({ bookings }) {
    let bookedData = bookings;
    
    if (!bookedData) {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        bookedData = await getAdminBooking(token);
    }
    
    if (!bookedData || bookedData.length <= 0) return <EmptyState message={"Oops!... No bookings found."} />

    const renderRow = (booking) => {
        const status = (booking.payment_status || booking.status || "N/A");
        
        return (
            <tr key={booking.id || booking._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-0 text-sm font-mono text-gray-700">
                <td className="p-4 font-semibold text-gray-900">{booking.property?.property_name || "N/A"}</td>
                <td className="p-4">{booking.user?.firstname ? `${booking.user.firstname} ${booking.user.lastname || ''}` : "N/A"}</td>
                <td className="p-4">{booking.createdAt || booking.start_date ? format(new Date(booking.createdAt || booking.start_date), "MMM dd, yyyy") : "N/A"}</td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={status} />
                    </div>
                </td>
                <td className="p-4 text-right font-bold text-primary">
                    {booking.amount || booking.property?.property_price ? formatCurrency(booking.amount || booking.property?.property_price) : "N/A"}
                </td>
                <td className="p-4 text-center">
                    <BookingOptionsMenu id={booking.id || booking._id} />
                </td>
            </tr>
        );
    }

    const renderMobileCard = (booking) => {
        const status = (booking.payment_status || booking.status || "N/A");

        return (
            <div key={booking.id || booking._id} className="py-6 flex flex-col gap-4 border-b border-gray-100 bg-white last:border-0 font-mono">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-gray-800">{booking.property?.property_name || "N/A"}</h3>
                        <p className="text-xs text-gray-500">{booking.createdAt || booking.start_date ? format(new Date(booking.createdAt || booking.start_date), "MMM dd, yyyy") : "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusChips status={status} />
                        <BookingOptionsMenu id={booking.id || booking._id} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-xs">
                    <div className="flex flex-col gap-1">
                        <p className="text-neutral-500 text-[10px] uppercase font-bold">Tenant/Buyer</p>
                        <p className="text-gray-700">{booking.user?.firstname ? `${booking.user.firstname} ${booking.user.lastname || ''}` : "N/A"}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <p className="text-neutral-500 text-[10px] uppercase font-bold">Amount Paid</p>
                        <p className="font-bold text-primary">{booking.amount || booking.property?.property_price ? formatCurrency(booking.amount || booking.property?.property_price) : "N/A"}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DataTable
            headers={tableHeadings}
            data={bookedData}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={false}
            className="p-0! border-none shadow-none"
        />
    );
}

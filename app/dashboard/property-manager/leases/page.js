import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerBookings,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FaFileContract, FaHourglassHalf } from "react-icons/fa6";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerBookings(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const bookings = results[2].status === "fulfilled" ? results[2].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);
    const myBookings = Array.isArray(bookings) ? bookings : [];

    const activeLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "active" || (b.status || "").toLowerCase() === "confirmed");
    const pendingLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "pending");
    const expiredLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "expired" || (b.status || "").toLowerCase() === "cancelled");

  
const summaryCards = [
    { 
        label: "Total Leases", 
        value: myBookings.length, 
        color: "bg-primary-100", 
        icon: <FaFileContract className="w-5 h-5 text-primary-700" /> 
    },
    { 
        label: "Active", 
        value: activeLeases.length, 
        color: "bg-blue-100", 
        icon: <FaCheckCircle className="w-5 h-5 text-blue-700" /> 
    },
    { 
        label: "Pending", 
        value: pendingLeases.length, 
        color: "bg-amber-100", 
        icon: <FaHourglassHalf className="w-5 h-5 text-amber-700" /> 
    },
    { 
        label: "Expired", 
        value: expiredLeases.length, 
        color: "bg-red-100", 
        icon: <FaExclamationCircle className="w-5 h-5 text-red-700" /> 
    },
];

    return (
        <div className="space-y-6 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Leases</h1>
            <SummaryCards cards={summaryCards} title="Lease Overview" />

            <DashboardGridItem title="Lease Agreements">
                {myBookings.length === 0 ? (
                    <EmptyState message="No lease agreements found. Leases will appear here once properties are booked." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary-200">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Booking</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Property</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Check-in</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Check-out</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myBookings.slice(0, 20).map((booking, i) => (
                                    <tr key={booking.id || booking._id || i} className="border-b border-primary-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium">{booking.booking_number || booking.id || `BK-${i + 1}`}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{booking.property_title || booking.property_name || "—"}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{booking.check_in || booking.start_date ? new Date(booking.check_in || booking.start_date).toLocaleDateString() : "—"}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{booking.check_out || booking.end_date ? new Date(booking.check_out || booking.end_date).toLocaleDateString() : "—"}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                (booking.status || "").toLowerCase() === "active" || (booking.status || "").toLowerCase() === "confirmed" ? "bg-green-100 text-green-700"
                                                : (booking.status || "").toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {booking.status || "Unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}

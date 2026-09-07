import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import { FaCalendarCheck, FaDoorOpen, FaPeopleRoof } from "react-icons/fa6";
import { FiLogIn } from "react-icons/fi";

const statusKey = (s) => (s || "").toLowerCase();

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const bookings = await getAdminBooking(token) || [];
    const myBookings = Array.isArray(bookings) ? bookings : [];

    const expectedCheckIns = myBookings.filter(b => ["confirmed", "pending", "approved", "accepted"].includes(statusKey(b.status)));
    const inHouseGuests = myBookings.filter(b => ["checked-in", "in-house", "inhouse", "active"].includes(statusKey(b.status)));
    const checkedOutGuests = myBookings.filter(b => ["completed", "checked-out", "checkout", "departed"].includes(statusKey(b.status)));

    const summaryCards = [
        {
            label: "Total Bookings",
            value: myBookings.length,
            color: "bg-primary-100",
            icon: <FaCalendarCheck className="w-5 h-5 text-primary-700" />
        },
        {
            label: "Expected Check-ins",
            value: expectedCheckIns.length,
            color: "bg-blue-100",
            icon: <FiLogIn className="w-5 h-5 text-blue-700" />
        },
        {
            label: "In-house Guests",
            value: inHouseGuests.length,
            color: "bg-amber-100",
            icon: <FaPeopleRoof className="w-5 h-5 text-amber-700" />
        },
        {
            label: "Completed Stays",
            value: checkedOutGuests.length,
            color: "bg-green-100",
            icon: <FaDoorOpen className="w-5 h-5 text-green-700" />
        },
    ];

    const badge = (status) => {
        const key = statusKey(status);
        const className = key === "completed" || key === "checked-out" || key === "departed"
            ? "bg-green-100 text-green-700"
            : key === "checked-in" || key === "in-house" || key === "active"
            ? "bg-blue-100 text-blue-700"
            : key === "cancelled" || key === "canceled"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700";
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{status || "Pending"}</span>;
    };

    const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Guest Check-in & Check-out</h1>

            <SummaryCards cards={summaryCards} title="Check-in Overview" />

            <DashboardGridItem title="Guest Stays">
                {myBookings.length === 0 ? (
                    <EmptyState message="No guest stays found. Bookings will appear here for check-in and check-out management." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary-200">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Guest</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Property</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Check-in</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Check-out</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myBookings.slice(0, 20).map((b, i) => (
                                    <tr key={b.id || b._id || i} className="border-b border-primary-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium">{b.guest_name || b.customer_name || b.user_name || b.client_name || `Guest ${i + 1}`}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{b.property_name || b.property_id || "—"}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(b.check_in_date || b.checkin_date || b.start_date)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(b.check_out_date || b.checkout_date || b.end_date)}</td>
                                        <td className="py-3 px-4">{badge(b.status)}</td>
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
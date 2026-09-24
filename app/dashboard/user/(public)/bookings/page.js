import { cookies } from "next/headers";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getMyBookings } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

const tableHeadings = [
    { heading: "Unit" },
    { heading: "Check-In" },
    { heading: "Check-Out" },
    { heading: "Guests", center: true },
    { heading: "Status", center: true },
    { heading: "" },
];

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return value;
    }
};

const formatGuestCount = (booking) => {
    const total =
        booking.numberOfGuests ??
        (Number(booking.numberOfAdults || 0) +
            Number(booking.numberOfChildren || 0));
    return `${total} ${total === 1 ? "guest" : "guests"}`;
};

export default async function BookingList({ bookings }) {
    let bookingList = bookings;

    // If not passed in, fetch using the token from cookies
    if (!bookingList) {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        bookingList = await getMyBookings(token);
    }

    if (!bookingList || bookingList.length <= 0) {
        return (
            <EmptyState
                message={"Oops!... You have no bookings yet."}
                cta={"Browse Listings"}
                link={"/listings"}
            />
        );
    }

    const renderRow = (booking) => (
        <tr
            key={booking.id || booking._id}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0 text-sm font-mono"
        >
            <td className="p-4">{booking.unitId || "—"}</td>
            <td className="p-4">{formatDate(booking.checkIn)}</td>
            <td className="p-4">{formatDate(booking.checkOut)}</td>
            <td className="p-4 text-center">{formatGuestCount(booking)}</td>
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    <StatusChips status={booking.status || "PENDING"} />
                </div>
            </td>
            <td className="p-4">
                {/* Optional: add a details link */}
                {/* <Link href={`/bookings/${booking.id}`}>View</Link> */}
            </td>
        </tr>
    );

    const renderMobileCard = (booking) => (
        <div
            key={booking.id || booking._id}
            className="py-6 flex flex-col gap-4 border-b border-gray-100 bg-white last:border-0 font-mono"
        >
            <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">
                    {formatDate(booking.checkIn)} →{" "}
                    {formatDate(booking.checkOut)}
                </p>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-gray-800">
                    {booking.unitId || "—"}
                </h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                        Status:
                    </span>
                    <StatusChips status={booking.status || "PENDING"} />
                </div>
            </div>

            <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex flex-col gap-1">
                    <p className="text-neutral-500 text-[10px] uppercase font-bold">
                        Guests
                    </p>
                    <p className="text-gray-700">
                        {formatGuestCount(booking)}
                        {booking.numberOfChildren > 0 && (
                            <span className="text-gray-500">
                                {" "}
                                ({booking.numberOfAdults} adults,{" "}
                                {booking.numberOfChildren} children)
                            </span>
                        )}
                    </p>
                </div>

                {booking.specialRequests && (
                    <div className="flex flex-col gap-1">
                        <p className="text-neutral-500 text-[10px] uppercase font-bold">
                            Special Requests
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {booking.specialRequests}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 p-2">
            <MobileDashboardHeader />
            <DashboardGridItem title="Bookings">
       <DataTable
                headers={tableHeadings}
                data={bookingList}
                renderRow={renderRow}
                renderMobileCard={renderMobileCard}
                showPagination={false}
                className="p-0! border-none shadow-none"
            />
            </DashboardGridItem>
     
        </div>
    );
}
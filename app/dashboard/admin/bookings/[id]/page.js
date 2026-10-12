import Link from "next/link";
import { CalendarCheck, Plus, XCircle, Timer } from "lucide-react";
import { cookies } from "next/headers";
import { getAdminBooking, getPropertyById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { formatCurrency } from "@/app/_lib/utils";
import BookingOptionsMenu from "@/app/_components/BookingOptionsMenu";
import { FaRegCalendarCheck } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

const fmt = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
};

const tableHeadings = [
    { heading: "Property" },
    { heading: "Tenant / Buyer" },
    { heading: "Date" },
    { heading: "Status", center: true },
    { heading: "Amount", right: true },
    { heading: "" },
];

export default async function BookingsPage({ params }) {
    // propertyId comes straight from the URL
    const { id: propertyId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Fetch the property and its bookings in parallel
    const [property, rawBookings] = await Promise.all([
        getPropertyById(propertyId).catch(() => null),
        getAdminBooking(propertyId, token).catch(() => []),
    ]);

    const propertyName =
        property?.name ||
        property?.property_name ||
        property?.title ||
        "Property";

    const bookings = Array.isArray(rawBookings) ? rawBookings : [];

    const normalise = (s) => (s || "").toLowerCase();

    const counts = {
        total: bookings.length,
        confirmed: bookings.filter((b) =>
            ["confirmed", "rented", "active"].includes(
                normalise(b.payment_status || b.status)
            )
        ).length,
        pending: bookings.filter((b) =>
            ["pending"].includes(normalise(b.payment_status || b.status))
        ).length,
        cancelled: bookings.filter((b) =>
            ["cancelled", "canceled", "rejected"].includes(
                normalise(b.payment_status || b.status)
            )
        ).length,
        available: bookings.filter((b) =>
            ["available"].includes(normalise(b.payment_status || b.status))
        ).length,
    };

    const summaryCards = [
        {
            label: "Total",
            value: counts.total,
            icon: <FaRegCalendarCheck className="text-blue-500" size={20} />,
            color: "bg-blue-50",
        },
        {
            label: "Confirmed",
            value: counts.confirmed,
            icon: <FaCheckCircle className="text-green-500" size={20} />,
            color: "bg-green-50",
        },
        {
            label: "Pending",
            value: counts.pending,
            icon: <Timer className="text-orange-500" size={20} />,
            color: "bg-orange-50",
        },
        {
            label: "Cancelled",
            value: counts.cancelled,
            icon: <XCircle className="text-red-400" size={20} />,
            color: "bg-red-50",
        },
    ];

    const renderRow = (booking) => {
        const status = booking.payment_status || booking.status || "N/A";
        const amount = booking.amount || booking.property?.property_price;
        const date = booking.createdAt || booking.start_date;

        return (
            <tr
                key={booking.id || booking._id}
                className="border-b border-gray-100 text-sm last:border-0 transition-colors hover:bg-gray-50/60"
            >
                <td className="p-4 font-semibold text-gray-900">
                    {booking.property?.property_name || booking.property?.name || propertyName}
                </td>
                <td className="p-4 text-gray-700">
                    {booking.user?.firstname
                        ? `${booking.user.firstname} ${booking.user.lastname || ""}`.trim()
                        : booking.user?.name || "—"}
                </td>
                <td className="p-4 text-gray-600">{fmt(date)}</td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={status} />
                    </div>
                </td>
                <td className="p-4 text-right font-bold text-primary">
                    {amount ? formatCurrency(amount) : "—"}
                </td>
                <td className="p-4 text-center">
                    <BookingOptionsMenu id={booking.id || booking._id} />
                </td>
            </tr>
        );
    };

    const renderMobileCard = (booking) => {
        const status = booking.payment_status || booking.status || "N/A";
        const amount = booking.amount || booking.property?.property_price;
        const date = booking.createdAt || booking.start_date;
        const bookingPropertyName =
            booking.property?.property_name || booking.property?.name || propertyName;
        const tenantName = booking.user?.firstname
            ? `${booking.user.firstname} ${booking.user.lastname || ""}`.trim()
            : booking.user?.name || "—";

        return (
            <article
                key={booking.id || booking._id}
                className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-gray-900">
                            {bookingPropertyName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{tenantName}</p>
                    </div>
                    <StatusChips status={status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div>
                        <dt className="text-xs text-gray-500">Date</dt>
                        <dd className="mt-1 text-gray-800">{fmt(date)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Amount</dt>
                        <dd className="mt-1 font-bold text-primary">
                            {amount ? formatCurrency(amount) : "—"}
                        </dd>
                    </div>
                </dl>

                <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                    <BookingOptionsMenu id={booking.id || booking._id} />
                </div>
            </article>
        );
    };

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-[28px] font-bold text-primary lg:text-4xl">
                        Bookings
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Bookings for {propertyName}.
                    </p>
                </div>
                <Link
                    href={`/dashboard/user/my-properties/${propertyId}/bookings/create`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New booking</span>
                </Link>
            </div>

            {/* Summary */}
            <SummaryCards cards={summaryCards} title="Bookings Summary" />

            {/* Table */}
            <DashboardGridItem title="All Bookings">
                {bookings.length === 0 ? (
                    <EmptyState
                        icon={CalendarCheck}
                        title="No bookings"
                        message="No bookings have been made for this property yet."
                    />
                ) : (
                    <DataTable
                        headers={tableHeadings}
                        data={bookings}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No bookings found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
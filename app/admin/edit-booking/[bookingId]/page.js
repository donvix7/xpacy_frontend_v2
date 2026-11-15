import AdminHeader from "@/app/_components/AdminHeader";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import EditBookingForm from "@/app/_components/EditBookingForm";

export default async function EditBookingPage({ params }) {
    const { bookingId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const allBookings = await getAdminBooking(token);
    const booking = allBookings?.find(b => String(b.id || b._id) === String(bookingId));

    if (!booking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
                <BackBtn />
                <p className="text-2xl font-bold mt-4 text-gray-800">Booking Not Found</p>
                <p className="text-gray-500 mt-2 text-center max-w-md">The booking you are trying to edit does not exist.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            {/* Header Navigation */}
            <AdminHeader title="Edit Booking" backHref={`/admin/booking-details/${bookingId}`} />

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:px-6 md:px-8">
                <EditBookingForm booking={booking} />
            </main>
        </div>
    );
}

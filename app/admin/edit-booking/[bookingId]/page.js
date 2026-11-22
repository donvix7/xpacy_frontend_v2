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
            <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
                <AdminHeader title="Edit Booking" backHref="/dashboard/admin/bookings" />
                <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 sm:px-6 flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl font-bold text-ink">Booking Not Found</h1>
                    <p className="font-mono text-sm text-mute max-w-md">
                        The booking you are trying to edit does not exist.
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Edit Booking" backHref={`/admin/booking-details/${bookingId}`} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <EditBookingForm booking={booking} />
            </main>
        </div>
    );
}

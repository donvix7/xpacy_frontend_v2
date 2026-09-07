import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
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
                <h1 className="text-2xl font-bold mt-4 text-gray-800">Booking Not Found</h1>
                <p className="text-gray-500 mt-2 text-center max-w-md">The booking you are trying to edit does not exist.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-8 min-h-screen bg-neutrals-50">
            {/* Header Navigation */}
            <nav className="flex items-center justify-between px-[7%] py-6 bg-white border-b border-primary-100 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-8">
                    <BackBtn />
                    <div className="h-8 w-px bg-primary-100"></div>
                    <h2 className="text-xl font-bold text-primary">Edit Booking</h2>
                </div>
                <Logo />
            </nav>

            <main className="flex-1 px-[7%] py-8">
                <EditBookingForm booking={booking} />
            </main>
        </div>
    );
}

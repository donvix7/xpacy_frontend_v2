import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getPropertyOwnerBookings } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminBookingList from "@/app/_components/AdminBookingList";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const bookingsData = await getPropertyOwnerBookings(token);
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];

    return (
        <div className="space-y-8 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Bookings</h1>
            
            <PaymentsOverviewWrapper bookings={bookings} showFilters={false} />

            <DashboardGridItem title={"All Bookings"}>
                    <AdminBookingList bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}

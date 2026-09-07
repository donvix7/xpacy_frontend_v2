import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminBookingList from "@/app/_components/AdminBookingList";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const bookings = await getAdminBooking(token) || [];

    return (
        <div className="p-6 flex flex-col gap-6">
                <PaymentsOverviewWrapper bookings={bookings} showFilters={true} />

            <DashboardGridItem title={"Bookings & Calendar"}>
                    <AdminBookingList token={token} bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}
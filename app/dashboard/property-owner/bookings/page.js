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
        <div className="p-6 flex flex-col gap-4">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Bookings</h1>
            
             <DashboardGridItem title={"Bookings Overview"}>
                <PaymentsOverviewWrapper bookings={bookings} showFilters={false} />
            </DashboardGridItem>

            <DashboardGridItem title={"All Bookings"}>
                    <AdminBookingList token={token} bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}

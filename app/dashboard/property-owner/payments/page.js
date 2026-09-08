import { getPropertyOwnerBookings } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import PaymentsTableList from "@/app/_components/PaymentsTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    const bookingsData = await getPropertyOwnerBookings(token);

    // Bookings for my properties
    const myBookings = Array.isArray(bookingsData) ? bookingsData : [];

    return (
        <div className="space-y-8 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Payments</h1>
            <PaymentsOverviewWrapper bookings={myBookings} />
            <DashboardGridItem title={"All Payments"}>
                <PaymentsTableList bookings={myBookings} />
            </DashboardGridItem>
        </div>
    )
}
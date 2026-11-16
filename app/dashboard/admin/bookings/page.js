import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminBookingList from "@/app/_components/AdminBookingList";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const results = await Promise.allSettled([getAdminBooking(token)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const bookingsData = results[0].status === "fulfilled" ? results[0].value : [];
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];

    return (
        <div className="space-y-6">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <p className="text-[22px] font-semibold capitalize tracking-[-0.4px] text-ink lg:text-[26px]">
                Bookings
            </p>
            
            <PaymentsOverviewWrapper bookings={bookings} showFilters={true} />

            <DashboardGridItem title="All Bookings">
                <AdminBookingList token={token} bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}


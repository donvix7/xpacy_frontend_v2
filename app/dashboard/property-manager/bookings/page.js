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
    const bookings = results[0].status === "fulfilled" ? results[0].value || [] : [];

    return (
        <div className="p-2 flex flex-col gap-6">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
                <PaymentsOverviewWrapper bookings={bookings} showFilters={true} />

            <DashboardGridItem title={"Bookings & Calendar"}>
                    <AdminBookingList token={token} bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}
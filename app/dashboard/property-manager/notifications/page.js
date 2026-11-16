import AdminNotificationList from "@/app/_components/AdminNotificationList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminNotificationsSummary from "@/app/_components/AdminNotificationsSummary";
import { getUserNotifications } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const results = await Promise.allSettled([getUserNotifications(token)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const notifications = results[0].status === "fulfilled" ? results[0].value || [] : [];

    return (
        <div className="p-2 flex flex-col gap-8">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Notifications</p>
            <DashboardGridItem title={"Notifications Overview"}>
            <AdminNotificationsSummary notifications={notifications} />

            </DashboardGridItem>

            <DashboardGridItem title={"All Notifications"}>
                <AdminNotificationList notifications={notifications} />
            </DashboardGridItem>
        </div>
    );
}

import AdminNotificationList from "@/app/_components/AdminNotificationList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminNotificationsSummary from "@/app/_components/AdminNotificationsSummary";
import { getUserNotifications } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const notifications = await getUserNotifications(token);

    return (
        <div className="p-6 flex flex-col gap-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Notifications</h1>
            <DashboardGridItem >
                <AdminNotificationsSummary notifications={notifications} />
            </DashboardGridItem>

            <DashboardGridItem title={"All Notifications"}>
                <AdminNotificationList notifications={notifications} />
            </DashboardGridItem>
        </div>
    );
}

import DashboardGridItem from "@/app/_components/DashboardGridItems";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import AdminNotificationList from "@/app/_components/AdminNotificationList";
import { getPropertyOwnerNotifications } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const notificationsData = await getPropertyOwnerNotifications(token);
    const notifications = Array.isArray(notificationsData) ? notificationsData : [];

    return (
        <div className="space-y-8 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Notifications</h1>
            <DashboardGridItem title="Notifications Summary">
                <NotificationsSummary notifications={notifications} />
            </DashboardGridItem>

            <DashboardGridItem title={"All Notifications"}>
                <AdminNotificationList notifications={notifications} />
            </DashboardGridItem>
        </div>
    );
}
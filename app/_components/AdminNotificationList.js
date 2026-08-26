import { cookies } from "next/headers";
import NotificationItem from "./NotificationItem";
import { getUserNotifications } from "../_lib/data-services";
import EmptyState from "./EmptyState";

export default async function AdminNotificationList({ notifications: initialNotifications }){
        let notifications = initialNotifications;
        if (!notifications) {
            const cookieStore = await cookies();
            const token = cookieStore.get("token");
            notifications = await getUserNotifications(token)
        }
    return(
        <ul className="flex flex-col gap-6 ">
            {
                notifications?.length > 0 ? (
                    notifications?.map((notification) => <NotificationItem notification={notification} key={notification?.id}/>)
                ) : (
                    <div>
                        <EmptyState message="No Notifications Yet"/>
                    </div>
                )
            }
            
        </ul>
    )
}
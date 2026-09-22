
import { cookies } from "next/headers";
import NotificationItem from "./NotificationItem";
import { getUserNotifications } from "../_lib/data-services";
import EmptyState from "./EmptyState";

export default async function NotificationList(){
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        const notifications = await getUserNotifications(token)
        if(!notifications || notifications.length <= 0) return <EmptyState message={"Oops!... You do not have any notification yet."}/>
        return(
            <ul className="flex flex-col gap-6 ">
                {notifications?.toSpliced(3).map((notification) => <NotificationItem notification={notification} key={notification?.id}/>)}
            </ul>
        )
}
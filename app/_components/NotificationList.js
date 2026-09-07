
import { cookies } from "next/headers";
import NotificationItem from "./NotificationItem";
import { getUserNotifications } from "../_lib/data-services";

export default async function NotificationList(){
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        const notifications = await getUserNotifications(token)
    return(
        <ul className="flex flex-col gap-6 ">
            {notifications?.toSpliced(3).map((notification) => <NotificationItem notification={notification} key={notification?.id}/>)}
        </ul>
    )
}
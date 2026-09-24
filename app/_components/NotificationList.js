
import NotificationItem from "./NotificationItem";
import EmptyState from "./EmptyState";

export default async function NotificationList({notifications}){
      
        if(!notifications || notifications.length <= 0) return <EmptyState message={"Oops!... You do not have any notification yet."}/>
        return(
            <ul className="flex flex-col gap-6 ">
                {notifications?.toSpliced(3).map((notification) => <NotificationItem notification={notification} key={notification?.id}/>)}
            </ul>
        )
}
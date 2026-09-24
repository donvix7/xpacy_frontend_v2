import { getUserNotifications } from "@/app/_lib/data-services";
import CustomCheckbox from "@/app/_components/CustomCheckbox";
import DashboardFilter from "@/app/_components/DashboardFilter";
import SortBy from "@/app/_components/SortBy";
import MobileDashboardHeader  from '@/app/_components/MobileDashboardHeader';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import MobileSortbyMenu from "@/app/_components/MobileSortbyMenu";
import MobileNotificationItem from "@/app/_components/MobileNotificationItem";
import NotificationList from "@/app/_components/NotificationList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminNotificationsSummary from "@/app/_components/AdminNotificationsSummary";
import { markAllAsRead } from "@/app/_lib/action";
export default async function Page() {
            const notifications = await getUserNotifications();
            console.log(notifications)
           

    return (
        <div className="p-2 flex flex-col gap-4">
            <MobileDashboardHeader showMenu={false}/>
             <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Notifications</h1>
            <DashboardGridItem title="Summary">
            <AdminNotificationsSummary notifications={notifications} />
            </DashboardGridItem>
            {/* Large screen only */}
            <div className="px-4 w-full  lg:flex gap-4 hidden items-center justify-end font-mono">
                {/* Mark as read */}
                <CustomCheckbox onCheck={markAllAsRead} label={"Mark as read "} />
                {/*Show only unread */}
                <CustomCheckbox label={"Show only unread"} />
                <div className=" relative flex items-center gap-2 ">
                    <SortBy>
                        <option>Default</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                    </SortBy>
                    <DashboardFilter />
                </div>
            </div>
            {/* small screen only */}
            <div className="flex lg:hidden items-center justify-between font-mono">
                {/* Mark as read */}
                <button className="flex items-center gap-2 font-mono text-secondary font-bold">
                    <span className="text-2xl"><IoCheckmarkDoneSharp/></span>
                    <span>Mark as read</span>
                </button>
                <div className="flex items-center gap-2 relative">
                <MobileSortbyMenu/>
                 <DashboardFilter />
                </div>
            </div>
            {/* Notification Table for large screens only*/}
                <DashboardGridItem title={"Notifications"} >
                    <NotificationList notifications={notifications}/>
                </DashboardGridItem>
            {/* Notification List For small screens only */}
            {notifications?.map((notification, i) => <MobileNotificationItem notification={notification} key={i} />)}
            {/* Clear all button */}
            <div className="flex justify-end font-mono">
                <button className="p-4 font-bold cursor-pointer text-base underline text-primary">Clear All Notificaitons</button>
            </div>
        </div>
    )
}


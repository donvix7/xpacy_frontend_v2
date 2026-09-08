import { cookies } from "next/headers";
import { getUserNotifications } from "@/app/_lib/data-services";
import CustomCheckbox from "@/app/_components/CustomCheckbox";
import DashboardFilter from "@/app/_components/DashboardFilter";
import EmptyState from "@/app/_components/EmptyState";
import NotificationTableItem from "@/app/_components/NotificationTableItem";
import SortBy from "@/app/_components/SortBy";
import MobileDashboardHeader  from '@/app/_components/MobileDashboardHeader';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import MobileSortbyMenu from "@/app/_components/MobileSortbyMenu";
import MobileNotificationItem from "@/app/_components/MobileNotificationItem";
export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const notifications = await getUserNotifications(token);
    console.log(notifications)
    if (notifications.length <= 0) return <div className="grid place-content-center"><EmptyState message={"Opps... No notification available"} /></div>
    return (
        <div className="p-2 flex flex-col gap-4">
            <MobileDashboardHeader showMenu={false}/>
            {/* Large screen only */}
            <div className="px-[38px] lg:flex hidden items-center justify-between font-mono">
                {/* Mark as read */}
                <CustomCheckbox label={"Mark as read "} />
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
            <table className="hidden lg:table table-auto font-mono">
                {/* Title */}
                <thead>
                    <tr className="font-bold border border-gray-300">
                        <td className="p-4">Mark as read</td>
                        <td className="p-4">Type</td>
                        <td className="p-4">Message</td>
                        <td className="p-4">Date</td>
                        <td className="p-4">Time</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notification, i) => <NotificationTableItem notification={notification} key={i}/>)}
                </tbody>
            </table>
            {/* Notification List For small screens only */}
            {notifications?.map((notification, i) => <MobileNotificationItem notification={notification} key={i} />)}
            {/* Clear all button */}
            <div className="flex justify-end font-mono">
                <button className="p-4 font-bold cursor-pointer text-base underline text-primary">Clear All Notificaitons</button>
            </div>
        </div>
    )
}


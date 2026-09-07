import { BsBuildings } from "react-icons/bs";
import { formatDistanceToNow, format } from "date-fns";
import { GiReceiveMoney } from "react-icons/gi";
import { IoCalendarOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function MobileNotificationItem ({notification}) {
    return (
        <div className="grid lg:hidden grid-cols-[38px_1fr] grid-rows-[28px_1fr_1fr] p-4 border border-primary-100 bg-white rounded-lg text-sm font-mono gap-2">
                {notification?.notification_type === "Properties" && <span className="row-span-full text-base w-6 h-6 text-primary bg-secondary-100 rounded-full flex items-center justify-center"><BsBuildings /></span>}
                {notification?.notification_type === "Payments" && <span className="row-span-full text-base w-6 h-6 text-primary bg-[#C3E5C4] rounded-full flex items-center justify-center"><GiReceiveMoney /></span>}
                {notification?.notification_type === "Service Request" && <span className="row-span-full text-base w-6 h-6 text-primary bg-primary-100 rounded-full flex items-center justify-center"><IoCalendarOutline /></span>}
                <span className="place-content-center">{notification?.notification_type}</span>
                <span>{notification?.message}</span>
                <span className="text-neutral-600">{formatDistanceToNow(notification?.date)} ago at {format(notification?.date, 'hh:mm a')}</span>
            </div>
    )
}
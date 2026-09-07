import { formatDistanceToNow } from "date-fns";
import { FaHeart } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { IoCardOutline } from "react-icons/io5";

export default function NotificationItem({ notification }) {

    return (
        <li className="grid grid-cols-[24px_1fr] gap-x-5 gap-y-4 p-4 border border-primary-100 bg-white rounded-lg">
            {notification?.notification_type === "Properties" && <span className="row-[1/-3] place-content-center text-2xl text-primary"><FaHeart /></span>}
            {notification?.notification_type === "Payment" && <span className="row-[1/-3] place-content-center text-2xl text-primary"><IoCardOutline /></span>}
            {notification?.notification_type === "Service Request" && <span className="row-[1/-3] place-content-center text-2xl text-primary"><IoCalendarOutline /></span>}

            <p className="flex items-center justify-between ">
                <span className="text-sm text-black font-mono">{notification?.notification_type}</span>
                <span className="text-xs text-primary-700 font-mono">{formatDistanceToNow(notification?.date, { addSuffix: true })}</span>
            </p>
            <p className="text-xs text-gray-800 font-mono col-[2/3]">{notification?.message}</p>
        </li>
    )
}
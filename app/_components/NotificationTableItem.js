import { formatDistanceToNow, format } from "date-fns";
import { BsBuildings } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { IoCalendarOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import CustomCheckbox from "./CustomCheckbox";


export default function NotificationTableItem({notification}) {

    return (
        <tr className=" border-b border-r border-l border-gray-300">
            <td className="p-4"><CustomCheckbox /></td>
            <td className="p-4 ">
                <div className="flex items-center space-x-1.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 ">
                        {notification?.notification_type === "Properties" && <span className="text-base w-6 h-6 text-primary bg-secondary-100 rounded-full flex items-center justify-center"><BsBuildings /></span>}
                        {notification?.notification_type === "Payment" && <span className="text-base w-6 h-6 text-primary bg-[#C3E5C4] rounded-full flex items-center justify-center "><GiReceiveMoney /></span>}
                        {notification?.notification_type === "Service Request" && <span className="text-base w-6 h-6 text-primary bg-primary-100 rounded-full flex items-center justify-center "><IoCalendarOutline /></span>}
                    </div>
                    <span>{notification?.notification_type}</span>
                </div>
            </td>
            <td className="p-4">{notification?.message}</td>
            <td className="px-4">{formatDistanceToNow(notification?.date)}</td>
            <td className="px-4">{format(notification?.date, 'hh:mm a')}</td>
            <td className="px-4">
                <span className="text-2xl"><RiDeleteBin6Line /></span>
            </td>
        </tr>
    )
}
import { FaUserTie, FaUserShield, FaUserCheck, FaUserSlash } from "react-icons/fa";
import { RiUserUnfollowLine } from "react-icons/ri";
import { BiUser } from "react-icons/bi";
import { User2, Users, Users2Icon } from "lucide-react";
import SummaryItemCard from "./SummaryItemCard";

export default function UsersSummary({
    totalUsers = 0,
    activeUsers = 0,
    inactiveUsers = 0,
    verifiedUsers = 0,
    unverifiedUsers = 0,
    regularUsers = 0,
    propertyOwners = 0,
    admins = 0,
}) {

    const items = [
        {
            title: "Tenants",
            count: regularUsers,
            icon: <FaUserCheck className="text-green-500" size={20} />,
            color: "bg-green-50 border-green-100",
             textColor: "text-green-900"
        },
        {
            title: "Property Owners",
            count: propertyOwners,
            icon: <FaUserTie className="text-purple-500" size={20} />,
            color: "bg-purple-50 border-purple-100",
             textColor: "text-purple-900"
        },
        {
            title: "Admins",
            count: admins,
            icon: <FaUserShield className="text-orange-500" size={20} />,
            color: "bg-orange-50 border-orange-100",
             textColor: "text-orange-900"
        },
        {
            title: "Inactive Users",
            count: inactiveUsers,
            icon: <FaUserSlash className="text-red-500" size={20} />,
            color: "bg-red-50 border-red-100",
             textColor: "text-red-900"
        },
        {
            title: "Unverified Users",
            count: unverifiedUsers,
            icon: <RiUserUnfollowLine className="text-yellow-600" size={20} />,
            color: "bg-yellow-50 border-yellow-100",
             textColor: "text-yellow-900"
        }
    ];

    return (
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
                <p className="text-lg font-semibold text-ink">User Statistics</p>
            </div>

            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-mute">Total Users</span>
                <p className="text-[42px] font-semibold leading-none tracking-[-1.5px] text-ink tabular-nums sm:text-[52px]">{totalUsers}</p>
                <span className="text-[13.5px] text-mute">Everyone registered on the platform</span>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {items.map((item, index) => (
                    <SummaryItemCard key={index} label={item.title} value={item.count} icon={item.icon} iconBackground={item.color} />
                ))}
            </div>
        </div>
    );
}

import { FaUsers, FaUserTie, FaUserShield, FaUserCheck, FaUserSlash } from "react-icons/fa";
import { RiUserUnfollowLine } from "react-icons/ri";
import { BiUser } from "react-icons/bi";
import { User2, Users, Users2Icon } from "lucide-react";

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
        <div className="p-6 flex flex-col gap-8 border border-primary-200 rounded-lg bg-white">
            {/* ... Existing Users Summary ... */}
            <div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-gray-800">User Statistics</h3>
                </div>

                <div className="flex flex-col gap-4">
                     {/* Main Hero Card */}
                     <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white mb-4">
                        <div className="flex gap-2 items-center lg:w-[256px] w-full" >
                            <span className="w-12 h-12 text-primary-300 bg-yellow-200 rounded-full flex items-center justify-center text-2xl "><FaUsers /></span>
                            <span className="font-mono text-primary-900 uppercase">Total Users</span>
                        </div>
                        <p className="text-center font-bold text-2xl font-mono w-[256px]">{totalUsers}</p>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[7%] -right-[70%] lg:-top-1 -top-10 bg-primary-700 z-10"></div>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[4%] -right-[65%] top-2 bg-[#73A0BE]"></div>
                    </div>

                    {/* Grid Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col items-center justify-center p-6 rounded-lg  bg-white border border-primary-200 w-full relative overflow-hidden group">
                               <p className="font-mono text-primary-700 text-base text-center mb-1">{item.title}</p>
                               <p className="text-center font-bold text-lg font-mono text-gray-800">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

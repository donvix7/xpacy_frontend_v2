import { Timer, Users } from "lucide-react";
import { BiBuildings } from "react-icons/bi";
import { FaTools, FaClock, FaSpinner, FaCheckCircle, FaUserEdit } from "react-icons/fa";
import { FaBuildingUser, FaUserGear, FaUsersGear } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function ServicesSummary({ services, serviceProviders, showHeading = true }) {
    // Calculate counts
    const counts = {
        total: services.length,
        pending: services.filter(s => s.service_status?.toLowerCase() === 'pending').length,
        inProgress: services.filter(s => s.service_status?.toLowerCase() === 'in-progress').length,
        completed: services.filter(s => s.service_status?.toLowerCase() === 'completed').length,
        cancelled: services.filter(s => s.service_status?.toLowerCase() === 'cancelled').length,
    };

    const summaryItems = [
        {
            title: "Completed",
            count: counts.completed,
            icon: <FaCheckCircle className="text-green-500" size={24} />,
            color: "text-green-500",
            bgColor: "bg-green-50"
        },
        {
            title: "In Progress",
            count: counts.inProgress,
            icon: <FaSpinner className="text-orange-500" size={24} />,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50"
        },
        {
            title: "Pending",
            count: counts.pending,
            icon: <Timer className="text-yellow-500" size={24} />,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50"
        },
        {
            title: "Cancelled",
            count: counts.cancelled,
            icon: <IoCloseCircleOutline className="text-red-500" size={24} />,
            color: "text-red-500",
            bgColor: "bg-red-50"
        },
        {
            title: "Service Providers",
            count: serviceProviders.length,
            icon: <Users className="text-primary" size={24} />,
            color: "text-primary",
            bgColor: "bg-primary-100/80"
        },
    ];

    return (
        <div className="flex flex-col gap-4 bg-white">
            <div className="flex flex-col gap-4">
                {/* Main Hero Card */}
                <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white min-w-[250px] justify-center">
                    <div className="relative z-20 flex flex-col lg:items-start items-center lg:w-max">
                        <div className="flex gap-3 items-center">
                            <span className="w-12 h-12 text-primary bg-primary-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-sm">
                                <BiBuildings />
                            </span>
                            <span className="font-mono text-primary-900 font-bold uppercase tracking-wide text-sm">Service Requests</span>
                        </div>
                        <p className="text-center lg:text-left font-bold text-4xl font-mono mt-4 lg:ml-[60px] text-gray-800">{counts.total}</p>
                    </div>

                    {/* Decorative Background Circles */}
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[10%] -right-[70%] lg:-top-4 -top-10 bg-primary-700 z-10 opacity-90 transition-transform duration-700 hover:scale-105"></div>
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[2%] -right-[65%] top-6 bg-[#73A0BE] z-0 opacity-70 transition-transform duration-700 hover:-translate-x-2"></div>
                </div>

                {/* Grid Items - FIXED */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
                    {summaryItems.map((item, index) => (
                        <div 
                            key={index} 
                            className="bg-white rounded-xl border border-primary-200 p-6 duration-300 flex justify-between"
                        >
                            <div className="flex flex-col gap-2">
                                <p className="text-gray-600 text-sm capitalize">{item.title}</p>
                                <p className="text-2xl font-bold mt-1">{item.count}</p>
                            </div>
                            {item.icon && (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${item.bgColor}`}>
                                    {item.icon}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
import { Timer, Users } from "lucide-react";
import { FaTools, FaClock, FaSpinner, FaCheckCircle, FaUserEdit } from "react-icons/fa";
import { FaBuildingUser, FaUserGear, FaUsersGear } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";
import SummaryItemCard from "./SummaryItemCard";

const getServiceStatus = (service) => String(service?.service_status || service?.status || "").toLowerCase();

export default function ServicesSummary({ services = [], serviceProviders = [], showHeading = true }) {
    const serviceList = Array.isArray(services) ? services.filter(Boolean) : [];
    const providers = Array.isArray(serviceProviders) ? serviceProviders.filter(Boolean) : [];

    // Calculate counts
    const counts = {
        total: serviceList.length,
        pending: serviceList.filter(s => getServiceStatus(s) === 'pending').length,
        inProgress: serviceList.filter(s => getServiceStatus(s) === 'in-progress').length,
        completed: serviceList.filter(s => getServiceStatus(s) === 'completed').length,
        cancelled: serviceList.filter(s => getServiceStatus(s) === 'cancelled').length,
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
            count: providers.length,
            icon: <Users className="text-primary" size={24} />,
            color: "text-primary",
            bgColor: "bg-primary-100/80"
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-mute">Service Requests</span>
                <p className="text-[42px] font-semibold leading-none tracking-[-1.5px] text-ink tabular-nums sm:text-[52px]">
                    {counts.total}
                </p>
                <span className="text-[13.5px] text-mute">Requests raised across your portfolio</span>
            </div>

            {/* Grid Items - FIXED */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
                {summaryItems.map((item, index) => (
                    <SummaryItemCard key={index} label={item.title} value={item.count} icon={item.icon} iconBackground={item.bgColor} />
                ))}
            </div>
        </div>
    );
}

import { cookies } from "next/headers";
import { getAdminProperties, getAdminServices, getPropertyOwner, getAllAdmin, getAdminBooking } from "../_lib/data-services";
import { FaHome, FaUsers, FaCalendarCheck } from "react-icons/fa";
import { BiBuildings, BiCalendarStar } from "react-icons/bi";
import { RiAdminLine } from "react-icons/ri";
import { MdOutlineHomeRepairService } from "react-icons/md";
import { FaBuildingUser } from "react-icons/fa6";
import SummaryItemCard from "./SummaryItemCard";
const AdminOverview = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    const [
        propertiesResponse, 
        services, 
        propertyOwners, 
        admins,
        bookings
    ] = await Promise.all([
        getAdminProperties(token),
        getAdminServices(token),
        getPropertyOwner(token),
        getAllAdmin(token),
        getAdminBooking(token)
    ]);

    const overview = [
        { 
            title: "Properties Managed", 
            count: propertiesResponse?.pagination?.total || 0, 
            icon: <FaHome className="text-green-500" size={24} />,
            color: "bg-green-50",
            bgColor: "bg-green-100"
        },
        { 
            title: "Pending Services", 
            count: services?.length || 0, 
            icon: <FaCalendarCheck className="text-purple-500" size={24} />,
            color: "bg-purple-50",
            bgColor: "bg-purple-100"
        },
        { 
            title: "Owners Managed", 
            count: propertyOwners?.length || 0, 
            icon: <FaUsers className="text-blue-500" size={24} />,
            color: "bg-blue-50",
            bgColor: "bg-blue-100"
        },
        { 
            title: "Total Bookings", 
            count: bookings?.length || 0, 
            icon: <BiCalendarStar className="text-pink-500" size={24} />,
            color: "bg-pink-50",
            bgColor: "bg-pink-100"
        },
        { 
            title: "Admins", 
            count: admins?.length || 0, 
            icon: <BiBuildings className="text-orange-500" size={24} />, // Changed from FaUsers to BiBuildings
            color: "bg-orange-50",
            bgColor: "bg-orange-100"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {overview.map((item, index) => (
                <SummaryItemCard key={index} label={item.title} value={item.count} icon={item.icon} iconBackground={item.color} />
            ))}
        </div>
    );
};

export default AdminOverview;

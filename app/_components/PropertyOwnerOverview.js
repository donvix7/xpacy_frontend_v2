import { cookies } from "next/headers";
import { getProperties, getBookedServices, getSavedProperties, getUserProfile, getBookingList } from "@/app/_lib/data-services";
import { FaHome, FaCalendarCheck, FaRegHeart } from "react-icons/fa";
import PropertyOwnerOverviewTabs from "./PropertyOwnerOverviewTabs";

const PropertyOwnerOverview = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token"); // Fetch data relevant to the property owner
    
    const [
        propertiesData, 
        bookedServices, 
        savedPropertiesData,
        user,
        bookings
    ] = await Promise.all([
        getProperties(), 
        getBookedServices(token),
        getSavedProperties(token),
        getUserProfile(token),
        getBookingList(token)
    ]);

    // Filter properties for this owner
    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : [];
    const myProperties = allProperties.filter(p => p.property_owner_id === user?.id);
    const myPropertyIds = myProperties.map(p => p.id || p._id);

    const propertiesCount = myProperties.length;
    const bookedServicesCount = bookedServices?.length || 0;
    const savedPropertiesCount = savedPropertiesData?.pagination?.total || 0;

    // Filter derived data for Recent Activity
    const myServices = Array.isArray(bookedServices) 
        ? bookedServices.filter(s => myPropertyIds.includes(s.property_id || s.propertyId)).map(s => ({...s, type: 'Service', date: s.createdAt || s.created_at}))
        : [];
    
    const myBookings = Array.isArray(bookings)
        ? bookings.filter(b => myPropertyIds.includes(b.property_id || b.property?._id)).map(b => ({...b, type: 'Booking', date: b.createdAt || b.created_at}))
        : [];

    // Combine and sort by date descending
    const recentActivity = [...myServices, ...myBookings]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const overviewItems = [
        { 
            title: "Properties Listed", 
            count: propertiesCount, 
            change: "Active",
            icon: <FaHome className="text-gray-500" size={24} />,
            color: "bg-gray-100",
            bgColor: "bg-gray-100"
        },
        { 
            title: "Booked Services", 
            count: bookedServicesCount, 
            change: "Total",
            icon: <FaCalendarCheck className="text-gray-500" size={24} />,
            color: "bg-gray-100",
            bgColor: "bg-gray-100"
        },
        { 
            title: "Saved Properties", 
            count: savedPropertiesCount, 
            change: "Favorites",
            icon: <FaRegHeart className="text-gray-500" size={24} />,
            color: "bg-gray-100",
            bgColor: "bg-gray-100"
        }
    ];

    return (
        <PropertyOwnerOverviewTabs 
            overviewItems={overviewItems} 
            recentActivity={recentActivity} 
        />
    );
};

export default PropertyOwnerOverview;
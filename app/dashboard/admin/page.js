import { cookies } from "next/headers";
import { getAdminProperties, getAdminServices, getPropertyOwner, getAllAdmin, getAllUsers, getAdminBooking, getInvoices, getUserNotifications, getAdminProfile } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import AdminPropertyList from "@/app/_components/AdminPropertyList";
import AdminServiceList from "@/app/_components/AdminServiceList";
import AdminBookingList from "@/app/_components/AdminBookingList";
import AdminNotificationList from "@/app/_components/AdminNotificationList";
import { TbBuildingSkyscraper } from "react-icons/tb";
import { Currency, UsersIcon } from "lucide-react";
import { HomeModernIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { FaCalendarCheck, FaMoneyBillWave, FaUsers, FaUserTie } from "react-icons/fa6";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getAdminProfile(token),
        getAdminProperties(token),
        getAdminServices(token),
        getPropertyOwner(token),
        getAllAdmin(token),
        getAllUsers(token),
        getAdminBooking(token),
        getInvoices(token),
        getUserNotifications(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : { properties: [], pagination: {} };
    const services = results[2].status === "fulfilled" ? results[2].value : [];
    const propertyOwners = results[3].status === "fulfilled" ? results[3].value : [];
    const admins = results[4].status === "fulfilled" ? results[4].value : [];
    const users = results[5].status === "fulfilled" ? results[5].value : [];
    const bookings = results[6].status === "fulfilled" ? results[6].value : [];
    const invoices = results[7].status === "fulfilled" ? results[7].value : [];
    const notifications = results[8].status === "fulfilled" ? results[8].value : [];

    const properties = propertiesData?.properties || [];
    const totalProperties = propertiesData?.pagination?.total || properties.length;
    const allUsers = Array.isArray(users) ? users : [];
    const allBookings = Array.isArray(bookings) ? bookings : [];
    const allInvoices = Array.isArray(invoices) ? invoices : [];
    const allServices = Array.isArray(services) ? services : [];
    const allOwners = Array.isArray(propertyOwners) ? propertyOwners : [];
    const allAdmins = Array.isArray(admins) ? admins : [];

    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const pendingServices = allServices.filter(s => (s.status || "").toLowerCase() === "pending");

    
const summaryCards = [
    { 
        label: "Total Properties", 
        value: totalProperties, 
        color: "bg-primary-100", 
        icon: <TbBuildingSkyscraper className="w-5 h-5 text-primary-700" /> // Skyscraper represents properties
    },
    { 
        label: "Total Users", 
        value: allUsers.length, 
        color: "bg-amber-100", 
        icon: <FaUsers className="w-5 h-5 text-amber-700" /> // Users represents all users
    },
    { 
        label: "Property Owners", 
        value: allOwners.length, 
        color: "bg-blue-100", 
        icon: <FaUserTie className="w-5 h-5 text-blue-700" /> // User tie represents property owners
    },
    { 
        label: "Total Bookings", 
        value: allBookings.length, 
        color: "bg-slate-100", 
        icon: <FaCalendarCheck className="w-5 h-5 text-slate-700" /> // Calendar check represents bookings
    },
    { 
        label: "Total Revenue", 
        value: `$${totalRevenue.toLocaleString()}`, 
        color: "bg-emerald-100", 
        icon: <FaMoneyBillWave className="w-5 h-5 text-emerald-700" /> // Money represents revenue
    },
];

    const propertyList = properties.slice(0, 10);
    const slicedServices = allServices.slice(0, 10);
    const slicedNotifications = Array.isArray(notifications) ? notifications.slice(0, 10) : [];
    const slicedBookings = allBookings.slice(0, 10);

    return (
        <div className="p-6 space-y-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">
                Welcome {profile?.username?.split(" ")[0] || "Admin"},
            </h1>
            <DashboardGridItem title="Summary" >
            <SummaryCards cards={summaryCards} />
            </DashboardGridItem>

            <div className="flex flex-col gap-12">
                <DashboardGridItem title="Notifications">
                    <AdminNotificationList notifications={slicedNotifications} />
                </DashboardGridItem>

                <DashboardGridItem title="Property List" viewAllLink="/dashboard/admin/properties">
                    <AdminPropertyList
                        properties={propertyList}
                        baseUrl="/dashboard/admin/properties"
                        ctaLink="/admin/add-new-property"
                    />
                </DashboardGridItem>

                <DashboardGridItem title="Services Requests" viewAllLink="/dashboard/admin/services">
                    <AdminServiceList services={slicedServices} />
                </DashboardGridItem>

                <DashboardGridItem title="Recent Bookings" viewAllLink="/dashboard/admin/payments">
                    <AdminBookingList bookings={slicedBookings} />
                </DashboardGridItem>
            </div>
        </div>
    );
}

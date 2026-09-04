import { cookies } from "next/headers";
import { getPropertyOwnerBookings, getPropertyOwnerServices, getPropertyOwnerProfile, getUserNotifications, getPropertyOwnerProperties, getPropertyOwnerInvoices } from "@/app/_lib/data-services";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import { BsStack } from "react-icons/bs";
import { FiAlertCircle, FiClock } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";
import { MdHourglassEmpty } from "react-icons/md";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerServices(token),
        getPropertyOwnerBookings(token),
        getUserNotifications(token),
        getPropertyOwnerInvoices(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const services = results[2].status === "fulfilled" ? results[2].value : [];
    const bookings = results[3].status === "fulfilled" ? results[3].value : [];
    const notifications = results[4].status === "fulfilled" ? results[4].value : [];
    const invoices = results[5].status === "fulfilled" ? results[5].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);
    const myServices = Array.isArray(services) ? services : [];
    const myBookings = Array.isArray(bookings) ? bookings : [];

    const totalWorkOrders = myServices.length;
    const assignedOrders = myServices.filter(s => (s.status || "").toLowerCase() === "assigned");
    const inProgressOrders = myServices.filter(s => (s.status || "").toLowerCase() === "in-progress");
    const completedOrders = myServices.filter(s => (s.status || "").toLowerCase() === "completed");
    const pendingOrders = myServices.filter(s => (s.status || "").toLowerCase() === "pending");
    const awaitingParts = myServices.filter(s => (s.status || "").toLowerCase() === "awaiting-parts");

    
const summaryCards = [
  { 
    label: "Total Work Orders", 
    value: totalWorkOrders, 
    color: "bg-primary-100", 
    icon: <BsStack className="w-5 h-5 text-primary-700"/> // Stack represents multiple items/work orders
  },
  { 
    label: "In Progress", 
    value: inProgressOrders.length, 
    color: "bg-slate-100", 
    icon: <FiClock className="w-5 h-5 text-slate-700"/> // Clock represents ongoing work
  },
  { 
    label: "Completed", 
    value: completedOrders.length, 
    color: "bg-green-100", // Changed to a proper green background for better contrast
    icon: <FaCheck className="w-5 h-5 text-green-700"/> // Checkmark represents completion
  },
  { 
    label: "Awaiting Parts", 
    value: awaitingParts.length, 
    color: "bg-yellow-100", // Changed to proper yellow for better contrast
    icon: <FiAlertCircle className="w-5 h-5 text-yellow-700"/> // Alert/warning icon for waiting status
  },
  { 
    label: "Pending", 
    value: pendingOrders.length, 
    color: "bg-amber-100", 
    icon: <MdHourglassEmpty className="w-5 h-5 text-amber-700"/> // Hourglass represents pending/waiting
  },
];

    return (
        <div className="space-y-8 p-4">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">
                Welcome {profile?.first_name || profile?.firstname || profile?.name || profile?.full_name || "Manager"},
            </h1>
            <SummaryCards cards={summaryCards} title="Overview" />

            <div className="flex flex-col gap-8">
                <DashboardGridItem title="Recent Properties" viewAllLink="/dashboard/facility-manager/properties">
                    <PropertiesOverviewWrapper properties={properties} showFilters={false} />
                </DashboardGridItem>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Recent Services" viewAllLink="/dashboard/facility-manager/services">
                        <ServicesOverviewWrapper services={myServices} showFilters={false} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Recent Bookings" viewAllLink="/dashboard/facility-manager/bookings">
                        <PaymentsOverviewWrapper bookings={myBookings} showFilters={false} />
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Notifications" viewAllLink="/dashboard/facility-manager/notifications">
                        <NotificationsSummary notifications={Array.isArray(notifications) ? notifications : []} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Properties" viewAllLink="/dashboard/facility-manager/properties">
                        <PropertiesTableList properties={properties} recent={true} />
                    </DashboardGridItem>
                </div>
            </div>
        </div>
    );
}

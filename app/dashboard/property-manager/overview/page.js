import { cookies } from "next/headers";
import { getPropertyOwnerBookings, getPropertyOwnerServices, getPropertyOwnerProfile, getUserNotifications, getPropertyOwnerProperties, getPropertyOwnerInvoices } from "@/app/_lib/data-services";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import { FaBuilding, FaFileContract, FaMoneyBillWave, FaWrench } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";

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
    const myInvoices = Array.isArray(invoices) ? invoices : [];

    const occupiedCount = properties.filter(p => (p.availability_status || "").toLowerCase() === "occupied").length;
    const vacancyCount = properties.filter(p => ["vacant", "available", "active"].includes((p.availability_status || "").toLowerCase())).length;

    const activeLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "active" || (b.status || "").toLowerCase() === "confirmed");
    const pendingLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "pending");

    const pendingServices = myServices.filter(s => (s.status || "").toLowerCase() === "pending");
    const inProgressServices = myServices.filter(s => (s.status || "").toLowerCase() === "in-progress");

    const totalCollected = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid").reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  
const summaryCards = [
    { 
        label: "Total Properties", 
        value: properties.length, 
        color: "bg-primary-100", 
        icon: <FaBuilding className="w-5 h-5 text-primary-700" /> 
    },
    { 
        label: "Occupied Units", 
        value: occupiedCount, 
        color: "bg-blue-100", 
        icon: <FiUsers className="w-5 h-5 text-blue-700" /> 
    },
    { 
        label: "Active Leases", 
        value: activeLeases.length, 
        color: "bg-amber-100", 
        icon: <FaFileContract className="w-5 h-5 text-amber-700" /> 
    },
    { 
        label: "Pending Services", 
        value: pendingServices.length, 
        color: "bg-secondary-100", 
        icon: <FaWrench className="w-5 h-5 text-secondary-700" /> 
    },
    { 
        label: "Collected", 
        value: `$${totalCollected.toLocaleString()}`, 
        color: "bg-green-100", 
        icon: <FaMoneyBillWave className="w-5 h-5 text-green-700" /> 
    },
];

    return (
        <div className="space-y-8 p-4">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">
                Welcome {profile?.first_name || profile?.firstname || profile?.name || profile?.full_name || "Manager"},
            </h1>
            <DashboardGridItem title={"Overview"}>
            <SummaryCards cards={summaryCards} />
            </DashboardGridItem>

            <div className="flex flex-col gap-8">
                <DashboardGridItem title="Recent Properties" viewAllLink="/dashboard/property-manager/properties">
                    <PropertiesOverviewWrapper properties={properties} showFilters={false} />
                </DashboardGridItem>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Recent Services" viewAllLink="/dashboard/property-manager/services">
                        <ServicesOverviewWrapper services={myServices} showFilters={false} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Recent Bookings" viewAllLink="/dashboard/property-manager/bookings">
                        <PaymentsOverviewWrapper bookings={myBookings} showFilters={false} />
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Notifications" viewAllLink="/dashboard/property-manager/notifications">
                        <NotificationsSummary notifications={Array.isArray(notifications) ? notifications : []} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Properties" viewAllLink="/dashboard/property-manager/properties">
                        <PropertiesTableList properties={properties} recent={true} />
                    </DashboardGridItem>
                </div>
            </div>
        </div>
    );
}

import { cookies } from "next/headers";
import { getPropertyOwnerBookings, getPropertyOwnerServices, getPropertyOwnerProfile, getUserNotifications, getPropertyOwnerProperties, getPropertyOwnerInvoices } from "@/app/_lib/data-services";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";

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
    const vacantCount = properties.filter(p => ["vacant", "available", "active"].includes((p.availability_status || "").toLowerCase())).length;
    const occupancyRate = properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

    const totalRevenue = myInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const paidInvoices = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid");
    const pendingInvoices = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "pending");
    const collected = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const outstanding = pendingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    const maintenanceServices = myServices.filter(s =>
        ["maintenance", "repair", "plumbing", "electrical", "cleaning", "hvac", "painting", "general"].includes(
            (s.service_type || s.category || "").toLowerCase()
        )
    );
    const maintenanceCost = maintenanceServices.reduce((sum, s) => sum + (parseFloat(s.cost || s.amount) || 0), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayRevenue = myInvoices.filter(inv => (inv.created_at || "").startsWith(today)).reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    const summaryCards = [
        { label: "Total Properties", value: properties.length, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{properties.length}</span> },
        { label: "Occupancy Rate", value: `${occupancyRate}%`, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">{occupancyRate}</span> },
        { label: "Today's Revenue", value: `$${todayRevenue.toLocaleString()}`, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Monthly Revenue", value: `$${collected.toLocaleString()}`, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Outstanding", value: `$${outstanding.toLocaleString()}`, color: "bg-red-100", icon: <span className="text-red-600 text-lg font-bold">$</span> },
    ];

    return (
        <div className="space-y-8 p-4">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">
                Welcome {profile?.first_name || profile?.firstname || profile?.name || profile?.full_name || "Owner"},
            </h1>

            <SummaryCards cards={summaryCards} />

            <div className="flex flex-col gap-8">
                <DashboardGridItem title="Recent Properties" viewAllLink="/dashboard/property-owner/properties">
                    <PropertiesOverviewWrapper properties={properties} showFilters={false} />
                </DashboardGridItem>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Recent Services" viewAllLink="/dashboard/property-owner/services">
                        <ServicesOverviewWrapper services={myServices} showFilters={false} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Recent Bookings" viewAllLink="/dashboard/property-owner/bookings">
                        <PaymentsOverviewWrapper bookings={myBookings} showFilters={false} />
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Notifications" viewAllLink="/dashboard/property-owner/notifications">
                        <NotificationsSummary notifications={Array.isArray(notifications) ? notifications : []} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Properties" viewAllLink="/dashboard/property-owner/properties">
                        <PropertiesTableList properties={properties} recent={true} />
                    </DashboardGridItem>
                </div>
            </div>
        </div>
    );
}

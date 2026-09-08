import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertiesPieChart from "@/app/_components/PropertiesPieChart"; 
import PropertyStatusChart from "@/app/_components/PropertyStatusChart";
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import UserDistributionChart from "@/app/_components/UserDistributionChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import ServiceStatusChart from "@/app/_components/ServiceStatusChart";
import BookingsStatusChart from "@/app/_components/BookingsStatusChart";
import BookingsTrendChart from "@/app/_components/BookingsTrendChart";
import InvoiceStatusChart from "@/app/_components/InvoiceStatusChart";
import { getAdminProperties, getAdminServices, getAllAdmin, getAllUsers, getPropertyOwner, getInvoices, getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

const chartBox = "bg-white p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[350px]";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const [
        propertiesData,
        servicesData,
        propertyOwners,
        admins,
        users,
        invoices,
        bookingsData,
    ] = await Promise.all([
        getAdminProperties(token),
        getAdminServices(token),
        getPropertyOwner(token),
        getAllAdmin(token),
        getAllUsers(token),
        getInvoices(token),
        getAdminBooking(token),
    ]);

    const properties = propertiesData?.properties || propertiesData || [];
    const services = Array.isArray(servicesData) ? servicesData : [];
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    const payments = Array.isArray(invoices) ? invoices : [];

    const userStats = {
        totalUsers: users?.length || 0,
        propertyOwners: propertyOwners?.length || 0,
        residents: (users || []).filter(u => u.role === 'resident' || !u.role).length,
        serviceProviders: (users || []).filter(u => u.role === 'service-provider').length,
        admins: admins?.length || 0
    };

    return (
        <div className="p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Reports & Analytics</h1>
            <div className="flex flex-col gap-10">
              
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title={"Properties Distribution"}>
                        <div className={chartBox}>
                            <PropertiesPieChart properties={properties} />
                        </div>
                    </DashboardGridItem>
                    
                    <DashboardGridItem title={"User Type Distribution"}>
                        <div className={chartBox}>
                            <UserDistributionChart stats={userStats} />
                        </div>
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title={"Property Status Distribution"}>
                        <div className={chartBox}>
                            <PropertyStatusChart properties={properties} />
                        </div>
                    </DashboardGridItem>

                    <DashboardGridItem title={"Bookings Status"}>
                        <div className={chartBox}>
                            <BookingsStatusChart bookings={bookings} />
                        </div>
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title={"Bookings Trend (by Month)"}>
                        <div className={chartBox}>
                            <BookingsTrendChart bookings={bookings} />
                        </div>
                    </DashboardGridItem>

                    <DashboardGridItem title={"Revenue by Status"}>
                        <div className={chartBox}>
                            <InvoiceStatusChart invoices={payments} currency />
                        </div>
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title={"Service Requests by Category (All Time)"}>
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[400px]">
                            <ServicesByTypeChart services={services} />
                        </div>
                    </DashboardGridItem>

                    <DashboardGridItem title={"Service Status Breakdown"}>
                        <div className={chartBox}>
                            <ServiceStatusChart services={services} />
                        </div>
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title={"Service Request Growth (by Month)"}>
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[350px]">
                            <ServiceGrowthChart services={services} />
                        </div>
                    </DashboardGridItem>

                    <DashboardGridItem title={"Monthly Revenue Overview"}>
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[350px]">
                            <RevenueOverviewChart payments={payments} />
                        </div>
                    </DashboardGridItem>
                </div>
            </div>
        </div>
    );
}
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
import { getAdminProperties, getAdminServices, getAllAdmin, getAllUsers, getPropertyOwner, getAllInvoices, getAdminBooking } from "@/app/_lib/data-services";
import { toReportArray } from "@/app/_lib/report-utils";
import { cookies } from "next/headers";

const chartBox = "bg-white p-3 sm:p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[320px] min-w-0";

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
        getAdminProperties(token, { limit: 10000 }),
        getAdminServices(token),
        getPropertyOwner(token),
        getAllAdmin(token),
        getAllUsers(token, 10000),
        getAllInvoices(undefined, token),
        getAdminBooking(token),
    ]);

    const properties = toReportArray(propertiesData);
    const services = toReportArray(servicesData);
    const bookings = toReportArray(bookingsData);
    const payments = toReportArray(invoices);
    const userRecords = toReportArray(users);
    const ownerRecords = toReportArray(propertyOwners);
    const adminRecords = toReportArray(admins);
    const getRole = (user) => String(user.role || user.user_type || "").trim().toLowerCase().replace(/[_\s]+/g, "-");

    const userStats = {
        propertyOwners: ownerRecords.length,
        residents: userRecords.filter(u => ["resident", "tenant", "user"].includes(getRole(u))).length,
        serviceProviders: userRecords.filter(u => ["service-provider", "provider", "vendor"].includes(getRole(u))).length,
        admins: adminRecords.length,
        otherUsers: userRecords.filter(u => !["resident", "tenant", "user", "service-provider", "provider", "vendor", "owner", "property-owner", "admin", "administrator"].includes(getRole(u))).length,
    };

    return (
        <div className="p-2">
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Reports & Analytics</p>
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

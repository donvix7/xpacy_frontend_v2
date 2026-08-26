import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertiesPieChart from "@/app/_components/PropertiesPieChart"; 
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import UserDistributionChart from "@/app/_components/UserDistributionChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import { getAdminProperties, getAdminServices, getAllAdmin, getAllUsers, getPropertyOwner, getInvoices } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const [
        propertiesData,
        services,
        propertyOwners,
        admins,
        users,
        invoices,
    ] = await Promise.all([
        getAdminProperties(token),
        getAdminServices(token),
        getPropertyOwner(token),
        getAllAdmin(token),
        getAllUsers(token),
        getInvoices(token),
    ]);

    const properties = propertiesData?.properties || propertiesData || [];
    const payments = Array.isArray(invoices) ? invoices : [];

    const userStats = {
        totalUsers: users?.length || 0,
        propertyOwners: propertyOwners?.length || 0,
        residents: (users || []).filter(u => u.role === 'resident' || !u.role).length,
        serviceProviders: (users || []).filter(u => u.role === 'service-provider').length,
        admins: admins?.length || 0
    };

    return (
        <div className="p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Reports & Analytics</h1>
            <div className="flex flex-col gap-10">
              
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <DashboardGridItem title={"Properties Distribution"}>
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[350px]">
                            <PropertiesPieChart properties={properties} />
                        </div>
                    </DashboardGridItem>
                    
                    <DashboardGridItem title={"User Type Distribution"}>
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[350px]">
                            <UserDistributionChart stats={userStats} />
                        </div>
                    </DashboardGridItem>
                </div>

                <DashboardGridItem title={"Service Requests by Category (All Time)"}>
                    <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[400px]">
                        <ServicesByTypeChart services={services || []} />
                    </div>
                </DashboardGridItem>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title={"Service Request Growth (by Month)"}>
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[350px]">
                            <ServiceGrowthChart services={services || []} />
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

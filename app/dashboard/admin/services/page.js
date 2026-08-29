import PropertyOwnerServicesTable from "@/app/_components/PropertyOwnerServicesTable";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import { getAdminServices, getAdminServiceProviders } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminServicesTabs from "@/app/_components/AdminServicesTabs";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const services = await getAdminServices(token) || [];
    const serviceProviders = await getAdminServiceProviders(token) || [];

    return (
        <div className="p-6">
            
            <ServicesOverviewWrapper services={services} />

            <DashboardGridItem title={"Service Management"}>
                <AdminServicesTabs services={services} serviceProviders={serviceProviders} />
            </DashboardGridItem>
        </div>
    );
}

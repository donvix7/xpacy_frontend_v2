import PropertyOwnerServicesTable from "@/app/_components/PropertyOwnerServicesTable";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import { getAdminServices, getAdminServiceProviders } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminServicesTabs from "@/app/_components/AdminServicesTabs";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const results = await Promise.allSettled([
        getAdminServices(token),
        getAdminServiceProviders(token),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const services = (results[0].status === "fulfilled" ? results[0].value : []) || [];
    const serviceProviders = (results[1].status === "fulfilled" ? results[1].value : []) || [];

    return (
        <div className="space-y-6 p-4">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}

            <ServicesOverviewWrapper services={services} serviceProviders={serviceProviders}/>

            <DashboardGridItem >
                <AdminServicesTabs services={services} serviceProviders={serviceProviders} />
            </DashboardGridItem>
        </div>
    );
}

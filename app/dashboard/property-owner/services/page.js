import { cookies } from "next/headers";
import PropertyOwnerServicesTable from "@/app/_components/PropertyOwnerServicesTable";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import { getPropertyOwnerServices } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const services = await getPropertyOwnerServices(token);

  const myServices = Array.isArray(services) ? services : [];

  // Pagination (mock for now as API support is unclear from context, using similar logic to properties)
  const page = Number(searchParams?.page) || 1;
  const limit = 10;
  const total = myServices.length;
  const totalPages = Math.ceil(total / limit);
  
  // Slice for local pagination if API doesn't paginated
  const paginatedServices = myServices.slice((page - 1) * limit, page * limit);

  const pagination = {
      page,
      limit,
      totalPages,
      total
  };

  return (
    <div className="space-y-8 p-2">
        <ServicesOverviewWrapper services={myServices} />
        <DashboardGridItem title={"All Services"}>
            <PropertyOwnerServicesTable services={paginatedServices} pagination={pagination} />
        </DashboardGridItem>
    </div>
  );
};
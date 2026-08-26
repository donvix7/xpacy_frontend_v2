import { cookies } from "next/headers";
import Link from "next/link";
import PropertyOwnerServicesTable from "@/app/_components/PropertyOwnerServicesTable";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import { getUserProfile, getProperties, getPropertyOwnerServices, getPropertyOwnerProperties } from "@/app/_lib/data-services";
import { MdAdd } from "react-icons/md";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const [user, propertiesData, services] = await Promise.all([
      getUserProfile(token),
      getPropertyOwnerProperties(token),
      getPropertyOwnerServices(token) 
  ]);

  const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : [];
  const myProperties = allProperties.filter(property => property.property_owner_id === user?.id);
  const myPropertyIds = myProperties.map(p => p.id || p._id);

  // Filter services that are linked to my properties
  let myServices = Array.isArray(services) ? services : [];

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
    <div className="space-y-6 p-4">
            <ServicesOverviewWrapper services={myServices} />
            <DashboardGridItem title={"All Services"}>
                <PropertyOwnerServicesTable services={paginatedServices} pagination={pagination} />
            </DashboardGridItem>
        
        
    </div>
  );
};

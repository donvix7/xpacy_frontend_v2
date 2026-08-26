import AdminPropertyList from "@/app/_components/AdminPropertyList";
import PropertiesSummary from "@/app/_components/PropertiesSummary";
// import AdminSummary from "@/app/_components/AdminSummary"; // Commented out in original
import Pagination from "@/app/_components/Pagination";
import { getAdminProperties } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import SearchInput from "@/app/_components/SearchInput";
import DashboardFilter from "@/app/_components/DashboardFilter";
import DashboardGridItem from "@/app/_components/DashboardGridItems";


export default async function Page({searchParams}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const params = await searchParams;
    
    // Fetch unpaginated properties for full filtering
    const {properties: allProperties} = await getAdminProperties(token, { limit: 10000 });
    let propertiesList = allProperties || [];

    // Local Filtering exactly matching frontend query params
    if (params.status) {
        propertiesList = propertiesList.filter(p => p.property_status?.toLowerCase() === params.status.toLowerCase());
    }
    if (params.type) {
        propertiesList = propertiesList.filter(p => p.property_type?.toLowerCase() === params.type.toLowerCase());
    }
    if (params.minPrice) {
        propertiesList = propertiesList.filter(p => Number(p.property_price) >= Number(params.minPrice));
    }
    if (params.maxPrice) {
        propertiesList = propertiesList.filter(p => Number(p.property_price) <= Number(params.maxPrice));
    }
    if (params.location) {
        const query = params.location.toLowerCase();
        propertiesList = propertiesList.filter(p => 
            p.city?.toLowerCase().includes(query) || 
            p.state?.toLowerCase().includes(query) || 
            p.property_name?.toLowerCase().includes(query)
        );
    }

    // Manual Pagination
    const page = Number(params.page) || 1;
    const limit = 10;
    const totalItems = propertiesList.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedProperties = propertiesList.slice((page - 1) * limit, page * limit);
    const pagination = { page, limit, total: totalItems, totalPages };

    return (
        <div className="space-y-6 p-4">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Properties</h1>
            <DashboardGridItem title="Properties Summary">
            <PropertiesSummary properties={allProperties || []} totalProperties={allProperties?.length || 0} />
            </DashboardGridItem>
            
            <div className={`border-[1.5px] border-primary-200 p-6 flex flex-col gap-4 rounded-lg `}>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between border-b border-primary-100 pb-4">
                    <h3 className="lg:text-md text-black text-base font-sans font-bold">All Properties</h3>
                    <div className="flex items-center gap-4">
                        <SearchInput placeholder="Search location..." />
                        <DashboardFilter />
                    </div>
                </div>
                
                <AdminPropertyList properties={paginatedProperties || []} bookings={[]} pagination={pagination} />
            </div>
            
            <div className="mt-8 flex justify-center">
                <Pagination pagination={pagination} />
            </div>
        </div>
    )
}
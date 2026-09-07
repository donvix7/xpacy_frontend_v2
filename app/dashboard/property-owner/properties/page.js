import { cookies } from "next/headers";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import { getPropertyOwnerProperties } from "@/app/_lib/data-services";
import PropertiesSummary from "@/app/_components/PropertiesSummary";
import ExportButton from "@/app/_components/ExportButton";
import DateFilter from "@/app/_components/DateFilter";
import { checkDateInRange } from "@/app/_lib/utils";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

export default async function Page({searchParams}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const params = await searchParams;
    const filterRange = params?.range;

    // Fetch data - explicitly query full unpaginated list
    const propertiesData = await getPropertyOwnerProperties(token, { limit: 10000 });
    const allPropertiesForSummary = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];

    let propertiesList = allPropertiesForSummary || [];

    // Filter by Date Range
    if (filterRange && filterRange !== 'all_time') {
        propertiesList = propertiesList.filter(p => {
            const dateStr = p.createdAt || p.created_at || p.date_added; 
            return checkDateInRange(dateStr, filterRange);
        });
    }

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
    
    // Pagination data from API (if available) or manual
    const pagination = {
        page,
        limit,
        totalPages,
        total: totalItems
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center gap-2">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Properties</h1>
                <div className="flex items-center gap-2">
                    <DateFilter />
                    <ExportButton 
                        data={propertiesList} 
                        filename="property_summary" 
                        options={[
                            { id: "all", label: "All data" },
                            { id: "summary", label: "Summary" },
                            { id: "overview", label: "properties overview" }
                        ]}
                    />
                </div>
            </div>
            <DashboardGridItem title="Property Summary">
                <PropertiesSummary properties={allPropertiesForSummary || []} />
            </DashboardGridItem>
            <DashboardGridItem title="Property List">
                <PropertiesTableList properties={paginatedProperties} pagination={pagination} />
            </DashboardGridItem>
        </div>
    );
};
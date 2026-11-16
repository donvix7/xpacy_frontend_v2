import { cookies } from "next/headers";
import Link from "next/link";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import { getPropertyOwnerBookings, getProperties, getUserProfile, getPropertyOwnerServices, getPropertyOwnerProperties } from "@/app/_lib/data-services";
import PropertiesSummary from "@/app/_components/PropertiesSummary";
import { MdAdd } from "react-icons/md";
import SearchInput from "@/app/_components/SearchInput";
import ExportButton from "@/app/_components/ExportButton";
import DateFilter from "@/app/_components/DateFilter";
import { checkDateInRange } from "@/app/_lib/utils";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { Suspense } from "react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page({searchParams}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const params = await searchParams;
    const filterRange = params?.range;

    // Fetch data - explicitly query full unpaginated list
    const results = await Promise.allSettled([
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerBookings(token),
        getPropertyOwnerServices(token)
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const propertiesData = results[0].status === "fulfilled" ? results[0].value : [[], {}];
    const [allPropertiesForSummary] = propertiesData;
    const bookings = results[1].status === "fulfilled" ? results[1].value : [];
    const services = results[2].status === "fulfilled" ? results[2].value : [];

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
        <div className="space-y-6 p-4">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <div className="flex justify-between items-center gap-2">
                <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Properties</p>
                <div className="flex gap-2">

                <Suspense fallback={<div className="h-10 w-32" />}><DateFilter /></Suspense>
                <ExportButton 
                    data={services} 
                    filename="property_summary" 
                    options={[
                        { id: "all", label: "All data" },
                        { id: "summary", label: "Summary" },
                        { id: "overview", label: "properties overview" }
                    ]}
                />
                </div>

            </div>
            <DashboardGridItem title={"Properties Overview"}>
            <PropertiesSummary properties={allPropertiesForSummary || []} />
            </DashboardGridItem>
           <DashboardGridItem title={"All Properties"}>

            <PropertiesTableList properties={paginatedProperties} />
           </DashboardGridItem>
            
        </div>
    );
};

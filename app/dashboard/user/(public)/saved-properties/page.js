import SavedPropertyCard from "@/app/_components/SavedPropertyCard";
import Pagination from "@/app/_components/Pagination";
import { getSavedProperties } from "@/app/_lib/data-services";
import {cookies } from "next/headers"
import EmptyState from "@/app/_components/EmptyState";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";

export default async function Page() {
        const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const {data, pagination} = await getSavedProperties(token);
        if(data.length <= 0 ) return <EmptyState message={"Oops!... You have no saved properties yet."} cta={"Explore properties"}/>
    
    return (
        <main className="p-6 flex flex-col lg:gap-4 gap-6">
            <MobileDashboardHeader/>
            {/* Pagination */}
            <header className="lg:col-span-3 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 lg:gap-0">
                <span className="text-base font-mono text-base-500 ">Showing <span>{(pagination.page - 1) * pagination.limit + 1}</span> - <span>{pagination?.page === pagination?.totalPages ? pagination.total : pagination?.page * pagination?.limit}</span> of <span>{pagination?.total}</span> results </span>
                <div className="flex items-center space-x-2.5 font-mono text-base-500">
                    <span>Sort by:</span>
                    <select className="p-2.5 border border-neutral-200 rounded-lg">
                        <option>Default</option>
                    </select>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12 gap-y-6">
                {
                    data?.map((property) => <SavedPropertyCard key={property.id} property={property.propertySaved} id={property.property_id} />)
                }
            </div>
            <Pagination pagination={pagination} />
        </main>
    )
}
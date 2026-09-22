import Pagination from "@/app/_components/Pagination";
import { getSavedProperties } from "@/app/_lib/data-services";
import { cookies } from "next/headers"
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SavedPropCardList from "@/app/_components/SavedProCardList";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const { pagination } = await getSavedProperties(token);

    return (
        <main className="p-2 flex flex-col lg:gap-4 gap-6">
            <MobileDashboardHeader/>
             <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Saved Properties</h1>
            {/* Pagination */}
            <header className="lg:col-span-3 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 lg:gap-0">
                <span className="text-base font-mono text-base-500 ">Showing <span>{((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 0) + 1}</span> - <span>{pagination?.page === pagination?.totalPages ? pagination?.total : (pagination?.page ?? 0) * (pagination?.limit ?? 0)}</span> of <span>{pagination?.total ?? 0}</span> results </span>
                <div className="flex items-center space-x-2.5 font-mono text-base-500">
                    <span>Sort by:</span>
                    <select className="p-2.5 border border-neutral-200 rounded-lg">
                        <option>Default</option>
                    </select>
                </div>
            </header>
             <DashboardGridItem title={"Saved Properties"} >
                <SavedPropCardList/>
            </DashboardGridItem>
            <Pagination pagination={pagination} />
        </main>
    )
}
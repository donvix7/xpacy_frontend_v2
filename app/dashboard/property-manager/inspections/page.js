import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaCheckDouble, FaClipboardList, FaClock } from "react-icons/fa6";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);

    
const summaryCards = [
    { 
        label: "Total Properties", 
        value: properties.length, 
        color: "bg-primary-100", 
        icon: <FaBuilding className="w-5 h-5 text-primary-700" /> 
    },
    { 
        label: "Scheduled", 
        value: 0, 
        color: "bg-blue-100", 
        icon: <FaClipboardList className="w-5 h-5 text-blue-700" /> // Clipboard represents scheduled inspections
    },
    { 
        label: "Completed", 
        value: 0, 
        color: "bg-green-100", 
        icon: <FaCheckDouble className="w-5 h-5 text-green-700" /> // Double check represents completed
    },
    { 
        label: "Pending", 
        value: 0, 
        color: "bg-amber-100", 
        icon: <FaClock className="w-5 h-5 text-amber-700" /> // Clock represents pending
    },
];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Inspections</h1>
            <DashboardGridItem title="Property Inspections Overview">
                <SummaryCards cards={summaryCards} />
            </DashboardGridItem>

            <DashboardGridItem title="Property Inspections">
                <EmptyState message="Inspections management is coming soon. You will be able to schedule, track, and report on property inspections for managed properties." />
            </DashboardGridItem>
        </div>
    );
}

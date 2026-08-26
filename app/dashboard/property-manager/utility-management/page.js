import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaChartPie, FaCreditCard, FaPlug } from "react-icons/fa6";

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
        label: "Meters", 
        value: 0, 
        color: "bg-blue-100", 
        icon: <FaPlug className="w-5 h-5 text-blue-700" /> // Plug represents utility meters
    },
    { 
        label: "Total Usage", 
        value: "0 kWh", 
        color: "bg-amber-100", 
        icon: <FaChartPie className="w-5 h-5 text-amber-700" /> // Pie chart shows usage distribution
    },
    { 
        label: "Outstanding", 
        value: "$0", 
        color: "bg-red-100", 
        icon: <FaCreditCard className="w-5 h-5 text-red-700" /> // Credit card represents outstanding payments
    },
];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Utility Management</h1>
            <DashboardGridItem title={"Utility Overview"}>
                <SummaryCards cards={summaryCards} />
            </DashboardGridItem>

            <DashboardGridItem title="Utility Overview">
                <EmptyState message="Utility management is coming soon. You will be able to track meter readings, utility usage, and billing for managed properties." />
            </DashboardGridItem>
        </div>
    );
}

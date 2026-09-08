import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBolt, FaBuilding, FaMoneyBillWave } from "react-icons/fa6";
import { FiBarChart2 } from "react-icons/fi";

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
        icon: <FaBuilding className="w-5 h-5 text-primary-700" /> // Building represents properties
    },
    { 
        label: "Meters", 
        value: 0, 
        color: "bg-gray-100", 
        icon: <FaBolt className="w-5 h-5 text-gray-700" /> // Bolt represents electrical meters
    },
    { 
        label: "Total Usage", 
        value: "0 kWh", 
        color: "bg-blue-100", 
        icon: <FiBarChart2 className="w-5 h-5 text-blue-700" /> // Chart represents usage/consumption
    },
    { 
        label: "Outstanding", 
        value: "$0", 
        color: "bg-red-100", 
        icon: <FaMoneyBillWave className="w-5 h-5 text-red-700" /> // Money represents outstanding payments
    },
];

    return (
        <div className="space-y-6 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Utility Management</h1>
            <SummaryCards cards={summaryCards} title="Utility Overview" />

            <DashboardGridItem title="Utility Overview">
                <EmptyState message="Utility management is coming soon. You will be able to track meter readings, utility usage, and billing for assigned properties." />
            </DashboardGridItem>
        </div>
    );
}

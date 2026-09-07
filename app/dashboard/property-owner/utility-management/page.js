import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaExclamationTriangle, FaTachometerAlt } from "react-icons/fa";
import { FaBolt, FaBuilding } from "react-icons/fa6";

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
        title: "Total Properties",
        count: properties.length,
        icon: <FaBuilding className="text-blue-600" size={20} />,
        color: "bg-blue-100 border-blue-600",
        bgColor: "bg-blue-100"
    },
    {
        title: "Meters",
        count: 0,
        icon: <FaTachometerAlt className="text-primary-600" size={20} />,
        color: "bg-primary-100 border-primary-600",
        bgColor: "bg-primary-100"
    },
    {
        title: "Total Usage",
        count: "0 kWh",
        icon: <FaBolt className="text-violet-600" size={20} />,
        color: "bg-violet-100 border-violet-600",
        bgColor: "bg-violet-100"
    },
    {
        title: "Outstanding",
        count: "$0",
        icon: <FaExclamationTriangle className="text-red-600" size={20} />,
        color: "bg-red-100 border-red-600",
        bgColor: "bg-red-100"
    }
];

    return (
        <div className="space-y-8 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Utility Management</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Utility Overview">
                <EmptyState message="Utility management is coming soon. You will be able to track meter readings, utility usage, and billing for your properties." />
            </DashboardGridItem>
        </div>
    );
}

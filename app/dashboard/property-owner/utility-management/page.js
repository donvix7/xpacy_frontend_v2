import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";

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
        { label: "Total Properties", value: properties.length, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{properties.length}</span> },
        { label: "Meters", value: 0, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">0</span> },
        { label: "Total Usage", value: "0 kWh", color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">0</span> },
        { label: "Outstanding", value: "$0", color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">$</span> },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Utility Management</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Utility Overview">
                <EmptyState message="Utility management is coming soon. You will be able to track meter readings, utility usage, and billing for your properties." />
            </DashboardGridItem>
        </div>
    );
}

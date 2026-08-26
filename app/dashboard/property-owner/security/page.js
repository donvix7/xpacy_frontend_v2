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
        { label: "Secured", value: properties.length, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">{properties.length}</span> },
        { label: "Incidents", value: 0, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">0</span> },
        { label: "Active Guards", value: 0, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">0</span> },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Security</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Security Overview">
                <EmptyState message="Security management is coming soon. You will be able to manage security personnel, access control, and incident reports for your properties." />
            </DashboardGridItem>
        </div>
    );
}

import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaBullhorn, FaUsers } from "react-icons/fa6";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

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
        icon: <FaBuilding className="w-5 h-5 text-primary" /> 
    },
    { 
        label: "Topics", 
        value: 0, 
        color: "bg-blue-100", 
        icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-blue-700" /> // Chat bubbles represent topics
    },
    { 
        label: "Members", 
        value: 0, 
        color: "bg-green-100", 
        icon: <FaUsers className="w-5 h-5 text-green-700" /> // Users represents members
    },
    { 
        label: "Announcements", 
        value: 0, 
        color: "bg-amber-100", 
        icon: <FaBullhorn className="w-5 h-5 text-amber-700" /> // Bullhorn represents announcements
    },
];

    return (
        <div className="space-y-6 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Community Forum</h1>

            <SummaryCards cards={summaryCards} title="Overview" />

            <DashboardGridItem title="Community Discussions">
                <EmptyState message="Community forum is coming soon. You will be able to create topics, make announcements, and engage with tenants in your managed properties." />
            </DashboardGridItem>
        </div>
    );
}

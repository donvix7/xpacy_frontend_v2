import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaUserShield } from "react-icons/fa6";
import { FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

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
        icon: <FaBuilding className="text-blue-700" size={20} />,
        color: "bg-blue-100 border-blue-800",
        bgColor: "bg-blue-100"
    },
    {
        title: "Secured",
        count: properties.length,
        icon: <FaShieldAlt className="text-green-700" size={20} />,
        color: "bg-green-100 border-green-800",
        bgColor: "bg-green-100"
    },
    {
        title: "Incidents",
        count: 0,
        icon: <FaExclamationTriangle className="text-red-700" size={20} />,
        color: "bg-red-100 border-red-800",
        bgColor: "bg-red-100"
    },
    {
        title: "Active Guards",
        count: 0,
        icon: <FaUserShield className="text-purple-700" size={20} />,
        color: "bg-purple-100 border-purple-800",
        bgColor: "bg-purple-100"
    }
];

    return (
        <div className="space-y-8 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Security</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Security Overview">
                <EmptyState message="Security management is coming soon. You will be able to manage security personnel, access control, and incident reports for your properties." />
            </DashboardGridItem>
        </div>
    );
}

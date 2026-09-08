import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import PropertyManagerInventory from "@/app/_components/PropertyManagerInventory";
import { FaBuilding, FaClipboardCheck, FaTriangleExclamation, FaBoxOpen } from "react-icons/fa6";

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
            label: "Properties",
            value: properties.length,
            color: "bg-primary-100",
            icon: <FaBuilding className="w-5 h-5 text-primary-700" />
        },
        {
            label: "Unit Items",
            value: 16,
            color: "bg-blue-100",
            icon: <FaBoxOpen className="w-5 h-5 text-blue-700" />
        },
        {
            label: "Categories",
            value: 4,
            color: "bg-amber-100",
            icon: <FaClipboardCheck className="w-5 h-5 text-amber-700" />
        },
        {
            label: "Conditions",
            value: 4,
            color: "bg-green-100",
            icon: <FaTriangleExclamation className="w-5 h-5 text-green-700" />
        },
    ];

    return (
        <div className="space-y-6 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Inventory</h1>
            <SummaryCards cards={summaryCards} title="Inventory Overview" />

            <DashboardGridItem title="Property Inventory">
                {properties.length === 0 ? (
                    <p className="text-sm text-gray-500 font-mono">No properties available. Add a property to start tracking its inventory.</p>
                ) : (
                    <PropertyManagerInventory properties={properties} />
                )}
            </DashboardGridItem>
        </div>
    );
}
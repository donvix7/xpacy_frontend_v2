import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaUsers } from "react-icons/fa6";
import { GiHomeGarage } from "react-icons/gi";
import { FaHome } from "react-icons/fa";

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

    const rentedProperties = properties.filter(p => (p.property_status || p.purpose || "").toLowerCase() === "rent");
    const vacantProperties = properties.filter(p => ["vacant", "available", "active"].includes((p.availability_status || "").toLowerCase()));

  
const summaryCards = [
    { 
        label: "Total Tenants", 
        value: rentedProperties.length, 
        color: "bg-primary-100", 
        icon: <FaUsers className="w-5 h-5 text-primary-700" /> // Users represents tenants
    },
    { 
        label: "Occupied Units", 
        value: rentedProperties.length, 
        color: "bg-blue-100", 
        icon: <FaHome className="w-5 h-5 text-blue-700" /> // Home represents occupied units
    },
    { 
        label: "Vacant Units", 
        value: vacantProperties.length, 
        color: "bg-gray-100", 
        icon: <GiHomeGarage className="w-5 h-5 text-gray-700" /> // Empty house represents vacant units
    },
    { 
        label: "Total Properties", 
        value: properties.length, 
        color: "bg-pink-100", 
        icon: <FaBuilding className="w-5 h-5 text-pink-700" /> // Building represents total properties
    },
];


    return (
        <div className="space-y-6 p-2">
            <div className="flex justify-between items-center gap-2">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Tenants</h1>

            </div>
            <SummaryCards cards={summaryCards} title="Tenants Overview" />

            <DashboardGridItem title="Tenant Directory">
                {rentedProperties.length === 0 ? (
                    <EmptyState message="No tenants found. Tenants will appear here once properties are rented out." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary-200">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Property</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentedProperties.map((property, i) => (
                                    <tr key={property.id || property._id || i} className="border-b border-primary-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium">{property.title || property.name || "Untitled"}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{property.location || property.state || "—"}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">{property.property_type || property.type || "—"}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Occupied</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}

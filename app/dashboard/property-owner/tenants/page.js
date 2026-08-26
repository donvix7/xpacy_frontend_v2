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

    const rentedProperties = properties.filter(p => (p.property_status || p.purpose || "").toLowerCase() === "rent");
    const vacantProperties = properties.filter(p => ["vacant", "available", "active"].includes((p.availability_status || "").toLowerCase()));

    const summaryCards = [
        { label: "Total Tenants", value: rentedProperties.length, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{rentedProperties.length}</span> },
        { label: "Occupied Units", value: rentedProperties.length, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">{rentedProperties.length}</span> },
        { label: "Vacant Units", value: vacantProperties.length, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">{vacantProperties.length}</span> },
        { label: "Total Properties", value: properties.length, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">{properties.length}</span> },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Tenants</h1>

            <SummaryCards cards={summaryCards} />

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

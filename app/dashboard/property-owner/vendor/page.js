import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerServices,
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
        getPropertyOwnerServices(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const services = results[2].status === "fulfilled" ? results[2].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);
    const myServices = Array.isArray(services) ? services : [];

    const vendorIds = new Set(myServices.map(s => s.service_provider_id || s.provider_id).filter(Boolean));
    const uniqueVendors = myServices.reduce((acc, s) => {
        const id = s.service_provider_id || s.provider_id;
        const name = s.provider_name || s.service_provider_name || "Unknown Provider";
        if (id && !acc.find(v => v.id === id)) {
            acc.push({ id, name, type: s.service_type || "General" });
        }
        return acc;
    }, []);

    const summaryCards = [
        { label: "Total Services", value: myServices.length, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{myServices.length}</span> },
        { label: "Active Vendors", value: uniqueVendors.length, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">{uniqueVendors.length}</span> },
        { label: "Properties", value: properties.length, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">{properties.length}</span> },
        { label: "Completed Jobs", value: myServices.filter(s => (s.status || "").toLowerCase() === "completed").length, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">{myServices.filter(s => (s.status || "").toLowerCase() === "completed").length}</span> },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Vendors</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Service Providers">
                {uniqueVendors.length === 0 ? (
                    <EmptyState message="No vendors found. Service providers will appear here once services are requested." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary-200">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Provider</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Service Type</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Jobs Assigned</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uniqueVendors.map((vendor, i) => {
                                    const vendorJobs = myServices.filter(s => (s.service_provider_id || s.provider_id) === vendor.id);
                                    const completedJobs = vendorJobs.filter(s => (s.status || "").toLowerCase() === "completed");
                                    return (
                                        <tr key={vendor.id || i} className="border-b border-primary-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium">{vendor.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 capitalize">{vendor.type}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{vendorJobs.length}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">{completedJobs.length}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}

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

    const maintenanceServices = myServices.filter(s =>
        ["maintenance", "repair", "plumbing", "electrical", "cleaning", "hvac", "painting", "general"].includes(
            (s.service_type || s.category || "").toLowerCase()
        )
    );
    const pendingMaintenance = maintenanceServices.filter(s => (s.status || "").toLowerCase() === "pending");
    const inProgressMaintenance = maintenanceServices.filter(s => (s.status || "").toLowerCase() === "in-progress");
    const completedMaintenance = maintenanceServices.filter(s => (s.status || "").toLowerCase() === "completed");

    const summaryCards = [
        { label: "Total Requests", value: maintenanceServices.length, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{maintenanceServices.length}</span> },
        { label: "Pending", value: pendingMaintenance.length, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">{pendingMaintenance.length}</span> },
        { label: "In Progress", value: inProgressMaintenance.length, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">{inProgressMaintenance.length}</span> },
        { label: "Completed", value: completedMaintenance.length, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">{completedMaintenance.length}</span> },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Maintenance</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Maintenance Requests">
                {maintenanceServices.length === 0 ? (
                    <EmptyState message="No maintenance requests found. Requests will appear here when submitted." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary-200">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Request</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenanceServices.slice(0, 20).map((service, i) => (
                                    <tr key={service.id || service._id || i} className="border-b border-primary-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium">{service.title || service.description || `Request ${i + 1}`}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">{service.service_type || service.category || "General"}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{service.created_at ? new Date(service.created_at).toLocaleDateString() : "—"}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                (service.status || "").toLowerCase() === "completed" ? "bg-green-100 text-green-700"
                                                : (service.status || "").toLowerCase() === "in-progress" ? "bg-blue-100 text-blue-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {service.status || "Pending"}
                                            </span>
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

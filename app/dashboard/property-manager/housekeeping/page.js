import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerServices,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBroom, FaBuilding, FaUsersGear } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { PiSpinner } from "react-icons/pi";

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

    const cleaningTasks = myServices.filter(s =>
        ["cleaning", "housekeeping", "laundry", "sanitization", "turnaround"].includes(
            (s.service_type || s.category || "").toLowerCase()
        )
    );
    const pendingCleaning = cleaningTasks.filter(s => (s.status || "").toLowerCase() === "pending");
    const completedCleaning = cleaningTasks.filter(s => (s.status || "").toLowerCase() === "completed");

    const summaryCards = [
        {
            label: "Properties",
            value: properties.length,
            color: "bg-primary-100",
            icon: <FaBuilding className="w-5 h-5 text-primary-700" />
        },
        {
            label: "Cleaning Tasks",
            value: cleaningTasks.length,
            color: "bg-blue-100",
            icon: <FaBroom className="w-5 h-5 text-blue-700" />
        },
        {
            label: "Pending",
            value: pendingCleaning.length,
            color: "bg-amber-100",
            icon: <PiSpinner className="w-5 h-5 text-amber-700" />
        },
        {
            label: "Completed",
            value: completedCleaning.length,
            color: "bg-green-100",
            icon: <FaCheckCircle className="w-5 h-5 text-green-700" />
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Housekeeping</h1>

            <SummaryCards cards={summaryCards} title="Housekeeping Overview" />

            <DashboardGridItem title="Housekeeping Operations">
                <EmptyState message="Housekeeping scheduling is coming soon. You will be able to assign cleaning staff, create turnaround checklists, and track completed cleans for your properties." />
            </DashboardGridItem>
        </div>
    );
}
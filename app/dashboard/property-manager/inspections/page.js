import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerBookings,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import ScheduleInspection from "@/app/_components/ScheduleInspection";
import InspectionsTable from "@/app/_components/InspectionsTable";
import { FaBuilding, FaCheckDouble, FaClipboardList, FaClock } from "react-icons/fa6";
import { isInspectionBooking, parseBookingDate } from "@/app/_lib/utils";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerBookings(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const bookingsData = results[2].status === "fulfilled" ? results[2].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);

    const allBookings = Array.isArray(bookingsData?.[0]) ? bookingsData[0] : Array.isArray(bookingsData) ? bookingsData : [];
    const inspections = allBookings.filter(isInspectionBooking);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduledCount = inspections.filter(i => {
        const date = parseBookingDate(i.start_date);
        return date && date >= today;
    }).length;
    const completedCount = inspections.filter(i => {
        const date = parseBookingDate(i.start_date);
        return date && date < today;
    }).length;
    const pendingCount = Math.max(0, inspections.length - scheduledCount - completedCount);

    const summaryCards = [
        {
            label: "Total Properties",
            value: properties.length,
            color: "bg-primary-100",
            icon: <FaBuilding className="w-5 h-5 text-primary-700" />
        },
        {
            label: "Scheduled",
            value: scheduledCount,
            color: "bg-blue-100",
            icon: <FaClipboardList className="w-5 h-5 text-blue-700" />
        },
        {
            label: "Completed",
            value: completedCount,
            color: "bg-green-100",
            icon: <FaCheckDouble className="w-5 h-5 text-green-700" />
        },
        {
            label: "Pending",
            value: pendingCount,
            color: "bg-amber-100",
            icon: <FaClock className="w-5 h-5 text-amber-700" />
        },
    ];

    return (
        <div className="space-y-6 p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Inspections</h1>
            <SummaryCards cards={summaryCards} title="Property Inspections Overview" />

            <DashboardGridItem title="Property Inspections">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <p className="text-sm text-gray-500 font-mono">Schedule and track inspections for managed properties.</p>
                    <ScheduleInspection properties={properties} />
                </div>
                {inspections.length > 0 ? (
                    <InspectionsTable inspections={inspections} />
                ) : (
                    <EmptyState message="No inspections scheduled yet. Click &quot;Schedule Inspection&quot; to book an inspection date for a property." />
                )}
            </DashboardGridItem>
        </div>
    );
}
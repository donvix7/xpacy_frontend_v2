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
import { FaBolt, FaBuilding } from "react-icons/fa6";
import { FaExclamationTriangle, FaTachometerAlt } from "react-icons/fa";
import { isInspectionBooking, parseBookingDate } from "@/app/_lib/utils";
import { CalendarCheck2, Clock } from "lucide-react";

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
            title: "Total Properties",
            count: properties.length,
            icon: <FaBuilding className="text-blue-600" size={20} />,
            color: "bg-blue-100 border-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Scheduled",
            count: scheduledCount,
            icon: <Clock className="text-amber-600" size={20} />,
            color: "bg-amber-100 border-amber-600",
            bgColor: "bg-amber-100"
        },
        {
            title: "Completed",
            count: completedCount,
            icon: <CalendarCheck2 className="text-violet-600" size={20} />,
            color: "bg-violet-100 border-violet-600",
            bgColor: "bg-violet-100"
        },
        {
            title: "Pending",
            count: pendingCount,
            icon: <FaExclamationTriangle className="text-red-600" size={20} />,
            color: "bg-red-100 border-red-600",
            bgColor: "bg-red-100"
        }
    ];

    return (
        <div className="space-y-8 p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Inspections</h1>

            <SummaryCards cards={summaryCards} />

            <DashboardGridItem title="Property Inspections">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <p className="text-sm text-gray-500 font-mono">Schedule and track inspections for your properties.</p>
                    <ScheduleInspection properties={properties} />
                </div>
                {inspections.length > 0 ? (
                    <InspectionsTable inspections={inspections} />
                ) : (
                    <EmptyState message="No inspections scheduled yet. Click &quot;Schedule Inspection&quot; to book an inspection date for your property." />
                )}
            </DashboardGridItem>
        </div>
    );
}
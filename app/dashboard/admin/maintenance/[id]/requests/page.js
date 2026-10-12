import Link from "next/link";
import {
    Wrench,
    Clock,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { getAllMaintenanceRequest, getPropertyById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";

const fmt = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
};

const tableHeadings = [
    { heading: "Title" },
    { heading: "Property / Unit" },
    { heading: "Category" },
    { heading: "Priority" },
    { heading: "Reported" },
    { heading: "Status", center: true },
    { heading: "Action", right: true },
];

export default async function MaintenancePage({ params }) {
    // propertyId comes straight from the URL: /dashboard/.../[id]/...
    const { id: propertyId } = await params;

    // Fetch the property (for display) and its maintenance requests in parallel
    const [property, requests] = await Promise.all([
        getPropertyById(propertyId).catch(() => null),
        getAllMaintenanceRequest(propertyId).catch(() => []),
    ]);

    const propertyName =
        property?.name ||
        property?.property_name ||
        property?.title ||
        "Property";

    const allRequests = (Array.isArray(requests) ? requests : []).map((r) => ({
        ...r,
        _propertyName: propertyName,
    }));

    const normalise = (s) => (s || "").toLowerCase();

    const counts = {
        total: allRequests.length,
        open: allRequests.filter((r) =>
            ["open", "pending", "new"].includes(normalise(r.status))
        ).length,
        inProgress: allRequests.filter((r) =>
            ["in_progress", "in-progress", "inprogress", "assigned"].includes(
                normalise(r.status)
            )
        ).length,
        resolved: allRequests.filter((r) =>
            ["resolved", "completed", "done", "closed"].includes(normalise(r.status))
        ).length,
        urgent: allRequests.filter((r) =>
            ["urgent", "high", "critical"].includes(normalise(r.priority))
        ).length,
    };

    const summaryCards = [
        {
            label: "Total requests",
            value: counts.total,
            icon: <Wrench className="h-5 w-5 text-blue-500" />,
            color: "bg-blue-50",
        },
        {
            label: "Open",
            value: counts.open,
            icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
            color: "bg-orange-50",
        },
        {
            label: "In Progress",
            value: counts.inProgress,
            icon: <Clock className="h-5 w-5 text-amber-500" />,
            color: "bg-amber-50",
        },
        {
            label: "Resolved",
            value: counts.resolved,
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            color: "bg-green-50",
        },
    ];

    const renderRow = (req) => (
        <tr
            key={req.id}
            className="border-b border-gray-100 text-sm last:border-0 transition-colors hover:bg-gray-50/60"
        >
            <td className="p-4 font-semibold text-gray-900">
                {req.title || req.description?.slice(0, 40) || "—"}
            </td>
            <td className="p-4 text-gray-700">
                <div className="flex flex-col">
                    <span>{req._propertyName}</span>
                    {req.unit?.unitNumber && (
                        <span className="text-xs text-gray-500">
                            Unit {req.unit.unitNumber}
                        </span>
                    )}
                </div>
            </td>
            <td className="p-4 text-xs capitalize text-gray-600">
                {req.category?.replace(/_/g, " ").toLowerCase() || "—"}
            </td>
            <td className="p-4 text-xs capitalize text-gray-600">
                {req.priority?.toLowerCase() || "—"}
            </td>
            <td className="p-4 text-xs text-gray-500">{fmt(req.createdAt)}</td>
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    <StatusChips status={req.status || "unknown"} />
                </div>
            </td>
            <td className="p-4 text-right">
                <Link
                    href={`/dashboard/user/my-properties/${propertyId}/maintenance/${req.id}`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-100"
                >
                    View
                </Link>
            </td>
        </tr>
    );

    const renderMobileCard = (req) => (
        <article
            key={req.id}
            className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-gray-900">
                        {req.title || req.description?.slice(0, 40) || "Maintenance request"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {req._propertyName}
                        {req.unit?.unitNumber ? ` • Unit ${req.unit.unitNumber}` : ""}
                    </p>
                </div>
                <StatusChips status={req.status || "unknown"} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                <div>
                    <dt className="text-xs text-gray-500">Category</dt>
                    <dd className="mt-1 capitalize text-gray-800">
                        {req.category?.replace(/_/g, " ").toLowerCase() || "—"}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-gray-500">Priority</dt>
                    <dd className="mt-1 capitalize text-gray-800">
                        {req.priority?.toLowerCase() || "—"}
                    </dd>
                </div>
                <div className="col-span-2">
                    <dt className="text-xs text-gray-500">Reported</dt>
                    <dd className="mt-1 text-gray-800">{fmt(req.createdAt)}</dd>
                </div>
            </dl>

            <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                <Link
                    href={`/dashboard/user/my-properties/${propertyId}/maintenance/${req.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                    View details
                </Link>
            </div>
        </article>
    );

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div>
                <p className="text-[28px] font-bold text-primary lg:text-4xl">
                    Maintenance
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Maintenance requests for {propertyName}.
                </p>
            </div>

            <SummaryCards cards={summaryCards} title="Maintenance Summary" />

            <DashboardGridItem title="All Maintenance Requests">
                {allRequests.length === 0 ? (
                    <EmptyState
                        icon={Wrench}
                        title="No maintenance requests"
                        message="No maintenance requests have been logged for this property yet."
                    />
                ) : (
                    <DataTable
                        headers={tableHeadings}
                        data={allRequests}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No requests found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
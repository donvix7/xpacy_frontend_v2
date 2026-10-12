import Link from "next/link";
import {
    ChevronLeft,
    Wrench,
    Building2,
    DoorOpen,
    Hash,
    Calendar,
    CalendarCheck,
    AlertTriangle,
    Tag,
    User,
    Clock,
    FileText,
} from "lucide-react";
import { getMaintenanceById, getPropertyById } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
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

const titleCase = (value) =>
    !value
        ? "—"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

function StatCard({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3.5 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-lg font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    if (value === null || value === undefined || value === "" || value === "—")
        return null;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-gray-800">
                    {value}
                </dd>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const req = await getMaintenanceById(id);
    const title = req?.title || "Maintenance Request";
    return {
        title: `${title} - Maintenance`,
        description: req?.description || `Maintenance request: ${title}`,
    };
}

export default async function MaintenanceDetailPage({ params }) {
    const { id } = await params;

    const req = await getMaintenanceById(id);

    if (!req || typeof req !== "object") {
        return (
            <div className="space-y-5 p-2 sm:p-4">
                <Link
                    href="/dashboard/admin/maintenance"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to maintenance
                </Link>
                <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
                    <EmptyState
                        icon={Wrench}
                        title="Request not found"
                        message="This maintenance request may have been removed or the link is incorrect."
                    />
                </div>
            </div>
        );
    }

    // Optionally fetch property if we have a propertyId
    const property = req.propertyId ? await getPropertyById(req.propertyId) : null;

    /* ---- derived values ---- */
    const title = req.title || "Maintenance Request";
    const status = req.status || "UNKNOWN";
    const priority = titleCase(req.priority);
    const category = titleCase(req.category);

    const unitNumber = req.unit?.unitNumber
        ? `Unit ${req.unit.unitNumber}`
        : req.unit?.name || null;

    const propertyName = property?.name || req.property?.name || null;
    const propertyAddress =
        property?.address ||
        [property?.city, property?.country].filter(Boolean).join(", ") ||
        null;

    const reportedBy =
        req.reportedBy
            ? [req.reportedBy.firstName, req.reportedBy.lastName]
                  .filter(Boolean)
                  .join(" ") ||
              req.reportedBy.email ||
              null
            : req.tenantName || req.reporter || null;

    const assignedTo =
        req.assignedTo
            ? [req.assignedTo.firstName, req.assignedTo.lastName]
                  .filter(Boolean)
                  .join(" ") ||
              req.assignedTo.email ||
              null
            : req.assigneeName || null;

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link
                        href="/dashboard/admin/maintenance"
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to maintenance
                    </Link>
                    <p className="break-words text-[28px] font-bold text-primary lg:text-4xl">
                        {title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {category} {propertyName ? `• ${propertyName}` : ""}
                    </p>
                </div>
                <div className="mt-2">
                    <StatusChips status={status} />
                </div>
            </div>

            {/* Overview cards */}
            <DashboardGridItem title="Overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Tag} label="Category" value={category} />
                    <StatCard icon={AlertTriangle} label="Priority" value={priority} />
                    <StatCard icon={Calendar} label="Reported" value={fmt(req.createdAt)} />
                    <StatCard
                        icon={CalendarCheck}
                        label="Resolved"
                        value={req.resolvedAt ? fmt(req.resolvedAt) : "Pending"}
                    />
                </div>
            </DashboardGridItem>

            {/* Details grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Request details */}
                <DashboardGridItem title="Request Details">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Wrench} label="Title" value={title} />
                        <DetailRow icon={Tag} label="Category" value={category} />
                        <DetailRow icon={AlertTriangle} label="Priority" value={priority} />
                        <DetailRow icon={StatusChips} label="Status" value={titleCase(status)} />
                        <DetailRow icon={Hash} label="Request ID" value={req.id} />
                        {req.description && (
                            <DetailRow
                                icon={FileText}
                                label="Description"
                                value={req.description}
                            />
                        )}
                    </dl>
                </DashboardGridItem>

                {/* Property & Unit */}
                <DashboardGridItem title="Property & Unit">
                    <dl className="flex flex-col gap-4">
                        {propertyName && (
                            <DetailRow icon={Building2} label="Property" value={propertyName} />
                        )}
                        {propertyAddress && (
                            <DetailRow icon={Building2} label="Address" value={propertyAddress} />
                        )}
                        {unitNumber && (
                            <DetailRow icon={DoorOpen} label="Unit" value={unitNumber} />
                        )}
                        <DetailRow icon={Hash} label="Property ID" value={req.propertyId} />
                        <DetailRow icon={Hash} label="Unit ID" value={req.unitId} />
                    </dl>
                </DashboardGridItem>

                {/* People */}
                <DashboardGridItem title="People">
                    <dl className="flex flex-col gap-4">
                        {reportedBy && (
                            <DetailRow icon={User} label="Reported By" value={reportedBy} />
                        )}
                        {assignedTo && (
                            <DetailRow icon={User} label="Assigned To" value={assignedTo} />
                        )}
                    </dl>
                </DashboardGridItem>

                {/* Timeline */}
                <DashboardGridItem title="Timeline">
                    <dl className="flex flex-col gap-4">
                        <DetailRow icon={Calendar} label="Reported" value={fmt(req.createdAt)} />
                        <DetailRow
                            icon={Clock}
                            label="Last Updated"
                            value={fmt(req.updatedAt)}
                        />
                        {req.scheduledAt && (
                            <DetailRow
                                icon={CalendarCheck}
                                label="Scheduled"
                                value={fmt(req.scheduledAt)}
                            />
                        )}
                        {req.resolvedAt && (
                            <DetailRow
                                icon={CalendarCheck}
                                label="Resolved"
                                value={fmt(req.resolvedAt)}
                            />
                        )}
                    </dl>
                </DashboardGridItem>
            </div>

            {/* Notes */}
            {req.notes && (
                <DashboardGridItem title="Notes">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                        {req.notes}
                    </p>
                </DashboardGridItem>
            )}
        </div>
    );
}
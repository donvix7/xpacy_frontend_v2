import Link from "next/link";
import {
    AlertTriangle,
    BadgeCheck,
    Building2,
    Calendar,
    CalendarCheck,
    ChevronLeft,
    Clock,
    DoorOpen,
    FileText,
    Tag,
    User,
    Wrench,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import KeyValueDataTable from "@/app/_components/KeyValueDataTable";
import StatusChips from "@/app/_components/StatusChips";
import {
    getMaintenanceById,
    getPropertyById,
    getUserById,
} from "@/app/_lib/data-services";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const fmt = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};

const titleCase = (value) =>
    !value
        ? "—"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const req = await getMaintenanceById(id);
        return {
            title: req?.title ? `${req.title} - Maintenance` : "Maintenance Details",
            description: req?.description || "Maintenance request details",
        };
    } catch {
        return { title: "Maintenance Details" };
    }
}

export default async function MaintenanceDetailsPage({ params }) {
    const { id } = await params;

    const results = await Promise.allSettled([getMaintenanceById(id)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const rawReq = results[0].status === "fulfilled" ? results[0].value : null;
    const req = rawReq?.data ?? rawReq ?? null;

    if (!req || typeof req !== "object") {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/admin/maintenance"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to maintenance
                </Link>
                <EmptyState
                    icon={<Wrench className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Maintenance request not found"
                    message="This maintenance request may have been removed or the link is incorrect."
                />
            </div>
        );
    }

    let property = req.property || null;
    if (!property && req.propertyId) {
        try {
            const p = await getPropertyById(req.propertyId);
            property = p?.data ?? p?.property ?? p ?? null;
        } catch {
            property = null;
        }
    }

    const title = req.title || "Maintenance Request";
    const status = req.status || "OPEN";
    const priority = titleCase(req.priority);
    const category = titleCase(req.category);

    const unitNumber = req.unit?.unitNumber
        ? `Unit ${req.unit.unitNumber}`
        : req.unit?.name || null;

    const propertyName = property?.name || req.property?.name || null;
    const propertyAddress =
        [property?.address, property?.city, property?.country]
            .filter(Boolean)
            .join(", ") || null;

    const formatUser = (u) => {
        if (!u || typeof u !== "object") return null;
        const user = u.data || u.user || u;
        const full = [
            user.firstName || user.firstname || user.first_name,
            user.lastName || user.lastname || user.last_name,
        ]
            .filter(Boolean)
            .join(" ");
        const name = full || user.name || user.username || null;
        if (name && user.email && name !== user.email) return `${name} (${user.email})`;
        return name || user.email || null;
    };

    const resolveUser = async (val, fallbackId) => {
        if (val && typeof val === "object") {
            const label = formatUser(val);
            if (label) return label;
        }
        const idStr =
            typeof val === "string" && val.trim()
                ? val.trim()
                : typeof fallbackId === "string" && fallbackId.trim()
                  ? fallbackId.trim()
                  : null;
        if (!idStr) return null;
        if (!idStr.includes(" ")) {
            try {
                const res = await getUserById(idStr);
                const label = formatUser(res);
                if (label) return label;
            } catch {
                // fallback to raw value
            }
        }
        return idStr;
    };

    const [reportedBy, assignedTo] = await Promise.all([
        resolveUser(req.reportedBy || req.reporter || req.tenantName, req.reportedById),
        resolveUser(req.assignedTo || req.assignee || req.assigneeName, req.assignedToId),
    ]);

    const requestRows = [
        { label: "Title", value: title, icon: Wrench },
        { label: "Category", value: category, icon: Tag },
        { label: "Priority", value: priority, icon: AlertTriangle },
        { label: "Status", value: titleCase(status), icon: BadgeCheck },
        { label: "Description", value: req.description, icon: FileText },
    ];

    const propertyUnitRows = [
        {
            label: "Property",
            value: propertyName,
            icon: Building2,
            href: req.propertyId
                ? `/dashboard/admin/properties/${encodeURIComponent(req.propertyId)}`
                : null,
        },
        { label: "Address", value: propertyAddress, icon: Building2 },
        {
            label: "Unit",
            value: unitNumber,
            icon: DoorOpen,
            href:
                req.propertyId && req.unitId
                    ? `/dashboard/admin/properties/${encodeURIComponent(req.propertyId)}/units/${encodeURIComponent(req.unitId)}`
                    : null,
        },
    ];

    const peopleTimelineRows = [
        { label: "Reported By", value: reportedBy, icon: User },
        { label: "Assigned To", value: assignedTo, icon: User },
        { label: "Reported", value: fmt(req.createdAt), icon: Calendar },
        { label: "Last Updated", value: fmt(req.updatedAt), icon: Clock },
        {
            label: "Scheduled",
            value: req.scheduledAt ? fmt(req.scheduledAt) : null,
            icon: CalendarCheck,
        },
        {
            label: "Resolved",
            value: req.resolvedAt ? fmt(req.resolvedAt) : null,
            icon: CalendarCheck,
        },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/admin/maintenance"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to maintenance
            </Link>

            <HeroBand
                tagline="Maintenance Request"
                title={title}
                description={[category, propertyName].filter(Boolean).join(" · ")}
                actions={<StatusChips status={status} />}
                stats={[
                    { label: "Category", value: category, hint: "Work order type" },
                    { label: "Priority", value: priority, hint: "Severity" },
                    { label: "Reported", value: fmt(req.createdAt), hint: "Date opened" },
                    {
                        label: "Resolved",
                        value: req.resolvedAt ? fmt(req.resolvedAt) : "Pending",
                        hint: "Completion date",
                    },
                ]}
            />

            <DashboardGridItem title="Request Details">
                <KeyValueDataTable rows={requestRows} />
            </DashboardGridItem>

            <DashboardGridItem title="Property & Unit">
                <KeyValueDataTable
                    rows={propertyUnitRows}
                    emptyMessage="No property or unit linked."
                />
            </DashboardGridItem>

            <DashboardGridItem title="People & Timeline">
                <KeyValueDataTable rows={peopleTimelineRows} />
            </DashboardGridItem>

            {req.notes && (
                <DashboardGridItem title="Notes">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                        {req.notes}
                    </p>
                </DashboardGridItem>
            )}
        </div>
    );
}

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
    Home,
    MapPin,
    MessageSquare,
    Pencil,
    Tag,
    User,
    Wallet,
    Wrench,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import KeyValueDataTable from "@/app/_components/KeyValueDataTable";
import StatusChips from "@/app/_components/StatusChips";
import {
    AssignStaffButton,
    AddMaintenanceCommentForm,
} from "@/app/_components/MaintenanceActionControls";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import {
    getOrganizationMembers,
    getUserById,
    getUserProfile,
} from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

const formatDate = (value) => {
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

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

const titleCase = (value) =>
    !value
        ? "—"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

function personLabel(person) {
    if (!person) return null;
    if (typeof person === "string") return person;
    const u = person.data || person.user || person;
    const full = [
        u.firstName || u.firstname || u.first_name,
        u.lastName || u.lastname || u.last_name,
    ]
        .filter(Boolean)
        .join(" ");
    const name = full || u.name || u.username || null;
    if (name && u.email && name !== u.email) return `${name} (${u.email})`;
    return name || u.email || null;
}

const UUID_LIKE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolvePersonLabel(
    value,
    fallbackId = null,
    knownPeople = []
) {
    if (value && typeof value === "object") {
        const label = personLabel(value);
        if (label) return label;
    }
    const candidateId =
        typeof value === "string" && value.trim()
            ? value.trim()
            : value && typeof value === "object" && (value.id || value.userId)
              ? String(value.id || value.userId).trim()
              : typeof fallbackId === "string" && fallbackId.trim()
                ? fallbackId.trim()
                : null;

    if (!candidateId) return null;

    // 1. Check already-fetched known people (current user, org members, property managers/owners)
    for (const p of knownPeople) {
        if (!p || typeof p !== "object") continue;
        const u = p.user || p.profile || p.ownerProfile || p;
        const ids = [p.id, p._id, p.userId, u?.id, u?._id, u?.userId]
            .filter(Boolean)
            .map(String);
        if (ids.includes(candidateId)) {
            const label = personLabel(u) || personLabel(p);
            if (label) return label;
        }
    }

    // 2. Fallback to GET /api/v1/users/:id
    if (UUID_LIKE.test(candidateId) || !candidateId.includes(" ")) {
        try {
            const res = await getUserById(candidateId);
            const user = res?.data ?? res?.user ?? res ?? null;
            const label = personLabel(user);
            if (label) return label;
        } catch {
            // fall back gracefully if user lookup fails
        }
    }
    return candidateId;
}

export default async function MaintenanceDetailsView({
    request,
    property = null,
    propertyId,
    basePath = "/dashboard/property-owner",
    dataErrorMessages = [],
}) {
    const propertyHref = `${basePath}/properties/${propertyId}`;

    if (!request || typeof request !== "object") {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={propertyHref}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to property
                </Link>
                <EmptyState
                    icon={<Wrench className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Maintenance request not found"
                    message="This maintenance request may have been removed or the link is incorrect."
                />
            </div>
        );
    }

    const title = request.title || "Maintenance Request";
    const status = request.status || "OPEN";
    const priority = titleCase(request.priority || "MEDIUM");
    const category = titleCase(request.category || "GENERAL");

    const prop = property || request.property || null;
    const propertyName = prop?.name || prop?.property_name || "Property";
    const propertyAddress =
        [prop?.address, prop?.city, prop?.state, prop?.country]
            .filter(Boolean)
            .join(", ") || null;

    const unitId = request.unit?.id || request.unit?._id || request.unitId || null;
    const unitNumber = request.unit?.unitNumber
        ? `Unit ${request.unit.unitNumber}`
        : request.unit?.name || null;
    const buildingName =
        request.building?.name || request.building?.buildingName || null;

    const orgId =
        prop?.organizationId ||
        prop?.organization_id ||
        request.organizationId ||
        null;

    const [currentUserRes, orgMembersRes] = await Promise.allSettled([
        getUserProfile().catch(() => null),
        orgId ? getOrganizationMembers(orgId).catch(() => []) : Promise.resolve([]),
    ]);

    const currentUser =
        currentUserRes.status === "fulfilled" ? currentUserRes.value : null;
    const orgMembers =
        orgMembersRes.status === "fulfilled" && Array.isArray(orgMembersRes.value)
            ? orgMembersRes.value
            : [];
    const knownPeople = [
        currentUser?.data || currentUser?.user || currentUser,
        ...orgMembers,
        ...(Array.isArray(prop?.managers) ? prop.managers : []),
        ...(Array.isArray(prop?.owners) ? prop.owners : []),
    ].filter(Boolean);

    const [reportedBy, assignedTo] = await Promise.all([
        resolvePersonLabel(
            request.reportedBy ||
                request.reporter ||
                request.createdBy ||
                request.tenantName,
            request.reportedById || request.reporterId || request.userId,
            knownPeople
        ),
        resolvePersonLabel(
            request.assignedTo || request.assignee || request.assigneeName,
            request.assignedToId || request.assigneeId,
            knownPeople
        ),
    ]);

    const estimatedCost =
        request.estimatedCost != null
            ? formatCurrency(request.estimatedCost)
            : "—";
    const actualCost =
        request.actualCost != null ? formatCurrency(request.actualCost) : null;

    const comments = Array.isArray(request.comments) ? request.comments : [];

    const requestRows = [
        { label: "Title", value: title, icon: Wrench },
        { label: "Category", value: category, icon: Tag },
        { label: "Priority", value: priority, icon: AlertTriangle },
        { label: "Status", value: titleCase(status), icon: BadgeCheck },
        { label: "Estimated Cost", value: estimatedCost, icon: Wallet, mono: true },
        { label: "Actual Cost", value: actualCost, icon: Wallet, mono: true },
        { label: "Reported", value: formatDateTime(request.createdAt), icon: Calendar },
        {
            label: "Scheduled",
            value: request.scheduledAt ? formatDateTime(request.scheduledAt) : null,
            icon: CalendarCheck,
        },
        {
            label: "Completed / Resolved",
            value:
                request.completedAt || request.resolvedAt
                    ? formatDateTime(request.completedAt || request.resolvedAt)
                    : null,
            icon: CalendarCheck,
        },
        { label: "Last Updated", value: formatDateTime(request.updatedAt), icon: Clock },
    ];

    const locationRows = [
        {
            label: "Property",
            value: propertyName,
            icon: Home,
            href: propertyHref,
        },
        { label: "Address", value: propertyAddress, icon: MapPin },
        { label: "Building", value: buildingName, icon: Building2 },
        {
            label: "Unit",
            value: unitNumber,
            icon: DoorOpen,
            href: unitId
                ? `${propertyHref}/units/${encodeURIComponent(unitId)}`
                : null,
        },
    ];

    const peopleRows = [
        { label: "Reported By", value: reportedBy, icon: User },
        { label: "Assigned To", value: assignedTo, icon: User },
    ];

    const maintenanceId = request.id || request._id || "";
    const currentDetailsHref = `${propertyHref}/maintenance/${encodeURIComponent(maintenanceId)}`;
    const editHref = `/admin/add-new-maintenance?maintenanceId=${encodeURIComponent(
        maintenanceId
    )}&propertyId=${encodeURIComponent(propertyId)}&returnTo=${encodeURIComponent(
        currentDetailsHref
    )}`;
    const currentAssigneeId =
        typeof request.assignedTo === "string"
            ? request.assignedTo
            : request.assignedTo?.id || request.assignedToId || "";

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={propertyHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to property
            </Link>

            <HeroBand
                tagline="Maintenance Request"
                title={title}
                description={[category, unitNumber, propertyName]
                    .filter(Boolean)
                    .join(" · ")}
                badge={<StatusChips status={status} />}
                actions={
                    maintenanceId ? (
                        <>
                            <AssignStaffButton
                                maintenanceId={maintenanceId}
                                propertyId={propertyId}
                                availableMembers={orgMembers}
                                currentAssigneeId={currentAssigneeId}
                            />
                            <Link
                                href={editHref}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3.5 py-2 text-xs font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Edit Request
                            </Link>
                        </>
                    ) : null
                }
                stats={[
                    { label: "Priority", value: priority, hint: "Severity level" },
                    { label: "Category", value: category, hint: "Work order type" },
                    {
                        label: "Estimated Cost",
                        value: estimatedCost,
                        hint: actualCost ? `Actual: ${actualCost}` : "Budget estimate",
                    },
                    {
                        label: "Reported",
                        value: formatDate(request.createdAt),
                        hint: request.scheduledAt
                            ? `Scheduled ${formatDate(request.scheduledAt)}`
                            : "Date opened",
                    },
                ]}
            />

            <DashboardGridItem title="Request Information">
                <KeyValueDataTable rows={requestRows} />
            </DashboardGridItem>

            <DashboardGridItem title="Property & Location">
                <KeyValueDataTable rows={locationRows} />
            </DashboardGridItem>

            {(reportedBy || assignedTo) && (
                <DashboardGridItem title="People">
                    <KeyValueDataTable rows={peopleRows} />
                </DashboardGridItem>
            )}

            {request.description && (
                <DashboardGridItem title="Description">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                        {request.description}
                    </p>
                </DashboardGridItem>
            )}

            {request.notes && (
                <DashboardGridItem title="Notes">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                        {request.notes}
                    </p>
                </DashboardGridItem>
            )}

            <DashboardGridItem title={`Comments (${comments.length})`}>
                {comments.length === 0 ? (
                    <p className="text-xs text-mute">
                        No comments yet. Add the first update below.
                    </p>
                ) : (
                    <div className="divide-y divide-line">
                        {comments.map((c, idx) => (
                            <div
                                key={c.id || idx}
                                className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-ink">
                                            {personLabel(c.author || c.user) || "Team Member"}
                                        </p>
                                        <span className="font-mono text-[11px] text-mute">
                                            {formatDateTime(c.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 whitespace-pre-line text-sm text-ink">
                                        {c.content || c.comment || c.message || ""}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {maintenanceId && (
                    <AddMaintenanceCommentForm
                        maintenanceId={maintenanceId}
                        propertyId={propertyId}
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}


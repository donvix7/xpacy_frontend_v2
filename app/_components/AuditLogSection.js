import { History } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";

function formatDateTime(value) {
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
}

function titleCase(value) {
    if (!value) return "—";
    return String(value)
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveActorName(log) {
    const actor = log?.actor || log?.user || log?.performedBy || null;
    if (typeof actor === "string" && actor.trim()) return actor.trim();
    if (actor && typeof actor === "object") {
        const full = [
            actor.firstName || actor.firstname || actor.first_name,
            actor.lastName || actor.lastname || actor.last_name,
        ]
            .filter(Boolean)
            .join(" ");
        if (full) return full;
        if (actor.name) return actor.name;
        if (actor.email) return actor.email;
    }
    return (
        log?.actorName ||
        log?.userName ||
        log?.actorEmail ||
        log?.userEmail ||
        "System"
    );
}

function resolveActorEmail(log) {
    const actor = log?.actor || log?.user || log?.performedBy || null;
    if (actor && typeof actor === "object" && actor.email) return actor.email;
    return log?.actorEmail || log?.userEmail || "";
}

function resolveSummary(log) {
    if (typeof log?.description === "string" && log.description.trim()) {
        return log.description.trim();
    }
    if (typeof log?.message === "string" && log.message.trim()) {
        return log.message.trim();
    }
    if (typeof log?.summary === "string" && log.summary.trim()) {
        return log.summary.trim();
    }
    const meta = log?.metadata || log?.details || log?.changes;
    if (meta && typeof meta === "object") {
        const keys = Object.keys(meta).filter((k) => meta[k] !== undefined);
        if (keys.length > 0) {
            return `Updated: ${keys.slice(0, 4).join(", ")}${keys.length > 4 ? "…" : ""}`;
        }
    }
    return "—";
}

function actionBadgeClass(action) {
    const upper = String(action || "").toUpperCase();
    if (upper.includes("CREATE") || upper.includes("ADD") || upper.includes("APPROV")) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50";
    }
    if (upper.includes("DELETE") || upper.includes("REMOVE") || upper.includes("REJECT") || upper.includes("TERMINAT")) {
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50";
    }
    if (upper.includes("UPDATE") || upper.includes("EDIT") || upper.includes("ASSIGN")) {
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50";
    }
    return "bg-soft text-ink border-line";
}

export default function AuditLogSection({
    logs = [],
    title,
    emptyMessage = "No audit log entries recorded yet.",
}) {
    const list = Array.isArray(logs) ? logs : [];
    const heading = title || `Audit Log (${list.length})`;

    const columns = [
        {
            heading: "Action",
            render: (log) => {
                const action = log?.action || log?.event || log?.type || "Activity";
                return (
                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${actionBadgeClass(action)}`}
                    >
                        {titleCase(action)}
                    </span>
                );
            },
        },
        {
            heading: "Resource",
            render: (log) => {
                const entity =
                    log?.entityType || log?.resource || log?.module || log?.targetType || "";
                const targetName =
                    log?.entityName || log?.resourceName || log?.targetName || "";
                return (
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink">
                            {titleCase(entity)}
                        </p>
                        {targetName ? (
                            <p className="truncate text-[11.5px] text-mute">
                                {targetName}
                            </p>
                        ) : null}
                    </div>
                );
            },
        },
        {
            heading: "Performed By",
            render: (log) => {
                const name = resolveActorName(log);
                const email = resolveActorEmail(log);
                return (
                    <div className="min-w-0">
                        <p className="truncate text-xs font-medium capitalize text-ink">
                            {name}
                        </p>
                        {email && email !== name ? (
                            <p className="truncate text-[11px] text-mute">{email}</p>
                        ) : null}
                    </div>
                );
            },
        },
        {
            heading: "Details",
            render: (log) => (
                <span className="block max-w-[280px] truncate text-xs text-mute">
                    {resolveSummary(log)}
                </span>
            ),
        },
        {
            heading: "Timestamp",
            render: (log) => (
                <span className="whitespace-nowrap font-mono text-[11.5px] text-mute">
                    {formatDateTime(log?.createdAt || log?.created_at || log?.timestamp)}
                </span>
            ),
        },
    ];

    return (
        <DashboardGridItem title={heading}>
            {list.length === 0 ? (
                <EmptyState
                    icon={<History className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="No audit activity"
                    message={emptyMessage}
                />
            ) : (
                <DataTable
                    data={list}
                    columns={columns}
                    rowKey={(log, idx) => log?.id || log?._id || `audit-${idx}`}
                    showPagination={list.length > 10}
                    pageSize={10}
                    className="p-0! border-none shadow-none"
                />
            )}
        </DashboardGridItem>
    );
}


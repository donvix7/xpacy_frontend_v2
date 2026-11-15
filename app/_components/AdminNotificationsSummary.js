import { FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";
import { Inbox, Mail, MailOpen, TrendingUp } from "lucide-react";
import { getUnreadNotificationsCount } from "../_lib/data-services";

export default async function AdminNotificationsSummary({ notifications }) {
    const notifList = Array.isArray(notifications)
        ? notifications
        : Array.isArray(notifications?.data)
          ? notifications.data
          : Array.isArray(notifications?.notifications)
            ? notifications.notifications
            : [];

    const counts = {
        total: notifList.length,
        read: notifList.filter((n) => n?.read_at || n?.isRead || n?.is_read)
            .length,
        unread: notifList.filter(
            (n) => !n?.read_at && !n?.isRead && !n?.is_read,
        ).length,
    };

    const unreadRaw = await getUnreadNotificationsCount();
    const unread =
        typeof unreadRaw === "number"
            ? unreadRaw
            : typeof unreadRaw?.count === "number"
              ? unreadRaw.count
              : typeof unreadRaw?.data === "number"
                ? unreadRaw.data
                : counts.unread;

    const readShare =
        counts.total > 0 ? Math.round((counts.read / counts.total) * 100) : 0;

    const tiles = [
        {
            label: "Unread",
            value: unread ?? counts.unread ?? 0,
            icon: <FaEnvelope className="text-white" size={16} />,
            iconBg: "bg-amber-500",
            accent: "from-amber-500 to-amber-300",
        },
        {
            label: "Read",
            value: counts.read ?? 0,
            icon: <FaEnvelopeOpen className="text-white" size={16} />,
            iconBg: "bg-emerald-600",
            accent: "from-emerald-600 to-emerald-400",
        },
    ];

    return (
        <div className="@container flex flex-col gap-4">
            {/* ---------- Header ---------- */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">
                        <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
                        Notifications
                    </div>
                    <span className="text-[11.5px] font-medium text-gray-500">
                        <span className="font-bold tabular-nums text-ink">
                            {counts.total.toLocaleString()}
                        </span>{" "}
                        total
                    </span>
                </div>

                {readShare > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        {readShare}% read
                    </span>
                )}
            </div>

            {/* ---------- Status tiles ---------- */}
            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2">
                {tiles.map((tile) => (
                    <div
                        key={tile.label}
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-4"
                    >
                        <div
                            className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${tile.accent}`}
                        />
                        <div className="relative pl-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 sm:text-[10.5px] sm:tracking-[0.14em]">
                                    {tile.label}
                                </span>
                                <span
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${tile.iconBg} shadow-sm sm:h-7 sm:w-7`}
                                >
                                    {tile.icon}
                                </span>
                            </div>
                            <p className="mt-2 text-[24px] font-bold leading-none tracking-[-0.6px] text-ink tabular-nums sm:text-[28px] sm:tracking-[-0.8px]">
                                {tile.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
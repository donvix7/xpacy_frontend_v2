import { FaBell } from "react-icons/fa";
import Link from "next/link";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { ArrowUpRight, Inbox } from "lucide-react";

const isUnread = (note) =>
    !note.read && !note.is_read && !note.read_at && !note.seen;

const groupLabel = (dateStr) => {
    if (!dateStr) return "Earlier";
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    if (isThisWeek(d)) return "This week";
    return "Earlier";
};

const groupOrder = ["Today", "Yesterday", "This week", "Earlier"];

export default function NotificationsSummary({
    notifications = [],
    showHeading = true,
}) {
    const list = Array.isArray(notifications)
        ? notifications.filter(Boolean)
        : [];
    const recent = list.slice(0, 6);
    const unreadCount = list.filter(isUnread).length;

    const grouped = recent.reduce((acc, note) => {
        const key = groupLabel(note.createdAt);
        (acc[key] ||= []).push(note);
        return acc;
    }, {});

    const orderedGroups = groupOrder.filter((k) => grouped[k]?.length);

    return (
        <div className="@container flex flex-col">
            

            {/* ---------- Empty state ---------- */}
            {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Inbox className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    <p className="text-[12px] font-medium text-gray-400">
                        Nothing here yet
                    </p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                    {orderedGroups.map((groupKey) => (
                        <section key={groupKey} className="pt-3 first:pt-2">
                            {/* Group heading */}
                            <div className="mb-1.5 px-1">
                                <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                    {groupKey}
                                </span>
                            </div>

                            {/* Rows */}
                            <ul className="flex flex-col">
                                {grouped[groupKey].map((note, index) => {
                                    const unread = isUnread(note);
                                    return (
                                        <li
                                            key={note.id || note._id || index}
                                            className="group relative"
                                        >
                                            <Link
                                                href={
                                                    note.href ||
                                                    note.link ||
                                                    "/dashboard/notifications"
                                                }
                                                className="flex items-start gap-3 rounded-md px-2 py-2.5 -mx-1 transition-colors hover:bg-gray-50/80"
                                            >
                                                {/* Unread indicator — thin bar, not a dot */}
                                                <span
                                                    className={`mt-1.5 h-1 w-1 shrink-0 rounded-full transition-colors ${
                                                        unread
                                                            ? "bg-primary-600"
                                                            : "bg-transparent"
                                                    }`}
                                                    aria-hidden="true"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-baseline justify-between gap-3">
                                                        <p
                                                            className={`min-w-0 truncate text-[12.5px] leading-snug ${
                                                                unread
                                                                    ? "font-semibold text-ink"
                                                                    : "font-normal text-gray-700"
                                                            }`}
                                                        >
                                                            {note.title ||
                                                                "Notification"}
                                                        </p>
                                                        <time className="shrink-0 text-[10.5px] font-normal tabular-nums text-gray-400">
                                                            {note.createdAt
                                                                ? format(
                                                                      new Date(
                                                                          note.createdAt,
                                                                      ),
                                                                      "HH:mm",
                                                                  )
                                                                : ""}
                                                        </time>
                                                    </div>
                                                    {note.message && (
                                                        <p className="mt-0.5 line-clamp-1 text-[11.5px] leading-relaxed text-gray-500">
                                                            {note.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
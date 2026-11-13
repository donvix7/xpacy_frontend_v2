import { FaEnvelopeOpen, FaEnvelope } from "react-icons/fa";
import { getUnreadNotificationsCount } from "../_lib/data-services";
import SummaryItemCard from "./SummaryItemCard";

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
        read: notifList.filter(n => n?.read_at || n?.isRead || n?.is_read).length,
        unread: notifList.filter(n => !n?.read_at && !n?.isRead && !n?.is_read).length,
    };

    const unreadRaw = await getUnreadNotificationsCount();
    const unread = typeof unreadRaw === "number"
        ? unreadRaw
        : (typeof unreadRaw?.count === "number"
            ? unreadRaw.count
            : (typeof unreadRaw?.data === "number" ? unreadRaw.data : counts.unread));

    const summaryItems = [
        {
            title: "Unread",
            count: unread ?? counts.unread ?? 0,
            icon: <FaEnvelope className="text-orange-500" />,
            color: 'bg-orange-100',
            bgColor: 'bg-orange-100',
        },
        {
            title: "Read",
            count: counts.read ?? 0,
            icon: <FaEnvelopeOpen className="text-emerald-500" />,
            bgColor: 'bg-emerald-100',
            color: 'text-emerald-500',
        }
    ];

    return (
        <div className="flex flex-col gap-4">

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Headline figure */}
                <div className="col-span-1 md:col-span-3 flex flex-col justify-center gap-1.5">
                    <span className="text-sm font-medium text-mute">Total Notifications</span>
                    <p className="text-[42px] font-semibold leading-none tracking-[-1.5px] text-ink tabular-nums sm:text-[52px]">{counts.total}</p>
                    <span className="text-[13.5px] text-mute">Across all users and organizations</span>
                </div>

                 {/* Grid Items */}
                 <div className=" col-span-1 md:col-span-2 grid grid-cols-2 gap-4 flex-2">
                    {summaryItems.map((item, index) => (
                        <SummaryItemCard key={index} label={item.title} value={item.count ?? 0} icon={item.icon} iconBackground={item.bgColor || item.color} />
                    ))}
                </div>
            </div>
        </div>
    );
}

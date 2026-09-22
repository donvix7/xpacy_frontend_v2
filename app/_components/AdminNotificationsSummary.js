import { FaBell, FaEnvelopeOpen, FaEnvelope } from "react-icons/fa";
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
        <div className="flex flex-col gap-4 rounded-lg bg-white ">
          

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Main Hero Card */}
                <div className="col-span-1 md:col-span-3 flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white min-w-[250px] flex-1 justify-center">
                    <div className="relative z-20 flex flex-col lg:items-start items-center lg:w-max">
                        <div className="flex gap-3 items-center">
                            <span className="w-12 h-12 text-primary bg-primary-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-sm">
                                <FaBell />
                            </span>
                            <span className="font-mono text-primary-900 font-bold uppercase tracking-wide text-sm">Total Notifications</span>
                        </div>
                        <p className="text-center lg:text-left font-bold text-4xl font-mono mt-4 lg:ml-[60px] text-gray-800">{counts.total}</p>
                    </div>

                    {/* Decorative Background Circles */}
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[10%] -right-[70%] lg:-top-4 -top-10 bg-primary-700 z-10 opacity-90 transition-transform duration-700 hover:scale-105"></div>
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[2%] -right-[65%] top-6 bg-[#73A0BE] z-0 opacity-70 transition-transform duration-700 hover:-translate-x-2"></div>
                </div>

                 {/* Grid Items */}
                 <div className=" col-span-1 md:col-span-2 grid grid-cols-2 gap-4 flex-2">
                    {summaryItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl border border-primary-200  p-6 duration-300 flex justify-between ">
                            <div className="flex flex-col gap-2">
                                <p className="text-gray-600 text-sm capitalize">{item.title}</p>
                                <p className="text-2xl font-bold mt-1">{(item.count ?? 0).toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                                {item.icon}
                            </div>
                </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

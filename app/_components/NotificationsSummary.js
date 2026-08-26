import { FaBell } from "react-icons/fa";
import Link from "next/link";
import { format } from "date-fns";
import EmptyState from "./EmptyState";

export default function NotificationsSummary({ notifications }) {
    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="flex flex-col gap-4 rounded-lg bg-white">
         
            
            {recentNotifications.length === 0 ? (
                <div className="text-gray-500 text-center text-sm py-4">  <EmptyState message="No new notifications." /></div>
            ) : (
                <div className="flex flex-col gap-3">
                    {recentNotifications.map((note, index) => (
                        <div key={index} className="flex flex-col gap-1 p-3 rounded-lg bg-gray-50 border border-primary-100 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-semibold text-gray-800">{note.title || "Notification"}</span>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {note.createdAt ? format(new Date(note.createdAt), "MMM dd, HH:mm") : ""}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{note.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

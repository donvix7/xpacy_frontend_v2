import { Timer, Users, TrendingUp, Wrench } from "lucide-react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";

const getServiceStatus = (service) =>
    String(service?.service_status || service?.status || "").toLowerCase();

export default function ServicesSummary({
    services = [],
    serviceProviders = [],
    showHeading = true,
}) {
    const serviceList = Array.isArray(services) ? services.filter(Boolean) : [];
    const providers = Array.isArray(serviceProviders)
        ? serviceProviders.filter(Boolean)
        : [];

    const counts = {
        total: serviceList.length,
        pending: serviceList.filter((s) => getServiceStatus(s) === "pending").length,
        inProgress: serviceList.filter((s) => getServiceStatus(s) === "in-progress").length,
        completed: serviceList.filter((s) => getServiceStatus(s) === "completed").length,
        cancelled: serviceList.filter((s) => getServiceStatus(s) === "cancelled").length,
    };

    const completionRate =
        counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

    const tiles = [
        {
            label: "Providers",
            value: providers.length,
            icon: <Users className="text-white" size={16} />,
            iconBg: "bg-primary-600",
            accent: "from-primary-600 to-primary-400",
        },
        {
            label: "Completed",
            value: counts.completed,
            icon: <FaCheckCircle className="text-white" size={16} />,
            iconBg: "bg-emerald-600",
            accent: "from-emerald-600 to-emerald-400",
        },
        {
            label: "In Progress",
            value: counts.inProgress,
            icon: <FaSpinner className="text-white" size={16} />,
            iconBg: "bg-amber-500",
            accent: "from-amber-500 to-amber-300",
        },
        {
            label: "Pending",
            value: counts.pending,
            icon: <Timer className="text-white" size={16} />,
            iconBg: "bg-sky-600",
            accent: "from-sky-600 to-sky-400",
        },
        {
            label: "Cancelled",
            value: counts.cancelled,
            icon: <IoCloseCircleOutline className="text-white" size={16} />,
            iconBg: "bg-red-600",
            accent: "from-red-600 to-red-400",
        },
    ];

    return (
        <div className="@container flex flex-col gap-4">
            {showHeading && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">
                            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                            Service Requests
                        </div>
                        <span className="text-[11.5px] font-medium text-gray-500">
                            <span className="font-bold tabular-nums text-ink">
                                {counts.total.toLocaleString()}
                            </span>{" "}
                            raised
                        </span>
                    </div>
                    {completionRate > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            <TrendingUp className="h-3 w-3" aria-hidden="true" />
                            {completionRate}% completed
                        </span>
                    )}
                </div>
            )}

            {/* 5 tiles — 1 col narrow, 2 col medium, 5 col wide */}
            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @3xl:grid-cols-5">
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
import { Building2, TrendingUp } from "lucide-react";
import { FaHome, FaCheckCircle, FaTag, FaHandshake } from "react-icons/fa";
import SummaryItemCard from "./SummaryItemCard";

export default function PropertiesSummary({
    properties,
    totalProperties,
    showHeading = true,
}) {
    const total = totalProperties || properties.length;

    const counts = {
        shortlet: properties.filter((p) => p.property_status?.toLowerCase() === "shortlet").length,
        rented: properties.filter((p) => p.property_status?.toLowerCase() === "rent").length,
        featured: properties.filter((p) => p.featured || p.isFeatured || p.is_featured).length,
        available: properties.filter((p) =>
            ["active", "available", "vacant"].includes(p.availability_status?.toLowerCase())
        ).length,
    };

    const occupied = counts.rented + counts.shortlet;
    const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0;

    const tiles = [
        {
            label: "Shortlet",
            value: counts.shortlet,
            icon: <FaHome className="text-white" size={16} />,
            iconBg: "bg-primary-600",
            accent: "from-primary-600 to-primary-400",
        },
        {
            label: "Rented",
            value: counts.rented,
            icon: <FaHandshake className="text-white" size={16} />,
            iconBg: "bg-emerald-600",
            accent: "from-emerald-600 to-emerald-400",
        },
        {
            label: "Featured",
            value: counts.featured,
            icon: <FaTag className="text-white" size={16} />,
            iconBg: "bg-amber-500",
            accent: "from-amber-500 to-amber-300",
        },
        {
            label: "Available",
            value: counts.available,
            icon: <FaCheckCircle className="text-white" size={16} />,
            iconBg: "bg-slate-700",
            accent: "from-slate-700 to-slate-400",
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {showHeading && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Portfolio
                    </div>
                    {occupancy > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            <TrendingUp className="h-3 w-3" aria-hidden="true" />
                            {occupancy}% occupied
                        </span>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_2fr]">
                {/* ---------- Hero total card ---------- */}
                <div className="relative overflow-hidden rounded-xl border-2 border-primary-800 bg-gradient-to-br from-primary-800 via-primary-900 to-ink p-5 shadow-lg">
                    {/* Subtle radial glow */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-400/20 blur-3xl" />

                    <div className="relative">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/20">
                            <Building2 className="h-3 w-3" aria-hidden="true" />
                            Total
                        </span>
                        <p className="mt-3 text-[46px] font-bold leading-none tracking-[-1.8px] text-white tabular-nums">
                            {total.toLocaleString()}
                        </p>
                        <p className="mt-1.5 text-[12.5px] font-medium text-primary-100/90">
                            properties in your portfolio
                        </p>
                    </div>

                    <div className="relative mt-4 flex items-center gap-2 border-t border-white/20 pt-3 text-[11.5px]">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        <span className="font-bold tabular-nums text-white">{occupied}</span>
                        <span className="text-primary-100/80">currently listed</span>
                    </div>
                </div>

                {/* ---------- 2×2 high-contrast tiles ---------- */}
                <div className="grid grid-cols-2 gap-3">
                    {tiles.map((tile) => (
                        <div
                            key={tile.label}
                            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                        >
                            {/* Left accent bar */}
                            <div
                                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${tile.accent}`}
                            />

                            <div className="relative pl-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                        {tile.label}
                                    </span>
                                    <span
                                        className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${tile.iconBg} shadow-sm`}
                                    >
                                        {tile.icon}
                                    </span>
                                </div>
                                <p className="mt-2 text-[28px] font-bold leading-none tracking-[-0.8px] text-ink tabular-nums">
                                    {tile.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
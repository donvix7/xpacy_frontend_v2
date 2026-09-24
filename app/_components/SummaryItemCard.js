import { getSummaryVisual } from "./summaryVisuals";

export default function SummaryItemCard({
    label,
    value,
    icon,
    iconBackground = "bg-primary-100",
    className = "",
}) {
    const visual = getSummaryVisual(label);
    return (
        <article className={`flex min-w-0 items-start justify-between gap-3 rounded-xl border border-primary-200 bg-white p-4 shadow-sm transition-shadow sm:p-5 ${className}`}>
            <div className="min-w-0 h-full flex flex-col justify-between">
                <p className=" text-xs text-gray-600 sm:text-sm">{label}</p>
                <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">{typeof value === "number" ? value.toLocaleString() : value}</p>
            </div>
            {(visual?.icon || icon) && (
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl sm:h-11 sm:w-11 ${visual?.background || iconBackground}`}>
                    {visual?.icon || icon}
                </span>
            )}
        </article>
    );
}

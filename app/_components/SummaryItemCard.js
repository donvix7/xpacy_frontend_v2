import { getSummaryVisual } from "./summaryVisuals";

export default function SummaryItemCard({
    label,
    value,
    icon,
    iconBackground = "bg-soft",
    meta,
    accent,
    className = "",
}) {
    const visual = getSummaryVisual(label);
    const displayValue = typeof value === "number" ? value.toLocaleString() : value;

    return (
        <article className={`relative flex min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-white p-4 sm:p-6 ${className}`}>
            {accent ? <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} /> : null}
            <div className="flex items-center justify-between gap-3 text-mute">
                <span className="min-w-0 truncate text-sm font-medium">{label}</span>
                {(visual?.icon || icon) && (
                    <span
                        className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full ${
                            visual?.background || iconBackground
                        }`}
                    >
                        {visual?.icon || icon}
                    </span>
                )}
            </div>
            <p className="text-[28px] font-semibold leading-none tracking-[-0.8px] text-ink tabular-nums sm:text-[34px]">
                {displayValue}
            </p>
            {meta ? <p className="text-[12.5px] leading-snug text-mute">{meta}</p> : null}
        </article>
    );
}

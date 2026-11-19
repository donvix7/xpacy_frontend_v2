import { getSummaryVisual } from "./summaryVisuals";

export default function SummaryItemCard({
    label,
    value,
    icon,
    iconBackground = "bg-soft",
    meta,
    accent,
    className = "",
    href,
}) {
    const visual = getSummaryVisual(label);
    const resolvedIcon = visual?.icon || icon;
    const resolvedIconBg = visual?.background || iconBackground;

    const displayValue =
        typeof value === "number"
            ? value.toLocaleString()
            : value ?? "—";

    const Wrapper = href ? "a" : "div";
    const wrapperProps = href ? { href } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`group relative flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-line bg-white p-4 transition-all duration-200  hover:border-primary-200 ßhover:shadow-md hover:shadow-primary-500/5 sm:p-5 ${className}`}
        >
            {/* Accent bar */}
            {accent ? (
                <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[3px] ${accent}`}
                />
            ) : null}

            {/* Header: label + icon */}
            <div className="flex items-center justify-between gap-3">
                <span className="min-w-0  text-[12.5px] font-medium uppercase tracking-[0.08em] text-mute">
                    {label}
                </span>
                {resolvedIcon && (
                    <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 ${resolvedIconBg}`}
                        aria-hidden="true"
                    >
                        {resolvedIcon}
                    </span>
                )}
            </div>

            {/* Value */}
            <p className="font-sans text-[22px] font-semibold leading-none tracking-[-0.6px] text-ink tabular-nums sm:text-[24px]">
                {displayValue}
            </p>

            {/* Meta */}
            {meta ? (
                <p className="text-[12px] leading-snug text-mute">{meta}</p>
            ) : null}
        </Wrapper>
    );
}
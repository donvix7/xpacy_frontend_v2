const TONES = {
    blue: { chip: "bg-blue-100 text-blue-700", accent: "bg-blue-500" },
    violet: { chip: "bg-violet-100 text-violet-700", accent: "bg-violet-500" },
    amber: { chip: "bg-amber-100 text-amber-700", accent: "bg-amber-500" },
    emerald: { chip: "bg-emerald-100 text-emerald-700", accent: "bg-emerald-500" },
    rose: { chip: "bg-rose-100 text-rose-700", accent: "bg-rose-500" },
    slate: { chip: "bg-slate-100 text-slate-700", accent: "bg-slate-400" },
};

/**
 * A dashboard section with a coloured accent line, icon chip, title/subtitle and
 * an optional action link. Used to give overview pages a sectional rhythm.
 */
export default function OverviewPanel({
    title,
    subtitle,
    icon,
    tone = "blue",
    action,
    className = "",
    contentClassName = "p-4 sm:p-5",
    children,
}) {
    const tones = TONES[tone] || TONES.blue;

    return (
        <section className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white ${className}`}>
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[3px] ${tones.accent}`} />
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tones.chip}`}>{icon}</span>
                    <div className="min-w-0">
                        <h2 className="truncate text-[15px] font-semibold text-ink">{title}</h2>
                        {subtitle ? <p className="truncate text-[12px] leading-5 text-mute">{subtitle}</p> : null}
                    </div>
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </header>
            <div className={`min-w-0 flex-1 ${contentClassName}`}>{children}</div>
        </section>
    );
}

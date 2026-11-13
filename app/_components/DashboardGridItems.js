import Link from "next/link";


export default function DashboardGridItem({ children, viewAllLink, title }) {

    return (
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-lg font-semibold text-ink">{title}</p>
                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="shrink-0 rounded-lg border-[1.5px] border-ink px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-soft"
                    >
                        View all
                    </Link>
                )}
            </div>
            {title === "Saved Properties" ? <div className="overflow-x-scroll no-scrollbar">{children}</div> : children}
        </div>
    )
}

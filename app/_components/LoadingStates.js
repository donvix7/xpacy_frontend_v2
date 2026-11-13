/**
 * Shared loading states.
 *
 * Every route-level `loading.js` renders one of these so the whole app waits
 * with the same executive surface language used by the auth/proceed screens:
 * a canvas background, card surfaces and softly pulsing `bg-soft` blocks.
 */

export function Skeleton({ className = "" }) {
    return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-soft ${className}`} />;
}

/** Centered card skeleton — matches the log in / sign up / proceed screens. */
export function AuthPageSkeleton() {
    return (
        <main
            role="status"
            aria-live="polite"
            aria-label="Loading page"
            className="xp-auth flex min-h-dvh w-full items-center justify-center bg-canvas px-4 py-10 md:px-6"
        >
            <div className="xp-auth-card flex w-full max-w-[460px] flex-col gap-6 p-6 sm:p-9">
                <Skeleton className="mx-auto h-8 w-[156px]" />
                <Skeleton className="mx-auto h-7 w-48" />
                <Skeleton className="mx-auto h-4 w-64" />
                <div className="mt-2 flex flex-col gap-4">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
            </div>
            <span className="sr-only">Loading…</span>
        </main>
    );
}

/** Compact centered card — used by public pages (search, marketing). */
export function PageSkeleton() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading page"
            className="xp-surface flex min-h-dvh w-full items-center justify-center bg-canvas px-4 py-10"
        >
            <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border border-line bg-card p-6 shadow-xl shadow-side/5">
                <Skeleton className="mx-auto h-8 w-[148px]" />
                <Skeleton className="mx-auto h-4 w-56" />
                <Skeleton className="mt-2 h-24 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <span className="sr-only">Loading…</span>
        </div>
    );
}

/**
 * Dashboard skeleton mirroring the overview layout: hero band, KPI row and a
 * 12-column section grid. Rendered inside the dashboard layout, so the sidebar
 * and header stay interactive while the page streams in.
 */
export function DashboardPageSkeleton() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading dashboard"
            className="flex flex-col gap-5 p-2"
        >
            {/* Hero band */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side p-5 sm:p-7">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="flex w-full max-w-md flex-col gap-3">
                            <Skeleton className="h-3 w-44 bg-white/20" />
                            <Skeleton className="h-7 w-64 bg-white/25" />
                            <Skeleton className="h-3 w-72 bg-white/15" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-36 rounded-lg bg-white/15" />
                            <Skeleton className="h-10 w-32 rounded-lg bg-white/25" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Array.from({ length: 4 }, (_, index) => (
                            <Skeleton key={index} className="h-[86px] rounded-xl bg-white/10" />
                        ))}
                    </div>
                </div>
            </section>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }, (_, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-6"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-[42px] w-[42px] rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                ))}
            </div>

            {/* Section grid */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                {[
                    "xl:col-span-8",
                    "xl:col-span-4",
                    "xl:col-span-8",
                    "xl:col-span-4",
                ].map((span, index) => (
                    <div
                        key={index}
                        className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white ${span}`}
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-3.5 w-36" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-7 w-20 rounded-lg" />
                        </div>
                        <div className="flex flex-col gap-3 p-4 sm:p-5">
                            {Array.from({ length: 5 }, (_, row) => (
                                <div key={row} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <span className="sr-only">Loading…</span>
        </div>
    );
}

import SidebarLogo from "@/app/_components/SidebarLogo";
import SidebarNav from "@/app/_components/SidebarNav";
import SidebarHeader from "@/app/_components/SidebarHeader";
import MobileNav from "@/app/_components/MobileNav";
import { Suspense } from "react";

export default function Layout({ children }) {
    return (
        <div className="xp-dashboard grid h-dvh min-w-0 grid-cols-1 overflow-hidden bg-canvas lg:grid-cols-[265px_minmax(0,1fr)]">
            {/* ---------- Sidebar (desktop only) ---------- */}
            <aside className="hidden h-full min-h-0 flex-col gap-6 overflow-y-auto bg-side px-4 py-7 lg:flex">
                <SidebarLogo />
                <SidebarNav role="admin" />
                <Suspense fallback={<div className="h-8 w-8" />}>
                    <MobileNav />
                </Suspense>
            </aside>

            {/* ---------- Main column ---------- */}
            <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                {/* Header — fixed height, never overlaps */}
                <header className="shrink-0">
                    <SidebarHeader role="admin" />
                </header>

                {/* Scrollable content — fills remaining height */}
                <div className="relative z-0 min-h-0 flex-1 overflow-y-auto bg-canvas">
                    {children}
                </div>
            </main>
        </div>
    );
}
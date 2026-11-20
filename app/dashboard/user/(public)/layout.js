import SidebarLogo from "@/app/_components/SidebarLogo";
import SidebarNav from "@/app/_components/SidebarNav";
import SidebarHeader from "@/app/_components/SidebarHeader";
import MobileNav from "@/app/_components/MobileNav";
import { Suspense } from "react";

export default function Layout({ children }) {
    return (
        <div className="xp-dashboard grid h-dvh grid-cols-1 grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[265px_1fr] lg:grid-rows-[auto_1fr]">
            {/* ---------- Sidebar (desktop only) ---------- */}
            {/* Column 1, spans both rows on desktop. Hidden on mobile. */}
            <aside className="hidden h-full min-h-0 flex-col gap-6 overflow-y-auto bg-side px-4 py-7 lg:col-start-1 lg:row-span-2 lg:flex">
                <SidebarLogo />
                <SidebarNav />
                <Suspense fallback={<div className="h-8 w-8" />}>
                    <MobileNav />
                </Suspense>
            </aside>

            {/* ---------- Header ---------- */}
            {/* Row 1, column 2 on desktop (right of sidebar). Row 1, column 1 on mobile (full width). */}
            <header className="min-w-0 lg:col-start-2 lg:row-start-1">
                <SidebarHeader />
            </header>

            {/* ---------- Main content ---------- */}
            {/* Row 2, column 2 on desktop. Row 2, column 1 on mobile. Scrolls internally. */}
            <main className="min-h-0 min-w-0 overflow-y-auto bg-canvas lg:col-start-2 lg:row-start-2">
                {children}
            </main>
        </div>
    );
}
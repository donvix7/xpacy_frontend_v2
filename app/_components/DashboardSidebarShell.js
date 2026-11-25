"use client";

import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";

const STORAGE_KEY = "xpacy-sidebar-collapsed";

export default function DashboardSidebarShell({
    role = "user",
    isOrganizationAdmin = false,
    header,
    children,
}) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved === "1") setCollapsed(true);
        } catch {
            // ignore storage errors
        }
    }, []);

    const toggleSidebar = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
            } catch {
                // ignore storage errors
            }
            return next;
        });
    };

    return (
        <div className="xp-dashboard flex h-dvh min-w-0 overflow-hidden bg-canvas">
            {/* Desktop Sidebar */}
            <aside
                style={{ width: collapsed ? "72px" : "265px" }}
                className={`hidden h-full min-h-0 shrink-0 flex-col gap-5 overflow-x-hidden overflow-y-auto bg-side py-6 transition-[width,padding] duration-200 ease-in-out lg:flex ${
                    collapsed ? "items-center px-2" : "px-4"
                }`}
            >
                <div
                    className={`flex w-full items-center gap-2 ${
                        collapsed ? "justify-center" : "justify-between"
                    }`}
                >
                    {!collapsed ? (
                        <div className="min-w-0 overflow-hidden">
                            <SidebarLogo />
                        </div>
                    ) : null}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-expanded={!collapsed}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-side-ink transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
                    >
                        {collapsed ? (
                            <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                </div>

                <SidebarNav
                    role={role}
                    isOrganizationAdmin={isOrganizationAdmin}
                    collapsed={collapsed}
                />
            </aside>

            {/* Right Column: Header + Scrollable Content */}
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0">{header}</header>
                <main className="relative z-0 min-h-0 flex-1 overflow-y-auto bg-canvas">
                    {children}
                </main>
            </div>
        </div>
    );
}

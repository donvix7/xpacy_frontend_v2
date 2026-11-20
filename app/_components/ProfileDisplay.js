"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { MdKeyboardArrowDown, MdOutlineDashboardCustomize } from "react-icons/md";
import { RiUserSettingsLine } from "react-icons/ri";
import { TbLogout2 } from "react-icons/tb";
import { handleLogOut } from "../_lib/action";

export default function ProfileDisplay({ role = "user", profile, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, startLogoutTransition] = useTransition();
    const containerRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();

    // Auto-close dropdown whenever the route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const dashboardBaseByRole = {
        admin: "/dashboard/admin",
        "property-owner": "/dashboard/property-owner",
        "property-manager": "/dashboard/property-manager",
        "facility-manager": "/dashboard/facility-manager",
        user: "/dashboard/user",
    };
    const normalizedRole = String(role || "").toLowerCase().replace(/[\s_-]/g, "");
    const dashboardHref =
        dashboardBaseByRole[normalizedRole] ||
        dashboardBaseByRole[role?.toLowerCase?.()] ||
        "/dashboard/user";

    const profileSettingsHref =
        {
            "property-manager": "/dashboard/property-manager/settings",
            propertymanager: "/dashboard/property-manager/settings",
            "facility-manager": "/dashboard/facility-manager/settings",
            facilitymanager: "/dashboard/facility-manager/settings",
        }[normalizedRole] || `${dashboardHref}/profile-settings`;

    const displayName =
        [profile?.first_name || profile?.firstName, profile?.last_name || profile?.lastName]
            .filter(Boolean)
            .join(" ") ||
        profile?.name ||
        profile?.full_name ||
        profile?.email ||
        "Account";

    const displayRole = (role || profile?.role || "user")
        .replace(/[\s_-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const avatarSrc = profile?.display_picture
        ? profile.display_picture.startsWith("http")
            ? profile.display_picture
            : `https://app.xpacy.com/src/upload/display_img/${profile.display_picture}`
        : "/avatar.png";

    // Close when clicking outside or pressing Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (isLoggingOut) return;
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (isLoggingOut) return;
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isLoggingOut]);

    const handleNavigate = (href) => {
        setIsOpen(false);
        router.push(href);
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        startLogoutTransition(async () => {
            try {
                await handleLogOut();
            } catch (err) {
                if (err?.digest?.includes("NEXT_REDIRECT") || err?.message?.includes("NEXT_REDIRECT")) {
                    throw err;
                }
                console.error("Logout failed:", err);
            } finally {
                window.location.href = "/auth/log-in";
            }
        });
    };

    return (
        <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
            {/* Trigger Button with Active State */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="User profile menu"
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl border py-1.5 px-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-side-active/40 ${
                    isOpen
                        ? "border-side-active bg-soft text-ink ring-2 ring-side-active/20 shadow-sm"
                        : "border-line bg-card text-ink hover:bg-soft shadow-xs"
                }`}
            >
                <div className="relative h-7 w-7 overflow-hidden rounded-full border border-line bg-soft">
                    <Image
                        unoptimized
                        src={avatarSrc}
                        alt="Profile avatar"
                        fill
                        className="rounded-full object-cover"
                    />
                </div>
                <span
                    className={`text-xl transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-ink" : "text-mute"
                    }`}
                >
                    <MdKeyboardArrowDown aria-hidden="true" />
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    role="menu"
                    aria-label="Profile options"
                    className="absolute right-0 top-full mt-2 z-[100] flex w-56 flex-col gap-1 rounded-xl border border-line bg-card p-1.5 text-ink shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                >
                    {/* User summary header */}
                    <div className="border-b border-line px-3 py-2 text-left">
                        <p className="truncate text-sm font-semibold text-ink">
                            {displayName}
                        </p>
                        <p className="truncate font-mono text-[11px] text-mute">
                            {displayRole}
                        </p>
                    </div>

                    {/* Dashboard */}
                    <button
                        type="button"
                        onClick={() => handleNavigate(dashboardHref)}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-mono text-[13px] text-mute transition-colors hover:bg-soft hover:text-ink"
                    >
                        <span className="text-base text-side-active">
                            <MdOutlineDashboardCustomize />
                        </span>
                        <span>Dashboard</span>
                    </button>

                    {/* Profile settings */}
                    <button
                        type="button"
                        onClick={() => handleNavigate(profileSettingsHref)}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-mono text-[13px] text-mute transition-colors hover:bg-soft hover:text-ink"
                    >
                        <span className="text-base text-side-active">
                            <RiUserSettingsLine />
                        </span>
                        <span>Profile settings</span>
                    </button>

                    <div className="my-1 border-t border-line" />

                    {/* Log out */}
                    <button
                        type="button"
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-mono text-[13px] text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400"
                    >
                        <span className="text-base shrink-0">
                            {isLoggingOut ? (
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            ) : (
                                <TbLogout2 />
                            )}
                        </span>
                        <span>{isLoggingOut ? "Logging out…" : "Log out"}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import Logo from "@/app/_components/Logo";
import BackBtn from "@/app/_components/BackBtn";
import ThemeToggle from "@/app/_components/ThemeToggle";

export default function AdminHeader({ title = "Admin Console", backHref = "/dashboard/admin" }) {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card px-4 py-3 shadow-[0_1px_2px_rgba(31,58,82,0.05)] sm:px-6 md:px-8 lg:py-4">
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Logo />
                    <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
                    <span className="hidden text-[12.5px] font-medium text-mute sm:block">
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <ThemeToggle />
                    <BackBtn fallbackHref={backHref} />
                </div>
            </div>
        </header>
    );
}


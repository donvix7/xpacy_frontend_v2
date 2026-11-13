"use client";

import { useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

const STORAGE_KEY = "xpacy-theme";

function getInitialTheme() {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeToggle({ className = "" }) {
    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTheme(getInitialTheme());
        setMounted(true);
    }, []);

    const isDark = theme === "dark";

    function toggleTheme() {
        const next = isDark ? "light" : "dark";
        setTheme(next);
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Storage can be unavailable in private mode; the in-memory theme still applies.
        }
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink transition-colors hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-side-active/40 ${className}`}
        >
            {mounted && isDark ? <LuSun className="h-[18px] w-[18px]" /> : <LuMoon className="h-[18px] w-[18px]" />}
        </button>
    );
}

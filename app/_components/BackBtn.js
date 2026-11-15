"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackBtn({ fallbackHref, className = "" }) {
    const router = useRouter();
    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else if (fallbackHref) {
            router.push(fallbackHref);
        } else {
            router.back();
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className={`inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-side-active/40 ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
        </button>
    );
}

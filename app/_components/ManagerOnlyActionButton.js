"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, X, ArrowUpRight } from "lucide-react";

export default function ManagerOnlyActionButton({
    children,
    className = "",
    actionLabel = "make changes to properties",
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-disabled="true"
                title="Log in to the Manager Dashboard to make changes to properties"
                onClick={() => setOpen(true)}
                className={`${className} opacity-55 cursor-not-allowed`}
            >
                {children}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Manager Dashboard Required
                                    </h3>
                                    <p className="text-xs text-mute">
                                        View-only access on Property Owner dashboard
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-soft/60 p-3.5 text-xs leading-relaxed text-ink">
                            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <p>
                                Please log in to the{" "}
                                <span className="font-semibold">Manager Dashboard</span>{" "}
                                to {actionLabel}.
                            </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                Close
                            </button>
                            <Link
                                href="/auth/log-in?redirectUrl=%2Fdashboard%2Fproperty-manager%2Fproperties"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                            >
                                <span>Log in to Manager Dashboard</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


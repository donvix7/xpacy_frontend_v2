"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Ban, Loader2, X } from "lucide-react";
import { activateLease, terminateLease } from "@/app/_lib/action";

export default function LeaseStatusControls({
    leaseId,
    propertyId,
    organizationId = null,
    leaseNumber = "this lease",
    currentStatus = "DRAFT",
}) {
    const router = useRouter();
    const [status, setStatus] = useState(
        String(currentStatus || "").toUpperCase()
    );
    const [pendingAction, setPendingAction] = useState(null); // "activate" | "terminate" | null
    const [confirmTerminate, setConfirmTerminate] = useState(false);

    const isActive = status === "ACTIVE";
    const isTerminated = status === "TERMINATED";

    const runAction = (actionType, fn, loadingText, nextStatus) => {
        if (!leaseId || pendingAction) return;
        setPendingAction(actionType);
        toast.promise(fn(leaseId, organizationId, propertyId), {
            loading: loadingText,
            success: (res) => {
                setPendingAction(null);
                if (!res?.success) {
                    throw new Error(
                        res?.message || `Failed to ${actionType} lease.`
                    );
                }
                setStatus(nextStatus);
                setConfirmTerminate(false);
                router.refresh();
                return (
                    res?.message ||
                    `Lease ${nextStatus.toLowerCase()} successfully!`
                );
            },
            error: (err) => {
                setPendingAction(null);
                return err?.message || `Failed to ${actionType} lease.`;
            },
        });
    };

    return (
        <>
            {!isActive && (
                <button
                    type="button"
                    disabled={Boolean(pendingAction)}
                    onClick={() =>
                        runAction(
                            "activate",
                            activateLease,
                            "Activating lease...",
                            "ACTIVE"
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/20 px-3.5 py-2 text-[12.5px] font-medium text-emerald-100 backdrop-blur-sm transition-colors hover:bg-emerald-500/35 cursor-pointer disabled:opacity-50"
                >
                    {pendingAction === "activate" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>Activate</span>
                </button>
            )}

            {!isTerminated && (
                <button
                    type="button"
                    disabled={Boolean(pendingAction)}
                    onClick={() => setConfirmTerminate(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-400/35 bg-rose-500/20 px-3.5 py-2 text-[12.5px] font-medium text-rose-100 backdrop-blur-sm transition-colors hover:bg-rose-500/35 cursor-pointer disabled:opacity-50"
                >
                    {pendingAction === "terminate" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>Terminate</span>
                </button>
            )}

            {confirmTerminate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !pendingAction && setConfirmTerminate(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                                    <Ban className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Terminate Lease
                                    </h3>
                                    <p className="text-xs text-mute">
                                        This ends the tenancy agreement immediately.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() => setConfirmTerminate(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 rounded-xl border border-line bg-soft/60 p-3.5 text-xs text-ink">
                            Are you sure you want to terminate{" "}
                            <span className="font-semibold">{leaseNumber}</span>?
                            The lease status will be updated to terminated.
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
                            <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() => setConfirmTerminate(false)}
                                className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() =>
                                    runAction(
                                        "terminate",
                                        terminateLease,
                                        "Terminating lease...",
                                        "TERMINATED"
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-60"
                            >
                                {pendingAction === "terminate" ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                )}
                                <span>
                                    {pendingAction === "terminate"
                                        ? "Terminating..."
                                        : "Terminate Lease"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


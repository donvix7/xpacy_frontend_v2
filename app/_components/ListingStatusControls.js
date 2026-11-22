"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Globe, PauseCircle, Archive, Loader2, X } from "lucide-react";
import {
    publishListing,
    pauseListing,
    archiveListing,
} from "@/app/_lib/action";

export default function ListingStatusControls({
    listingId,
    propertyId,
    listingTitle = "this listing",
    currentStatus = "DRAFT",
}) {
    const router = useRouter();
    const [status, setStatus] = useState(String(currentStatus || "").toUpperCase());
    const [pendingAction, setPendingAction] = useState(null); // "publish" | "pause" | "archive" | null
    const [confirmArchive, setConfirmArchive] = useState(false);

    const isPublished = status === "PUBLISHED" || status === "ACTIVE";
    const isArchived = status === "ARCHIVED";

    const runAction = (actionType, fn, loadingText, nextStatus) => {
        if (!listingId || pendingAction) return;
        setPendingAction(actionType);
        toast.promise(fn(listingId, propertyId), {
            loading: loadingText,
            success: (res) => {
                setPendingAction(null);
                if (!res?.success) {
                    throw new Error(res?.message || `Failed to ${actionType} listing.`);
                }
                setStatus(nextStatus);
                setConfirmArchive(false);
                router.refresh();
                return res?.message || `Listing ${nextStatus.toLowerCase()} successfully!`;
            },
            error: (err) => {
                setPendingAction(null);
                return err?.message || `Failed to ${actionType} listing.`;
            },
        });
    };

    return (
        <>
            {!isPublished && (
                <button
                    type="button"
                    disabled={Boolean(pendingAction)}
                    onClick={() =>
                        runAction(
                            "publish",
                            publishListing,
                            "Publishing listing...",
                            "PUBLISHED"
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/20 px-3.5 py-2 text-[12.5px] font-medium text-emerald-100 backdrop-blur-sm transition-colors hover:bg-emerald-500/35 cursor-pointer disabled:opacity-50"
                >
                    {pendingAction === "publish" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>Publish</span>
                </button>
            )}

            {isPublished && (
                <button
                    type="button"
                    disabled={Boolean(pendingAction)}
                    onClick={() =>
                        runAction(
                            "pause",
                            pauseListing,
                            "Pausing listing...",
                            "PAUSED"
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-400/35 bg-amber-500/20 px-3.5 py-2 text-[12.5px] font-medium text-amber-100 backdrop-blur-sm transition-colors hover:bg-amber-500/35 cursor-pointer disabled:opacity-50"
                >
                    {pendingAction === "pause" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>Pause</span>
                </button>
            )}

            {!isArchived && (
                <button
                    type="button"
                    disabled={Boolean(pendingAction)}
                    onClick={() => setConfirmArchive(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer disabled:opacity-50"
                >
                    {pendingAction === "archive" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>Archive</span>
                </button>
            )}

            {confirmArchive && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !pendingAction && setConfirmArchive(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                    <Archive className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Archive Listing
                                    </h3>
                                    <p className="text-xs text-mute">
                                        Archived listings are hidden from public search.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() => setConfirmArchive(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 rounded-xl border border-line bg-soft/60 p-3.5 text-xs text-ink">
                            Are you sure you want to archive{" "}
                            <span className="font-semibold">{listingTitle}</span>? You can re-publish it anytime later.
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
                            <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() => setConfirmArchive(false)}
                                className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={Boolean(pendingAction)}
                                onClick={() =>
                                    runAction(
                                        "archive",
                                        archiveListing,
                                        "Archiving listing...",
                                        "ARCHIVED"
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 cursor-pointer disabled:opacity-60"
                            >
                                {pendingAction === "archive" ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Archive className="h-3.5 w-3.5" />
                                )}
                                <span>
                                    {pendingAction === "archive"
                                        ? "Archiving..."
                                        : "Archive Listing"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


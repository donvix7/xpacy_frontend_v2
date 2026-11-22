"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { deleteListing } from "@/app/_lib/action";

export default function DeleteListingButton({
    listingId,
    propertyId,
    listingTitle = "this listing",
    redirectTo,
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleDelete = () => {
        if (!listingId || isPending) return;
        setIsPending(true);
        toast.promise(deleteListing(listingId, propertyId), {
            loading: "Deleting listing...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to delete listing.");
                }
                setOpen(false);
                router.refresh();
                router.push(
                    redirectTo ||
                        `/dashboard/property-owner/properties/${propertyId}/listings`
                );
                return res?.message || "Listing deleted successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to delete listing.";
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/35 bg-red-500/20 px-3.5 py-2 text-[12.5px] font-medium text-red-100 backdrop-blur-sm transition-colors hover:bg-red-500/35 cursor-pointer"
            >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Delete Listing
                                    </h3>
                                    <p className="text-xs text-mute">
                                        This removes the listing from active visibility.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 rounded-xl border border-line bg-soft/60 p-3.5 text-xs text-ink">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{listingTitle}</span>?
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                            >
                                {isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                                <span>{isPending ? "Deleting..." : "Delete Listing"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


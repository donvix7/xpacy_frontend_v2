"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { deleteDocument } from "@/app/_lib/action";

export default function DeleteDocumentButton({
    documentId,
    documentName = "this document",
    redirectTo = null,
    variant = "hero", // "hero" | "compact"
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleDelete = () => {
        if (!documentId || isPending) return;
        setIsPending(true);
        toast.promise(deleteDocument(documentId), {
            loading: "Deleting document...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to delete document.");
                }
                setOpen(false);
                router.refresh();
                if (redirectTo) {
                    router.push(redirectTo);
                }
                return res?.message || "Document deleted successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to delete document.";
            },
        });
    };

    const buttonClass =
        variant === "compact"
            ? "inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 cursor-pointer"
            : "inline-flex items-center gap-1.5 rounded-lg border border-red-400/35 bg-red-500/20 px-3.5 py-2 text-xs font-medium text-red-100 backdrop-blur-sm transition-colors hover:bg-red-500/35 cursor-pointer";

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={buttonClass}
            >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Delete</span>
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
                                        Delete Document
                                    </h3>
                                    <p className="text-xs text-mute">
                                        This action cannot be undone.
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
                            Are you sure you want to permanently delete{" "}
                            <span className="font-semibold">{documentName}</span>?
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
                                <span>{isPending ? "Deleting..." : "Delete Document"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


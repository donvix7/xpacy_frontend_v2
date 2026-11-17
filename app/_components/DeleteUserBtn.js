"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";

export default function DeleteUserButton({ userId, userName, userEmail, onDelete }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const confirmDelete = () => {
        startTransition(async () => {
            try {
                const result = await onDelete(userId);
                if (result?.success === false || result?.error) {
                    toast.error(
                        result?.message ||
                            result?.error ||
                            "Could not delete user.",
                    );
                    return;
                }
                toast.success("User deleted.");
                setOpen(false);
                router.push("/dashboard/admin/users");
                router.refresh();
            } catch (err) {
                toast.error(err?.message || "Could not delete user.");
            }
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Deactivate user
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-user-title"
                    onClick={() => !pending && setOpen(false)}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2
                                        id="delete-user-title"
                                        className="text-[15px] font-semibold text-ink"
                                    >
                                        Delete this user?
                                    </h2>
                                    <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500">
                                        This action is permanent. All records associated with
                                        this user may be removed.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !pending && setOpen(false)}
                                className="text-gray-400 transition-colors hover:text-gray-700"
                                aria-label="Close"
                                disabled={pending}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="bg-gray-50 px-5 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                                You're about to delete
                            </p>
                            <p className="mt-1 text-[13.5px] font-semibold text-ink">
                                {userName || "Unnamed user"}
                            </p>
                            {userEmail && (
                                <p className="text-[12px] text-gray-500">{userEmail}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={pending}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[12.5px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={pending}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                {pending ? "Deleting…" : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
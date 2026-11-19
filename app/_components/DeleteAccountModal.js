"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, X, Check } from "lucide-react";
import { expireVirtualAccount } from "../_lib/action";

export default function DeleteAccountModal({ mode, children, id }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const isDelete = mode === "delete";


    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setConfirmText("");
            setAcknowledged(false);
            setIsPending(false);
        }
    }, [isOpen]);

    // Scroll lock + Escape
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape" && !isPending) setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = original;
            window.removeEventListener("keydown", onKey);
        };
    }, [isOpen, isPending]);

    const canSubmit =
        !isPending &&
        acknowledged &&
        (!isDelete || confirmText.trim().toLowerCase() === "delete");

    const handleConfirm = async () => {

        console.log(id)
        if (!canSubmit) return;
        setIsPending(true);

        try {
            await toast.promise(
                Promise.resolve(
                    isDelete ? deleteAccount() : expireVirtualAccount(id)
                ),
                {
                    loading: isDelete
                        ? "Deleting account…"
                        : "Scheduling account for deletion…",
                    success: (res) =>
                        res?.message ??
                        (isDelete
                            ? "Account deleted."
                            : "Account scheduled for deletion."),
                    error: (err) =>
                        err?.message ??
                        "Something went wrong. Please try again.",
                }
            );

            setIsOpen(false);

            if (isDelete) {
                router.push("/login");
                router.refresh();
            } else {
                router.refresh();
            }
        } catch (err) {
            console.error("Account action failed:", err);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            {/* Trigger */}
            <span onClick={() => setIsOpen(true)}>{children}</span>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[11000] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !isPending)
                            setIsOpen(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="account-modal-title"
                        className="relative w-full max-w-md animate-[scaleIn_200ms_ease-out] overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div
                            className={`flex flex-col relative items-start gap-3 px-5 py-5 ${
                                isDelete
                                    ? "bg-red-50 border-b border-red-100"
                                    : "bg-amber-50 border-b border-amber-100"
                            }`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                    isDelete
                                        ? "bg-red-100 text-red-600"
                                        : "bg-amber-100 text-amber-700"
                                }`}
                            >
                                <AlertTriangle
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="min-w-0 flex-1">
                                <h2
                                    id="account-modal-title"
                                    className={`text-[15px] font-semibold ${
                                        isDelete
                                            ? "text-red-900"
                                            : "text-amber-900"
                                    }`}
                                >
                                    {isDelete
                                        ? "Delete account permanently?"
                                        : "Expire this account?"}
                                </h2>
                                <p className="mt-1 text-[12px] leading-relaxed text-gray-600">
                                    {isDelete
                                        ? "This action is irreversible. All data — wallet balance, transaction history, and linked accounts — will be permanently erased."
                                        : "Your account will be deactivated and scheduled for permanent deletion in 30 days. Log in any time before then to cancel."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isPending && setIsOpen(false)}
                                disabled={isPending}
                                aria-label="Close dialog"
                                className="ml-1 absolute top-4 right-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 px-5 py-5">
                            <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={acknowledged}
                                    onChange={(e) =>
                                        setAcknowledged(e.target.checked)
                                    }
                                    disabled={isPending}
                                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span>
                                    I understand this action cannot be undone
                                    and I want to continue.
                                </span>
                            </label>

                            {isDelete && (
                                <div>
                                    <label
                                        htmlFor="confirm-delete"
                                        className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500"
                                    >
                                        Type{" "}
                                        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-red-700">
                                            delete
                                        </code>{" "}
                                        to confirm
                                    </label>
                                    <input
                                        id="confirm-delete"
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) =>
                                            setConfirmText(e.target.value)
                                        }
                                        disabled={isPending}
                                        autoFocus
                                        autoComplete="off"
                                        spellCheck={false}
                                        placeholder="delete"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!canSubmit}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isDelete
                                        ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                                        : "bg-amber-600 shadow-amber-600/20 hover:bg-amber-700"
                                }`}
                            >
                                {isPending ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Working…
                                    </>
                                ) : (
                                    <>
                                        <Check
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        {isDelete
                                            ? "Delete permanently"
                                            : "Expire account"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
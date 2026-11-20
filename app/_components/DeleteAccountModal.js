"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, X, Check } from "lucide-react";
import Modal from "./Modal";
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

    const canSubmit =
        !isPending &&
        acknowledged &&
        (!isDelete || confirmText.trim().toLowerCase() === "delete");

    const handleConfirm = async () => {
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
            <Modal.Window
                open={isOpen}
                onClose={() => !isPending && setIsOpen(false)}
                hideCloseButton
                closeOnOverlayClick={!isPending}
                closeOnEscape={!isPending}
                className="max-w-md"
                ariaLabelledBy="account-modal-title"
            >
                {/* Header */}
                <div
                    className={`flex flex-col relative items-start gap-3 border-b border-line px-5 py-5 ${
                        isDelete
                            ? "bg-down-bg/70 text-down"
                            : "bg-warn-bg/70 text-warn"
                    }`}
                >
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isDelete
                                ? "bg-down-bg text-down"
                                : "bg-warn-bg text-warn"
                        }`}
                    >
                        <AlertTriangle
                            className="h-5 w-5"
                            aria-hidden="true"
                        />
                    </span>
                    <div className="min-w-0 flex-1 pr-6">
                        <h2
                            id="account-modal-title"
                            className="text-[15px] font-semibold text-ink"
                        >
                            {isDelete
                                ? "Delete account permanently?"
                                : "Expire this account?"}
                        </h2>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-mute">
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
                        className="absolute right-3.5 top-3.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-mute transition-colors hover:bg-soft hover:text-ink disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-5 py-5 text-ink">
                    <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] text-ink">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) =>
                                setAcknowledged(e.target.checked)
                            }
                            disabled={isPending}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-down focus:ring-down"
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
                                className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                            >
                                Type{" "}
                                <code className="rounded border border-line bg-soft px-1.5 py-0.5 font-mono text-[11px] font-bold text-down">
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
                                className="w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-down focus:ring-2 focus:ring-down/20 disabled:bg-soft"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-2 border-t border-line bg-soft/40 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                        className="xp-btn px-4 py-2 font-mono text-[12.5px]"
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
            </Modal.Window>
        </>
    );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RotateCcw, X, Check, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { refundSubscriptionPayment } from "@/app/_lib/action";

function formatCurrency(amount, currency = "NGN") {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(n);
    } catch {
        return `${currency} ${n.toLocaleString()}`;
    }
}

export default function RefundPaymentModal({
    paymentId,
    amount,
    currency = "NGN",
    reference,
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [reason, setReason] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setReason("");
            setAcknowledged(false);
            setError("");
        }
    }, [isOpen]);

    const canSubmit = !isPending && acknowledged && !!paymentId;

    const handleSubmit = () => {
        if (!canSubmit) return;
        setError("");

        startTransition(async () => {
            try {
                await toast.promise(
                    Promise.resolve(
                        refundSubscriptionPayment({
                            paymentId,
                            amount,
                            currency,
                            reason,
                        })
                    ),
                    {
                        loading: "Refunding payment…",
                        success: (res) =>
                            res?.message ?? "Payment refunded.",
                        error: (err) =>
                            err?.message ?? "Failed to refund payment.",
                    }
                );
                setIsOpen(false);
                router.refresh();
            } catch (err) {
                setError(err?.message ?? "Something went wrong.");
            }
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-line px-3.5 py-2 text-[12px] font-semibold text-ink shadow-xs transition-colors hover:bg-soft"
            >
                <RotateCcw className="h-3.5 w-3.5 text-mute" aria-hidden="true" />
                Refund payment
            </button>

            <Modal.Window
                open={isOpen}
                onClose={() => !isPending && setIsOpen(false)}
                hideCloseButton
                closeOnOverlayClick={!isPending}
                closeOnEscape={!isPending}
                className="max-w-md"
                ariaLabelledBy="refund-modal-title"
            >
                {/* Header */}
                <div className="flex items-start gap-3 border-b border-line bg-down-bg/70 px-5 py-5 text-down">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-down-bg text-down">
                        <RotateCcw className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 pr-6">
                        <h2
                            id="refund-modal-title"
                            className="text-[15px] font-semibold text-ink"
                        >
                            Refund this payment?
                        </h2>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-mute">
                            This will issue a refund for the payment
                            below. The action cannot be undone.
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
                    {/* Summary */}
                    <dl className="rounded-xl border border-line bg-soft/50 p-3 text-[12.5px]">
                        <div className="flex justify-between gap-2 py-0.5">
                            <dt className="text-mute">Amount</dt>
                            <dd className="font-mono font-semibold text-ink">
                                {formatCurrency(amount, currency)}
                            </dd>
                        </div>
                        {reference && (
                            <div className="flex justify-between gap-2 py-0.5">
                                <dt className="text-mute">Reference</dt>
                                <dd className="truncate font-mono font-semibold text-ink">
                                    {reference}
                                </dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-2 py-0.5">
                            <dt className="text-mute">Payment ID</dt>
                            <dd className="truncate font-mono font-semibold text-ink">
                                {paymentId}
                            </dd>
                        </div>
                    </dl>

                    {/* Reason */}
                    <div>
                        <label
                            htmlFor="refund-reason"
                            className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                        >
                            Reason
                        </label>
                        <textarea
                            id="refund-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isPending}
                            rows={2}
                            placeholder="Optional — why is this being refunded?"
                            className="w-full resize-none rounded-lg border border-line bg-card px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-down focus:ring-2 focus:ring-down/20 disabled:bg-soft"
                        />
                    </div>

                    {/* Acknowledge */}
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
                            I understand this refund cannot be undone.
                        </span>
                    </label>

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-down/30 bg-down-bg p-3 text-[12.5px] text-down">
                            <AlertTriangle
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <span>{error}</span>
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
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Refunding…
                            </>
                        ) : (
                            <>
                                <Check
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Refund payment
                            </>
                        )}
                    </button>
                </div>
            </Modal.Window>
        </>
    );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Plus,
    X,
    Receipt,
    AlertTriangle,
    Wallet,
} from "lucide-react";
import Modal from "./Modal";
import { recordSubscription } from "@/app/_lib/action";

const CHANNELS = [
    { value: "bank_transfer", label: "Bank transfer" },
    { value: "gateway", label: "Gateway" },
    { value: "manual", label: "Manual" },
    { value: "cash", label: "Cash" },
];

const STATUSES = [
    { value: "PENDING", label: "Pending" },
    { value: "SUCCESSFUL", label: "Successful" },
    { value: "FAILED", label: "Failed" },
];

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

const emptyForm = {
    subscriptionId: "",
    amount: "",
    currency: "NGN",
    reference: "",
    channel: "bank_transfer",
    status: "PENDING",
    paidAt: "",
    notes: "",
};

export default function RecordPaymentModal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");

    /* Reset on close */
    useEffect(() => {
        if (!isOpen) {
            setError("");
            setForm(emptyForm);
        }
    }, [isOpen]);

    const update = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const canSubmit =
        !isPending &&
        form.subscriptionId.trim() !== "" &&
        form.reference.trim() !== "" &&
        form.amount.trim() !== "" &&
        Number(form.amount) > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError("");
        startTransition(async () => {
            try {
                await toast.promise(
                    Promise.resolve(
                        recordSubscription({
                            subscriptionId: form.subscriptionId.trim(),
                            amount: Number(form.amount),
                            currency: form.currency,
                            reference: form.reference.trim(),
                            channel: form.channel,
                            status: form.status,
                            paidAt: form.paidAt || undefined,
                            notes: form.notes,
                        })
                    ),
                    {
                        loading: "Recording payment…",
                        success: (res) =>
                            res?.message ?? "Payment recorded.",
                        error: (err) =>
                            err?.message ?? "Failed to record payment.",
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
                className="inline-flex items-center gap-2 rounded-lg bg-card border border-line px-4 py-2.5 text-[13px] font-semibold text-ink shadow-xs transition-colors hover:bg-soft"
            >
                <Plus className="h-4 w-4 text-mute" aria-hidden="true" />
                Record payment
            </button>

            <Modal.Window
                open={isOpen}
                onClose={() => !isPending && setIsOpen(false)}
                hideCloseButton
                closeOnOverlayClick={!isPending}
                closeOnEscape={!isPending}
                className="max-w-lg"
                ariaLabelledBy="record-payment-title"
            >
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-start gap-3 border-b border-line bg-soft/50 px-5 py-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-line text-side-active">
                            <Receipt
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div className="min-w-0 flex-1 pr-6">
                            <h2
                                id="record-payment-title"
                                className="text-[15px] font-semibold text-ink"
                            >
                                Record a subscription payment
                            </h2>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-mute">
                                Manually log a payment against an existing
                                subscription. Ideal for offline or
                                bank-transfer settlements.
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
                        {/* Subscription ID */}
                        <div>
                            <label
                                htmlFor="rp-subscriptionId"
                                className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                            >
                                Subscription ID{" "}
                                <span className="text-down">*</span>
                            </label>
                            <input
                                id="rp-subscriptionId"
                                type="text"
                                value={form.subscriptionId}
                                onChange={(e) =>
                                    update("subscriptionId", e.target.value)
                                }
                                disabled={isPending}
                                autoFocus
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="22ebb45f-036c-4b45-…"
                                className="w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                            />
                        </div>

                        {/* Amount + Currency */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="rp-amount"
                                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                                >
                                    Amount <span className="text-down">*</span>
                                </label>
                                <input
                                    id="rp-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) =>
                                        update("amount", e.target.value)
                                    }
                                    disabled={isPending}
                                    placeholder="50000"
                                    className="w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="rp-currency"
                                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                                >
                                    Currency
                                </label>
                                <select
                                    id="rp-currency"
                                    value={form.currency}
                                    onChange={(e) =>
                                        update("currency", e.target.value)
                                    }
                                    disabled={isPending}
                                    className="w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Reference */}
                        <div>
                            <label
                                htmlFor="rp-reference"
                                className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                            >
                                Reference <span className="text-down">*</span>
                            </label>
                            <input
                                id="rp-reference"
                                type="text"
                                value={form.reference}
                                onChange={(e) =>
                                    update("reference", e.target.value)
                                }
                                disabled={isPending}
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="TRX-MAN-2026-…"
                                className="w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                            />
                        </div>

                        {/* Channel + Status */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="rp-channel"
                                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                                >
                                    Channel
                                </label>
                                <select
                                    id="rp-channel"
                                    value={form.channel}
                                    onChange={(e) =>
                                        update("channel", e.target.value)
                                    }
                                    disabled={isPending}
                                    className="w-full rounded-lg border border-line bg-card px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                                >
                                    {CHANNELS.map((ch) => (
                                        <option key={ch.value} value={ch.value}>
                                            {ch.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="rp-status"
                                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                                >
                                    Status
                                </label>
                                <select
                                    id="rp-status"
                                    value={form.status}
                                    onChange={(e) =>
                                        update("status", e.target.value)
                                    }
                                    disabled={isPending}
                                    className="w-full rounded-lg border border-line bg-card px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                                >
                                    {STATUSES.map((st) => (
                                        <option key={st.value} value={st.value}>
                                            {st.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Paid at */}
                        <div>
                            <label
                                htmlFor="rp-paidAt"
                                className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                            >
                                Paid at
                            </label>
                            <input
                                id="rp-paidAt"
                                type="datetime-local"
                                value={form.paidAt}
                                onChange={(e) =>
                                    update("paidAt", e.target.value)
                                }
                                disabled={isPending}
                                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                            />
                            <p className="mt-1 text-[11px] text-mute">
                                Leave blank to use the current time.
                            </p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor="rp-notes"
                                className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute"
                            >
                                Notes
                            </label>
                            <textarea
                                id="rp-notes"
                                value={form.notes}
                                onChange={(e) =>
                                    update("notes", e.target.value)
                                }
                                disabled={isPending}
                                rows={2}
                                placeholder="Optional notes about this payment…"
                                className="w-full resize-none rounded-lg border border-line bg-card px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-side-active focus:ring-2 focus:ring-side-active/20 disabled:bg-soft"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-down/30 bg-down-bg p-3 text-[12px] text-down">
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
                            type="submit"
                            disabled={!canSubmit}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Recording…
                                </>
                            ) : (
                                <>
                                    <Wallet
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Record payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal.Window>
        </>
    );
}

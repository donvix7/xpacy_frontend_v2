"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    RefreshCw,
    ArrowRightLeft,
    Sparkles,
    X,
    Check,
    AlertTriangle,
} from "lucide-react";
import { manageSubscription } from "@/app/_lib/action";

const ACTIONS = {
    renew: {
        verb: "Renew",
        icon: RefreshCw,
        tone: "primary",
        title: "Renew your subscription?",
        description:
            "This will extend your current plan by one billing cycle and charge your wallet immediately.",
    },
    switch: {
        verb: "Switch",
        icon: ArrowRightLeft,
        tone: "amber",
        title: "Switch to a different plan?",
        description:
            "Your new plan takes effect immediately. Remaining days on your current plan may be prorated.",
    },
    subscribe: {
        verb: "Subscribe",
        icon: Sparkles,
        tone: "emerald",
        title: "Subscribe to this plan?",
        description:
            "You will be charged for the selected billing interval. The subscription activates immediately.",
    },
};

const TONE = {
    primary: {
        modalAccent: "bg-primary-50 border-primary-100",
        iconWrap: "bg-primary-100 text-primary",
        confirm: "bg-primary hover:bg-primary-800",
    },
    amber: {
        modalAccent: "bg-amber-50 border-amber-100",
        iconWrap: "bg-amber-100 text-amber-700",
        confirm: "bg-amber-600 hover:bg-amber-700",
    },
    emerald: {
        modalAccent: "bg-emerald-50 border-emerald-100",
        iconWrap: "bg-emerald-100 text-emerald-700",
        confirm: "bg-emerald-600 hover:bg-emerald-700",
    },
};

/**
 * Usage:
 *   <SubscriptionActions
 *     action="renew" | "switch" | "subscribe"
 *     planId="..."                    // required
 *     billingInterval="MONTHLY"       // optional, default MONTHLY
 *     paymentMethod="GATEWAY"         // optional, default GATEWAY
 *   >
 *     <button>Trigger</button>
 *   </SubscriptionActions>
 */
export default function SubscriptionActions({
    action,
    planId,
    billingInterval = "MONTHLY",
    paymentMethod = "GATEWAY",
    children,
}) {
    const meta = ACTIONS[action];
    const tone = TONE[meta.tone];
    const Icon = meta.icon;

    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

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

    const runAction = () => {
        if (!planId) {
            toast.error("No plan selected.");
            return;
        }

        startTransition(async () => {
            try {
                await toast.promise(
                    Promise.resolve(
                        manageSubscription({
                            planId,
                            billingInterval,
                            paymentMethod,
                        })
                    ),
                    {
                        loading: `${meta.verb}…`,
                        success: (res) =>
                            res?.message ?? `${meta.verb} successful.`,
                        error: (err) =>
                            err?.message ?? `${meta.verb} failed. Try again.`,
                    }
                );

                setIsOpen(false);
                router.refresh();
            } catch (err) {
                console.error(`${action} failed:`, err);
            }
        });
    };

    return (
        <>
            <span onClick={() => setIsOpen(true)}>{children}</span>

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
                        aria-labelledby="sub-action-title"
                        className="relative w-full max-w-md animate-[scaleIn_200ms_ease-out] overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div
                            className={`flex items-start gap-3 border-b px-5 py-5 ${tone.modalAccent}`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.iconWrap}`}
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <h2
                                    id="sub-action-title"
                                    className="text-[15px] font-semibold text-ink"
                                >
                                    {meta.title}
                                </h2>
                                <p className="mt-1 text-[12px] leading-relaxed text-gray-600">
                                    {meta.description}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isPending && setIsOpen(false)}
                                disabled={isPending}
                                aria-label="Close dialog"
                                className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-3 px-5 py-5 text-[12.5px] text-gray-700">
                            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                                <AlertTriangle
                                    className="h-4 w-4 shrink-0 text-gray-400"
                                    aria-hidden="true"
                                />
                                <p className="leading-relaxed">
                                    By confirming, you agree to the charges
                                    associated with this{" "}
                                    {meta.verb.toLowerCase()} action. You can
                                    cancel future renewals at any time from this
                                    page.
                                </p>
                            </div>

                            {/* Payload summary */}
                            <dl className="rounded-lg border border-gray-100 bg-white p-3 text-[11.5px]">
                                <div className="flex justify-between gap-2 py-0.5">
                                    <dt className="text-gray-500">Plan</dt>
                                    <dd className="font-mono font-semibold text-ink">
                                        {planId}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-2 py-0.5">
                                    <dt className="text-gray-500">Billing</dt>
                                    <dd className="font-mono font-semibold text-ink">
                                        {billingInterval}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-2 py-0.5">
                                    <dt className="text-gray-500">
                                        Payment method
                                    </dt>
                                    <dd className="font-mono font-semibold text-ink">
                                        {paymentMethod}
                                    </dd>
                                </div>
                            </dl>
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
                                onClick={runAction}
                                disabled={isPending || !planId}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${tone.confirm}`}
                            >
                                {isPending ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        {meta.verb}…
                                    </>
                                ) : (
                                    <>
                                        <Check
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        {meta.verb}
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
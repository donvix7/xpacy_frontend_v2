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
import Modal from "./Modal";
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
        modalAccent: "bg-soft border-line",
        iconWrap: "bg-card border border-line text-side-active",
        confirm: "bg-primary hover:bg-primary-800 text-white",
    },
    amber: {
        modalAccent: "bg-amber-500/10 border-amber-500/20",
        iconWrap: "bg-card border border-amber-500/30 text-amber-600 dark:text-amber-400",
        confirm: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    emerald: {
        modalAccent: "bg-emerald-500/10 border-emerald-500/20",
        iconWrap: "bg-card border border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
        confirm: "bg-emerald-600 hover:bg-emerald-700 text-white",
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
    const meta = ACTIONS[action] || ACTIONS.renew;
    const tone = TONE[meta.tone] || TONE.primary;
    const Icon = meta.icon;

    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

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
                            err?.message ?? `${meta.verb} failed.`,
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

            <Modal.Window
                open={isOpen}
                onClose={() => !isPending && setIsOpen(false)}
                hideCloseButton
                closeOnOverlayClick={!isPending}
                closeOnEscape={!isPending}
                className="max-w-md"
                ariaLabelledBy="sub-action-title"
            >
                {/* Header */}
                <div
                    className={`flex items-start gap-3 border-b px-5 py-5 ${tone.modalAccent}`}
                >
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.iconWrap}`}
                    >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 pr-6">
                        <h2
                            id="sub-action-title"
                            className="text-[15px] font-semibold text-ink"
                        >
                            {meta.title}
                        </h2>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-mute">
                            {meta.description}
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
                <div className="space-y-3 px-5 py-5 text-[12.5px] text-ink">
                    <div className="flex items-start gap-2.5 rounded-xl border border-line bg-soft/50 p-3">
                        <AlertTriangle
                            className="h-4 w-4 shrink-0 text-mute mt-0.5"
                            aria-hidden="true"
                        />
                        <p className="leading-relaxed text-mute">
                            By confirming, you agree to the charges
                            associated with this{" "}
                            {meta.verb.toLowerCase()} action. You can
                            cancel future renewals at any time from this
                            page.
                        </p>
                    </div>

                    {/* Payload summary */}
                    <dl className="rounded-xl border border-line bg-card p-3 text-[12px]">
                        <div className="flex justify-between gap-2 py-0.5">
                            <dt className="text-mute">Plan</dt>
                            <dd className="font-mono font-semibold text-ink">
                                {planId}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2 py-0.5">
                            <dt className="text-mute">Billing</dt>
                            <dd className="font-mono font-semibold text-ink">
                                {billingInterval}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2 py-0.5">
                            <dt className="text-mute">
                                Payment method
                            </dt>
                            <dd className="font-mono font-semibold text-ink">
                                {paymentMethod}
                            </dd>
                        </div>
                    </dl>
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
                        onClick={runAction}
                        disabled={isPending || !planId}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-semibold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${tone.confirm}`}
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
            </Modal.Window>
        </>
    );
}

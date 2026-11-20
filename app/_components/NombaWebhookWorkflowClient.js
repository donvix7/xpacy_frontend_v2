"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    Activity,
    CheckCircle2,
    Copy,
    Landmark,
    ShieldCheck,
    CreditCard,
    ArrowUpRight,
    Send,
    Code,
    RefreshCw,
    AlertCircle,
    Layers,
    FileText,
    Terminal,
    Sparkles,
    Wallet,
} from "lucide-react";
import CopyButton from "@/app/_components/CopyButton";
import toast from "react-hot-toast";

const WEBHOOK_URL = "https://services.xpacy.com/api/v1/webhooks/nomba";

const EVENT_TEMPLATES = {
    "virtual_account.credited": {
        title: "Virtual Account Inbound Transfer (Wallet Funding)",
        description: "Triggered by Nomba when an inbound bank transfer hits a user's Nombank MFB dedicated virtual account.",
        payload: {
            event: "virtual_account.credited",
            data: {
                accountNumber: "0124974159",
                accountName: "XPACY/Sarah Owner",
                bankName: "Nombank MFB",
                accountRef: "c7ea8a96-47ed-4c46-8919-2e59714b9e2f~1795174656462",
                amount: 50000.0,
                currency: "NGN",
                transactionId: "TXN_NOMBA_" + Date.now(),
                reference: "DEP_" + Math.floor(Math.random() * 1000000000),
                sessionid: "999001" + Date.now(),
                sender: {
                    name: "Sarah Owner",
                    bank: "Access Bank",
                    accountNumber: "0029182741",
                },
                timestamp: new Date().toISOString(),
            },
        },
    },
    "wallet_funding.card": {
        title: "Online Gateway Wallet Funding (Card / USSD)",
        description: "Triggered when a user clicks 'Fund Wallet' and completes a direct card or checkout payment via Nomba.",
        payload: {
            event: "payment.success",
            data: {
                orderReference: "ORD_WAL_" + Math.floor(Math.random() * 10000000),
                transactionId: "TXN_NOMBA_" + Date.now(),
                amount: 25000.0,
                currency: "NGN",
                status: "SUCCESSFUL",
                channel: "CARD",
                paymentDetails: {
                    cardType: "Visa",
                    last4: "1122",
                    expMonth: "08",
                    expYear: "2029",
                },
                customer: {
                    email: "sarah.owner@example.com",
                    name: "Sarah Owner",
                    phone: "+2348012345678",
                },
                metadata: {
                    type: "WALLET_FUNDING",
                    walletId: "wal_c7ea8a96-47ed-4c46-8919",
                    userId: "c7ea8a96-47ed-4c46-8919-2e59714b9e2f",
                },
                paidAt: new Date().toISOString(),
            },
        },
    },
    "payment.success": {
        title: "Subscription Payment Success",
        description: "Triggered when a user or organization successfully pays for an XPACY subscription plan.",
        payload: {
            event: "payment.success",
            data: {
                orderReference: "ORD_SUB_" + Math.floor(Math.random() * 10000000),
                transactionId: "TXN_NOMBA_" + Date.now(),
                amount: 45000.0,
                currency: "NGN",
                status: "SUCCESSFUL",
                channel: "CARD",
                paymentDetails: {
                    cardType: "Mastercard",
                    last4: "4242",
                    expMonth: "12",
                    expYear: "2028",
                },
                customer: {
                    email: "sarah.owner@example.com",
                    name: "Sarah Owner",
                    phone: "+2348012345678",
                },
                metadata: {
                    type: "SUBSCRIPTION",
                    subscriptionId: "sub_demo_109284",
                    organizationId: "org_demo_882910",
                    planId: "plan_pro_monthly",
                    billingCycle: "monthly",
                },
                paidAt: new Date().toISOString(),
            },
        },
    },
    "payment.failed": {
        title: "Payment Failed / Declined",
        description: "Triggered when a recurring subscription renewal or card checkout fails.",
        payload: {
            event: "payment.failed",
            data: {
                orderReference: "ORD_SUB_" + Math.floor(Math.random() * 10000000),
                transactionId: "TXN_NOMBA_" + Date.now(),
                amount: 45000.0,
                currency: "NGN",
                status: "FAILED",
                failureReason: "Insufficient funds / Card expired",
                customer: {
                    email: "sarah.owner@example.com",
                    name: "Sarah Owner",
                },
                metadata: {
                    type: "SUBSCRIPTION",
                    subscriptionId: "sub_demo_109284",
                    planId: "plan_pro_monthly",
                },
                failedAt: new Date().toISOString(),
            },
        },
    },
};

export default function NombaWebhookWorkflowClient() {
    const [selectedEventKey, setSelectedEventKey] = useState("virtual_account.credited");
    const [payloadJson, setPayloadJson] = useState(() =>
        JSON.stringify(EVENT_TEMPLATES["virtual_account.credited"].payload, null, 2)
    );
    const [isPending, startTransition] = useTransition();
    const [simulationLog, setSimulationLog] = useState(null);

    const handleSelectTemplate = (key) => {
        setSelectedEventKey(key);
        setPayloadJson(JSON.stringify(EVENT_TEMPLATES[key].payload, null, 2));
        setSimulationLog(null);
    };

    const handleSendTestWebhook = () => {
        startTransition(async () => {
            try {
                let parsed;
                try {
                    parsed = JSON.parse(payloadJson);
                } catch (err) {
                    toast.error("Invalid JSON payload");
                    return;
                }

                toast.loading("Dispatching test event to Nomba webhook endpoint…", { id: "test-webhook" });

                const res = await fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-nomba-signature": "simulated_test_hmac_signature",
                        "x-simulated-event": "true",
                    },
                    body: JSON.stringify(parsed),
                });

                const status = res.status;
                let data = null;
                try {
                    data = await res.json();
                } catch {
                    data = await res.text();
                }

                if (res.ok) {
                    toast.success("Webhook acknowledged with 200 OK!", { id: "test-webhook" });
                    setSimulationLog({
                        success: true,
                        status,
                        timestamp: new Date().toLocaleTimeString(),
                        response: data,
                    });
                } else {
                    toast.error(`Endpoint returned ${status}`, { id: "test-webhook" });
                    setSimulationLog({
                        success: false,
                        status,
                        timestamp: new Date().toLocaleTimeString(),
                        response: data,
                    });
                }
            } catch (error) {
                toast.error("Network or endpoint unreachable", { id: "test-webhook" });
                setSimulationLog({
                    success: false,
                    status: "Network Error",
                    timestamp: new Date().toLocaleTimeString(),
                    response: error.message,
                });
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* ---------------- Configuration Strip ---------------- */}
            <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-[14px] font-semibold text-ink">
                                Active Nomba Webhook URL
                            </h3>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                HTTPS Verified
                            </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <code className="rounded-lg bg-soft px-3 py-1.5 font-mono text-[13px] font-semibold text-primary">
                                {WEBHOOK_URL}
                            </code>
                            <CopyButton value={WEBHOOK_URL} label="webhook URL" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-[12.5px] text-mute">
                        <div className="flex items-center gap-1.5">
                            <Landmark className="h-4 w-4 text-mute" />
                            <span>Provider: <strong>Nomba / Nombank MFB</strong></span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            <span>HMAC SHA-512 Security</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- Core Automated Workflows ---------------- */}
            <div>
                <h2 className="text-[16px] font-bold text-ink">
                    Automated Event Workflows
                </h2>
                <p className="mt-1 text-[13px] text-mute">
                    How Nomba webhook signals are routed to update Wallets, Virtual Accounts, and Subscriptions.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Flow 1: Virtual Account Transfer */}
                    <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Landmark className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-mono text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                    virtual_account.credited
                                </span>
                                <h4 className="mt-0.5 text-[14.5px] font-semibold text-ink">
                                    VA Bank Deposit
                                </h4>
                            </div>
                            <p className="text-[12px] leading-relaxed text-mute">
                                Instant wallet credit when transfers land in a user&apos;s Nombank MFB virtual account.
                            </p>
                        </div>
                        <div className="mt-4 border-t border-line/60 pt-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-mute">Type:</span>
                                <span className="font-semibold text-ink">Bank Transfer</span>
                            </div>
                        </div>
                    </div>

                    {/* Flow 2: Gateway Fund Wallet */}
                    <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-mono text-[10.5px] font-bold text-sky-600 dark:text-sky-400">
                                    payment.success (Wallet)
                                </span>
                                <h4 className="mt-0.5 text-[14.5px] font-semibold text-ink">
                                    Gateway Fund Wallet
                                </h4>
                            </div>
                            <p className="text-[12px] leading-relaxed text-mute">
                                When a user clicks &quot;Fund Wallet&quot; and checks out with Debit Card or USSD via Nomba Gateway.
                            </p>
                        </div>
                        <div className="mt-4 border-t border-line/60 pt-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-mute">Type:</span>
                                <span className="font-semibold text-ink">Card / Checkout</span>
                            </div>
                        </div>
                    </div>

                    {/* Flow 3: Subscription Activation */}
                    <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-mono text-[10.5px] font-bold text-primary">
                                    payment.success (Sub)
                                </span>
                                <h4 className="mt-0.5 text-[14.5px] font-semibold text-ink">
                                    Subscription Activation
                                </h4>
                            </div>
                            <p className="text-[12px] leading-relaxed text-mute">
                                Unlocks organization workspaces, grants plan quotas, records invoice, and sets renewal date.
                            </p>
                        </div>
                        <div className="mt-4 border-t border-line/60 pt-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-mute">Type:</span>
                                <span className="font-semibold text-ink">Plan Checkout</span>
                            </div>
                        </div>
                    </div>

                    {/* Flow 4: Dunning / Failed */}
                    <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-mono text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                                    payment.failed
                                </span>
                                <h4 className="mt-0.5 text-[14.5px] font-semibold text-ink">
                                    Dunning & Grace
                                </h4>
                            </div>
                            <p className="text-[12px] leading-relaxed text-mute">
                                Handles renewal card declines. Flags the organization for a grace period before revoking perks.
                            </p>
                        </div>
                        <div className="mt-4 border-t border-line/60 pt-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-mute">Type:</span>
                                <span className="font-semibold text-ink">Payment Decline</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- Webhook Event Simulator & Tester ---------------- */}
            <div className="rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                    <div>
                        <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink">
                            <Terminal className="h-4 w-4 text-primary" />
                            Webhook Event Simulator
                        </h3>
                        <p className="mt-0.5 text-[12.5px] text-mute">
                            Test the Nomba webhook endpoint in real-time by dispatching simulated event payloads.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {Object.keys(EVENT_TEMPLATES).map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleSelectTemplate(key)}
                                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                                    selectedEventKey === key
                                        ? "bg-primary text-white"
                                        : "border border-line bg-soft text-ink hover:bg-line/40"
                                }`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                    {/* JSON Payload Editor */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-mute">
                                Payload (JSON)
                            </span>
                            <span className="text-[11.5px] text-mute">
                                {EVENT_TEMPLATES[selectedEventKey]?.title}
                            </span>
                        </div>
                        <textarea
                            rows={15}
                            value={payloadJson}
                            onChange={(e) => setPayloadJson(e.target.value)}
                            className="w-full rounded-xl border border-line bg-soft p-4 font-mono text-[12.5px] text-ink focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-[11.5px] text-mute">
                                Includes required Nomba header: <code>x-nomba-signature</code>
                            </p>
                            <button
                                type="button"
                                onClick={handleSendTestWebhook}
                                disabled={isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                <Send className="h-3.5 w-3.5" />
                                {isPending ? "Sending Test…" : "Send Test Webhook"}
                            </button>
                        </div>
                    </div>

                    {/* Simulation Result */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-mute">
                                Response & Logs
                            </span>
                            {simulationLog && (
                                <span className="font-mono text-[11px] text-mute">
                                    {simulationLog.timestamp}
                                </span>
                            )}
                        </div>

                        <div className="flex h-[360px] flex-col rounded-xl border border-line bg-soft p-4 font-mono text-[12px] overflow-auto">
                            {!simulationLog ? (
                                <div className="m-auto text-center text-mute space-y-2">
                                    <Sparkles className="mx-auto h-6 w-6 text-primary/60" />
                                    <p>Ready to test.</p>
                                    <p className="text-[11px] max-w-xs">
                                        Click &quot;Send Test Webhook&quot; to dispatch the event payload to {WEBHOOK_URL}.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                simulationLog.success
                                                    ? "bg-emerald-500/10 text-emerald-600"
                                                    : "bg-red-500/10 text-red-600"
                                            }`}
                                        >
                                            HTTP {simulationLog.status}
                                        </span>
                                        <span className="text-mute text-[11px]">
                                            {simulationLog.success
                                                ? "Webhook successfully handled"
                                                : "Error returned by service"}
                                        </span>
                                    </div>
                                    <pre className="text-ink">
                                        {typeof simulationLog.response === "object"
                                            ? JSON.stringify(simulationLog.response, null, 2)
                                            : String(simulationLog.response)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

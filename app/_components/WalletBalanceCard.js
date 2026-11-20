"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowUpRight,
    Plus,
    RefreshCw,
    TrendingUp,
    Clock,
    CreditCard,
    ShieldCheck,
    Check,
    Copy,
    Landmark,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { formatCurrency } from "@/app/_lib/utils";

// Rhythmic waveform height definitions replicating the reference image
const leftWaveform = [
    { h: 20, op: "opacity-40" },
    { h: 36, op: "opacity-55" },
    { h: 54, op: "opacity-75" },
    { h: 78, op: "opacity-90" },
    { h: 48, op: "opacity-70" },
    { h: 26, op: "opacity-40" },
    { h: 86, op: "opacity-95" },
    { h: 96, op: "opacity-100" },
    { h: 52, op: "opacity-75" },
    { h: 30, op: "opacity-45" },
    { h: 100, op: "opacity-100" },
    { h: 38, op: "opacity-55" },
    { h: 72, op: "opacity-85" },
    { h: 88, op: "opacity-95" },
    { h: 56, op: "opacity-75" },
    { h: 30, op: "opacity-45" },
    { h: 68, op: "opacity-80" },
    { h: 42, op: "opacity-60" },
    { h: 24, op: "opacity-40" },
    { h: 16, op: "opacity-30" },
];

const rightWaveform = [
    { h: 18, op: "opacity-40" },
    { h: 26, op: "opacity-55" },
    { h: 40, op: "opacity-75" },
    { h: 62, op: "opacity-90" },
    { h: 82, op: "opacity-100" },
    { h: 96, op: "opacity-100" },
    { h: 86, op: "opacity-95" },
    { h: 68, op: "opacity-85" },
    { h: 50, op: "opacity-75" },
    { h: 58, op: "opacity-80" },
    { h: 74, op: "opacity-90" },
    { h: 90, op: "opacity-100" },
    { h: 100, op: "opacity-100" },
    { h: 88, op: "opacity-95" },
    { h: 70, op: "opacity-85" },
    { h: 48, op: "opacity-70" },
    { h: 36, op: "opacity-55" },
    { h: 48, op: "opacity-70" },
    { h: 68, op: "opacity-85" },
    { h: 84, op: "opacity-95" },
    { h: 76, op: "opacity-90" },
    { h: 56, op: "opacity-80" },
    { h: 38, op: "opacity-60" },
    { h: 28, op: "opacity-45" },
    { h: 18, op: "opacity-35" },
];

export default function WalletBalanceCard({
    balance = 0,
    currency = "NGN",
    pending = 0,
    credits = 0,
    debits = 0,
    net = 0,
    transactionsCount = 0,
    walletId = "—",
    updatedAt = null,
    virtualAccount = null,
    fundHref = "/dashboard/user/wallet/fund",
    withdrawHref = "/dashboard/user/wallet/withdraw",
    settingsHref = "/dashboard/user/wallet/settings",
    onSync,
}) {
    const router = useRouter();
    const [isSyncing, startSync] = useTransition();
    const [copied, setCopied] = useState(false);

    const vaNumber =
        virtualAccount?.accountNumber ||
        virtualAccount?.account_number ||
        virtualAccount?.number ||
        null;
    const vaName =
        virtualAccount?.accountName ||
        virtualAccount?.account_name ||
        virtualAccount?.name ||
        null;
    const vaBank =
        virtualAccount?.bankName ||
        virtualAccount?.bank_name ||
        virtualAccount?.bank ||
        null;

    const handleCopyVa = async () => {
        if (!vaNumber) return;
        try {
            await navigator.clipboard.writeText(String(vaNumber));
            setCopied(true);
            toast.success("Account number copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {
            toast.error("Could not copy account number.");
        }
    };

    const handleSyncClick = () => {
        if (!onSync) {
            router.refresh();
            return;
        }
        startSync(async () => {
            try {
                const res = await onSync();
                if (res?.success === false || res?.error) {
                    toast.error(res?.message || res?.error || "Sync failed.");
                    return;
                }
                toast.success("Wallet synchronized.");
                router.refresh();
            } catch (err) {
                toast.error(err?.message || "Sync failed.");
            }
        });
    };

    const formatShortDate = (v) => {
        if (!v) return null;
        try {
            return new Date(v).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return null;
        }
    };

    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#13171d] via-[#0d1015] to-[#07090c] p-4 sm:p-6 lg:p-7 text-white shadow-2xl">
            {/* Ambient Background Topographic Contour Lines */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full stroke-white/[0.05]"
                viewBox="0 0 1000 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M-50 120 C 220 50, 440 220, 720 100 C 920 20, 1080 160, 1150 130"
                    strokeWidth="1.2"
                />
                <path
                    d="M-50 210 C 180 140, 390 310, 680 190 C 880 110, 1040 240, 1150 220"
                    strokeWidth="1.2"
                />
                <path
                    d="M-50 300 C 140 230, 340 400, 640 280 C 840 200, 1000 330, 1150 310"
                    strokeWidth="1.2"
                />
                <path
                    d="M-50 390 C 100 320, 290 490, 600 370 C 800 290, 960 420, 1150 400"
                    strokeWidth="1.2"
                />
                <path
                    d="M-50 480 C 60 410, 240 580, 560 460 C 760 380, 920 510, 1150 490"
                    strokeWidth="1.2"
                />
            </svg>

            {/* Ambient Lighting Blurs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />

            {/* Dual Frosted Glass Cards Container */}
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
                {/* -------------------- CARD 1 (LEFT: Smoky Glass Pulse & Virtual Account / Ledger) -------------------- */}
                <div className="group relative flex flex-1 flex-col justify-between rounded-3xl border border-white/[0.12] bg-black/40 backdrop-blur-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:border-white/20">
                    {/* Top Row: Status Dot + Metadata */}
                    <div className="flex items-center justify-between gap-3 text-[12px] tracking-wide text-white/70">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-white/50" />
                            <span className="font-medium text-white/80">
                                {vaNumber ? "Virtual Account" : "Ledger Activity"}
                            </span>
                            <span className="text-white/40">·</span>
                            <span className="text-[11.5px] text-white/60">
                                {vaBank || "Auto-Assigned"}
                            </span>
                            <span className="text-white/40">·</span>
                            <span className="text-[11px] font-semibold text-emerald-400">
                                Active
                            </span>
                        </div>

                        {vaNumber && (
                            <button
                                type="button"
                                onClick={handleCopyVa}
                                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/15"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3 text-emerald-400" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Middle Graphic: Waveform Bars (Replicating Left Soundwave) */}
                    <div className="my-6 flex h-20 items-center justify-center gap-1.5 sm:gap-2">
                        {leftWaveform.map((bar, idx) => (
                            <div
                                key={idx}
                                style={{ height: `${bar.h}%` }}
                                className={`w-1 sm:w-1.5 rounded-full bg-white transition-all duration-300 group-hover:bg-white ${bar.op}`}
                            />
                        ))}
                    </div>

                    {/* Bottom Row: Quote / Details Text */}
                    <div className="pt-2">
                        {vaNumber ? (
                            <div className="flex flex-col gap-1">
                                <p className="font-mono text-[16px] sm:text-[18px] font-semibold tracking-wide text-white/95">
                                    {vaNumber}
                                </p>
                                <p className="truncate text-[12px] text-white/60">
                                    {vaName || "XPACY WALLET"}
                                    {vaBank ? ` · ${vaBank}` : ""}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <p className="font-mono text-[14px] sm:text-[15px] font-medium text-white/90">
                                    "{net >= 0 ? "+" : "−"}
                                    {formatCurrency(Math.abs(net))} Net Flow"
                                </p>
                                <p className="truncate text-[11.5px] text-white/60">
                                    +{formatCurrency(credits)} in · −
                                    {formatCurrency(debits)} out ·{" "}
                                    {transactionsCount} txns
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* -------------------- CARD 2 (RIGHT: Luminous Elevated Frosted Glass Card) -------------------- */}
                <div className="group relative flex flex-1 flex-col justify-between rounded-3xl border border-white/40 dark:border-white/15 bg-gradient-to-br from-white/95 via-white/85 to-white/70 dark:from-slate-800/95 dark:via-slate-800/85 dark:to-slate-900/90 backdrop-blur-2xl p-5 sm:p-6 text-gray-900 dark:text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] lg:-ml-6 lg:z-10 transition-all duration-300 hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.6)]">
                    {/* Top Row: Green Glowing Dot + Precision Header + Currency */}
                    <div className="flex items-center justify-between gap-3 text-[12px] tracking-wide">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-white/90">
                                Available Balance
                            </span>
                            <span className="text-gray-400 dark:text-white/30">·</span>
                       
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {currency}
                        </span>
                    </div>

                    {/* Middle Graphic: Harmonic Soundwave Bars (Replicating Right Waveform) */}
                    <div className="my-6 flex h-20 items-center justify-center gap-1.5 sm:gap-2">
                        {rightWaveform.map((bar, idx) => (
                            <div
                                key={idx}
                                style={{ height: `${bar.h}%` }}
                                className={`w-1 sm:w-1.5 rounded-full bg-gray-800 dark:bg-white transition-all duration-300 group-hover:scale-y-105 ${bar.op}`}
                            />
                        ))}
                    </div>

                    {/* Bottom Row: Big Punchy Balance + Quick Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
                        <div className="min-w-0">
                            <p className="font-mono text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-none tracking-tight text-gray-900 dark:text-white tabular-nums">
                                {formatCurrency(balance)}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-600 dark:text-white/70">
                                    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    {net >= 0 ? "+" : "−"}
                                    {formatCurrency(Math.abs(net))} net
                                </span>
                                {pending > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                        <Clock className="h-3 w-3" />
                                        {formatCurrency(pending)} pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Action Pills */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Link
                                href={fundHref}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-[12px] font-semibold text-white shadow-md transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Fund</span>
                            </Link>
                            <Link
                                href={withdrawHref}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300/80 bg-white/70 px-3.5 py-2 text-[12px] font-semibold text-gray-800 shadow-sm transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98] dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                <span>Withdraw</span>
                            </Link>
                            <button
                                type="button"
                                onClick={handleSyncClick}
                                disabled={isSyncing}
                                title="Sync wallet balance"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300/80 bg-white/70 text-gray-700 transition-all hover:bg-white hover:text-black active:scale-[0.95] disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                            >
                                <RefreshCw
                                    className={`h-3.5 w-3.5 ${
                                        isSyncing ? "animate-spin" : ""
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Subtle Status & Management Strip */}
            <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11.5px] text-white/60">
                <div className="flex flex-wrap items-center gap-3">
                  
                    {updatedAt && (
                        <>
                            <span className="text-white/30 hidden sm:inline">·</span>
                            <span className="text-white/50">
                                Synced {formatShortDate(updatedAt)}
                            </span>
                        </>
                    )}
                </div>

                <Link
                    href={settingsHref}
                    className="inline-flex items-center gap-1 font-medium text-white/80 transition-colors hover:text-white hover:underline"
                >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Manage Account & Settings →</span>
                </Link>
            </div>
        </section>
    );
}


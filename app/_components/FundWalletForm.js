"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    CreditCard,
    Landmark,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminHeader from "@/app/_components/AdminHeader";
import CopyButton from "@/app/_components/CopyButton";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const inputClass =
    "w-full rounded-lg border border-line bg-card py-3 pl-9 pr-4 font-mono text-base font-semibold text-ink focus:border-primary focus:outline-none";

export default function FundWalletForm({
    currency = "NGN",
    balance = 0,
    vaNumber = null,
    vaName = "",
    vaBank = "",
    backHref = "/dashboard/property-owner/wallet",
    settingsHref = "/dashboard/property-owner/wallet/settings",
}) {
    const [amount, setAmount] = useState("");
    const [isPending, startTransition] = useTransition();

    const currencySymbol = currency === "NGN" ? "₦" : `${currency} `;
    const numAmount = Number(amount);
    const isValid = Number.isFinite(numAmount) && numAmount >= 100;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid || isPending) return;

        startTransition(async () => {
            try {
                toast.loading("Initializing secure Nomba checkout…", {
                    id: "nomba-checkout",
                });

                await new Promise((resolve) => setTimeout(resolve, 1200));

                toast.success(
                    `Nomba checkout session initialized for ${currencySymbol}${numAmount.toLocaleString()}!`,
                    { id: "nomba-checkout" }
                );
            } catch (err) {
                toast.error(err?.message || "Failed to initialize payment", {
                    id: "nomba-checkout",
                });
            }
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Fund Wallet" backHref={backHref} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Fund Wallet
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Deposit funds via instant Nomba checkout or direct transfer to your dedicated virtual account.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    {/* Wallet Overview */}
                    <div className="flex flex-col gap-4">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Wallet Overview
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-soft/60 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Wallet className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-mute">
                                        Available Balance
                                    </p>
                                    <p className="font-mono text-lg font-bold text-ink tabular-nums">
                                        {currencySymbol}
                                        {Number(balance || 0).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-mute">
                                <ShieldCheck
                                    className="h-4 w-4 text-emerald-500"
                                    aria-hidden="true"
                                />
                                <span>Instant settlement via Nomba</span>
                            </div>
                        </div>
                    </div>

                    {/* Direct Bank Transfer */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                            <p className="inline-flex items-center gap-2 text-base font-semibold text-ink">
                                <Landmark className="h-4 w-4 text-primary" aria-hidden="true" />
                                Direct Bank Transfer
                            </p>
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Free & Instant
                            </span>
                        </div>

                        {vaNumber ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-line bg-soft/50 p-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                                        Bank Name
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-ink">
                                        {vaBank || "Nombank MFB"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                                        Account Number
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="font-mono text-base font-bold text-ink tabular-nums">
                                            {vaNumber}
                                        </span>
                                        <CopyButton
                                            value={vaNumber}
                                            label="account number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                                        Account Name
                                    </p>
                                    <p className="mt-1 text-sm font-semibold capitalize text-ink">
                                        {vaName || "XPACY Account"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-dashed border-line bg-soft/40 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-ink">
                                        No virtual account provisioned yet
                                    </p>
                                    <p className="mt-0.5 text-xs text-mute">
                                        Activate your virtual account in wallet settings to receive direct bank transfers.
                                    </p>
                                </div>
                                <Link
                                    href={settingsHref}
                                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                >
                                    Activate virtual account
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Instant Card / Gateway Funding */}
                    <div className="flex flex-col gap-6">
                        <p className="inline-flex items-center gap-2 text-base font-semibold text-ink border-b border-line pb-3">
                            <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
                            Instant Card / Gateway Funding
                        </p>

                        <FormInput label={`Deposit Amount (${currency}) *`} id="amount">
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-mute">
                                    {currency === "NGN" ? "₦" : currency}
                                </span>
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min="100"
                                    step="100"
                                    placeholder="e.g. 10000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </FormInput>

                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-mute">
                                Quick Presets
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_AMOUNTS.map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setAmount(String(val))}
                                        className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                                            amount === String(val)
                                                ? "border-primary bg-primary text-white"
                                                : "border-line bg-soft/60 text-ink hover:border-primary/40"
                                        }`}
                                    >
                                        {currencySymbol}
                                        {val.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
                        <Link
                            href={backHref}
                            className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={!isValid || isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {isPending ? (
                                <SpinnerMini />
                            ) : (
                                <CreditCard className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                                {isPending ? "Connecting to Nomba..." : "Pay with Nomba"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}


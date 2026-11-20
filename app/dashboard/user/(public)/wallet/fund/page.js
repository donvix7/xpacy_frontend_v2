import Link from "next/link";
import {
    ChevronLeft,
    Wallet,
    Landmark,
    CreditCard,
    ShieldCheck,
    ArrowUpRight,
    Sparkles,
    CheckCircle2,
    Info,
} from "lucide-react";
import CopyButton from "@/app/_components/CopyButton";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getWallet } from "@/app/_lib/data-services";
import FundWalletForm from "./FundWalletForm";

export const metadata = {
    title: "Fund Wallet | XPACY",
    description: "Deposit funds into your XPACY wallet via bank transfer or card payment.",
};

export default async function FundWalletPage() {
    const results = await Promise.allSettled([getWallet()]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const walletRaw =
        results[0].status === "fulfilled" ? results[0].value : null;

    const wallet =
        walletRaw?.wallet ??
        walletRaw?.data?.wallet ??
        walletRaw?.data ??
        walletRaw ??
        {};

    const virtualAccount = wallet?.virtualAccount || null;
    const vaNumber =
        virtualAccount?.bankAccountNumber ||
        virtualAccount?.accountNumber ||
        virtualAccount?.account_number ||
        null;
    const vaName =
        virtualAccount?.bankAccountName ||
        virtualAccount?.accountName ||
        virtualAccount?.account_name ||
        "XPACY Account";
    const vaBank =
        virtualAccount?.bankName ||
        virtualAccount?.bank_name ||
        "Nombank MFB";
    const currency = wallet?.currency || virtualAccount?.currency || "NGN";
    const balance = Number(wallet?.balance ?? 0);

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* Back link */}
            <Link
                href="/dashboard/user/wallet"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to wallet
            </Link>

            {/* Header */}
            <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Deposit Funds
                </p>
                <h1 className="text-[26px] font-bold text-ink sm:text-[30px]">
                    Fund Your Wallet
                </h1>
                <p className="text-[13.5px] text-mute">
                    Choose your preferred funding method. Deposits are processed in real time via Nomba.
                </p>
            </div>

            {/* Current Balance Reminder Card */}
            <div className="flex items-center justify-between rounded-2xl border border-line bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11.5px] font-medium text-mute">
                            Available Balance
                        </p>
                        <p className="font-mono text-[20px] font-bold text-ink sm:text-[22px]">
                            {currency === "NGN" ? "₦" : currency}{" "}
                            {balance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[12px] text-mute">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Instant Nomba Settlement</span>
                </div>
            </div>

            {/* Two Funding Options */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Method 1: Virtual Account Transfer */}
                <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-sm">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="h-3 w-3" />
                                Recommended · Free & Instant
                            </span>
                        </div>

                        <div>
                            <h3 className="text-[17px] font-bold text-ink">
                                Bank Transfer
                            </h3>
                            <p className="mt-1 text-[12.5px] text-mute leading-relaxed">
                                Send funds from any banking app directly to your dedicated virtual account. Your balance updates automatically.
                            </p>
                        </div>

                        {vaNumber ? (
                            <div className="space-y-3 rounded-xl border border-line bg-soft p-4">
                                <div>
                                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-mute">
                                        Bank Name
                                    </p>
                                    <p className="mt-0.5 text-[14px] font-semibold text-ink">
                                        {vaBank}
                                    </p>
                                </div>

                                <div className="border-t border-line/60 pt-3">
                                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-mute">
                                        Account Number
                                    </p>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="font-mono text-[22px] font-bold tracking-tight text-ink tabular-nums">
                                            {vaNumber}
                                        </span>
                                        <CopyButton
                                            value={vaNumber}
                                            label="account number"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card text-ink hover:text-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-line/60 pt-3">
                                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-mute">
                                        Account Name
                                    </p>
                                    <p className="mt-0.5 text-[13px] font-semibold text-ink">
                                        {vaName}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-line bg-soft p-5 text-center">
                                <p className="text-[13px] font-semibold text-ink">
                                    No dedicated account provisioned
                                </p>
                                <p className="mt-1 text-[11.5px] text-mute">
                                    Set up your virtual account in settings to receive direct bank transfers.
                                </p>
                                <Link
                                    href="/dashboard/user/wallet/settings"
                                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                                >
                                    Activate virtual account
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-start gap-2 rounded-xl bg-soft/70 p-3 text-[11.5px] text-mute">
                        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>Transfers reflect in your wallet within 60 seconds via Nomba interbank webhook.</span>
                    </div>
                </div>

                {/* Method 2: Gateway Checkout (Card / USSD) */}
                <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-6 shadow-sm">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                                <CreditCard className="h-3 w-3" />
                                Debit Card / USSD
                            </span>
                        </div>

                        <div>
                            <h3 className="text-[17px] font-bold text-ink">
                                Instant Card Funding
                            </h3>
                            <p className="mt-1 text-[12.5px] text-mute leading-relaxed">
                                Enter the amount you want to add and complete payment through the secure Nomba checkout gateway.
                            </p>
                        </div>

                        {/* Interactive Funding Form */}
                        <FundWalletForm currency={currency} />
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-mute border-t border-line/60 pt-3">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            256-bit SSL Encrypted
                        </span>
                        <span>•</span>
                        <span>Powered by Nomba</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


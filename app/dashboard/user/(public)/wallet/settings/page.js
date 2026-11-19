import Link from "next/link";
import {
    ChevronLeft,
    ShieldCheck,
    Building2,
    CheckCircle2,
    Copy,
    Wallet,
    ArrowUpRight,
    RefreshCw,
} from "lucide-react";
import EmptyState from "@/app/_components/EmptyState";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getWallet, getUserProfile } from "@/app/_lib/data-services";
import SyncWalletButton from "@/app/_components/SyncWalletBtn";
import { createVirtualAccount, syncWallet } from "@/app/_lib/action";
import CreateVirtualAccountForm from "@/app/_components/VirtualAccountForm";

export default async function WalletSettingsPage() {
    const results = await Promise.allSettled([
        getWallet(),
        getUserProfile(),
    ]);

    const dataErrorMessages = getSettledErrorMessages(results);
    const walletRaw =
        results[0].status === "fulfilled" ? results[0].value : null;
    const profileRaw =
        results[1].status === "fulfilled" ? results[1].value : null;

    const wallet =
        walletRaw?.wallet ??
        walletRaw?.data?.wallet ??
        walletRaw?.data ??
        walletRaw ??
        {};

    const profile =
        profileRaw?.user ??
        profileRaw?.data?.user ??
        profileRaw?.data ??
        profileRaw ??
        {};

    const walletId = wallet.walletId || wallet.id || "—";
    const currency = wallet.currency || "NGN";
    const virtualAccount = wallet.virtualAccount || null;
    const hasVirtualAccount = !!virtualAccount;

    const vaNumber =
        virtualAccount?.bankAccountNumber ||
        virtualAccount?.account_number ||
        virtualAccount?.number ||
        null;
    const vaName =
        virtualAccount?.bankAccountName ||
        virtualAccount?.account_name ||
        virtualAccount?.name ||
        null;
    const vaBank =
        virtualAccount?.bankName ||
        virtualAccount?.bank_name ||
        virtualAccount?.bank ||
        null;

    const firstName =
        profile.firstName || profile.firstname || profile.first_name || "";
    const lastName =
        profile.lastName || profile.lastname || profile.last_name || "";
    const phone = profile.phone || profile.phone_number || "";
    const email = profile.email || "";

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/user/wallet"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to wallet
            </Link>

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Wallet settings
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                Virtual account
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                Set up a dedicated account number so you can
                                receive deposits directly into your wallet.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <SyncWalletButton onSync={syncWallet} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Current virtual account ---------- */}
            {hasVirtualAccount ? (
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                className="h-4 w-4 text-emerald-600"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Virtual account active
                            </h2>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                            <span className="h-1 w-1 rounded-full bg-current" />
                            Active
                        </span>
                    </div>

                    <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                        {/* Account number — hero-style */}
                        <div>
                            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                Account number
                            </p>
                            <p className="mt-2 font-mono text-[28px] font-bold tracking-tight text-ink tabular-nums">
                                {vaNumber || "—"}
                            </p>
                            <p className="mt-1 text-[12.5px] text-gray-500">
                                {vaBank || "Bank not specified"}
                            </p>
                        </div>

                        {/* Account name */}
                        <div>
                            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                Account name
                            </p>
                            <p className="mt-2 text-[15px] font-semibold capitalize text-ink">
                                {vaName || "—"}
                            </p>
                            <p className="mt-1 text-[12px] text-gray-500">
                                Use these details when funding your wallet.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-[11.5px] text-gray-600">
                                Deposits to this account reflect in your wallet
                                within a few minutes.
                            </p>
                            <Link
                                href="/dashboard/user/wallet/fund"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-primary-800"
                            >
                                <Wallet
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Fund wallet
                            </Link>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white">
                    <div className="px-5 py-8 text-center sm:px-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <Building2
                                className="h-6 w-6 text-gray-400"
                                aria-hidden="true"
                            />
                        </div>
                        <h2 className="mt-3 text-[15px] font-semibold text-ink">
                            No virtual account yet
                        </h2>
                        <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-gray-500">
                            Create one to receive bank transfers directly into
                            your wallet. Setup takes less than a minute.
                        </p>
                    </div>
                </section>
            )}

            {/* ---------- Create form (only if no account) ---------- */}
            {!hasVirtualAccount && (
                <section className="rounded-2xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Create virtual account
                            </h2>
                        </div>
                        <p className="mt-1 text-[11.5px] text-gray-500">
                            We&apos;ll use your verified identity to provision a
                            dedicated account number for your wallet.
                        </p>
                    </div>

                    <div className="p-5 sm:p-6">
                        <CreateVirtualAccountForm
                            onCreate={createVirtualAccount}
                            defaultFirstName={firstName}
                            defaultLastName={lastName}
                            defaultPhone={phone}
                            defaultEmail={email}
                        />
                    </div>
                </section>
            )}

            {/* ---------- Wallet details (compact) ---------- */}
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-3">
                    <h2 className="text-[13.5px] font-semibold text-ink">
                        Wallet details
                    </h2>
                </div>
                <div className="grid gap-3 p-5 text-[12.5px] sm:grid-cols-2 sm:p-6">
                    <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Wallet ID</span>
                        <span className="truncate text-right font-mono text-[11px] font-semibold text-ink">
                            {walletId}
                        </span>
                    </div>
                    
                </div>
            </section>

            {/* ---------- Help footer ---------- */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[12px] text-gray-600">
                        Need help setting up your virtual account?
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
                    >
                        Contact support
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
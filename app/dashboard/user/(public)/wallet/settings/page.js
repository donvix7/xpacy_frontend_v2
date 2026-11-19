import Link from "next/link";
import {
    ChevronLeft,
    ShieldCheck,
    Building2,
    Wallet,
    ArrowUpRight,
    RefreshCw,
    Clock,
    ShieldAlert,
    Hash,
    Landmark,
    CalendarDays,
    Activity,
    KeyRound,
    Coins,
    Link2,
    ArrowDownLeft,
    ArrowUpRight as ArrowUpRightIcon,
    Receipt,
    Inbox,
} from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

import CreateVirtualAccountForm from "@/app/_components/VirtualAccountForm";
import CopyButton from "@/app/_components/CopyButton";
import DeleteAccountModal from "@/app/_components/DeleteAccountModal";
import SyncWalletButton from "@/app/_components/SyncWalletBtn";
import {
    createVirtualAccount,
    refreshVirtualAccount,
    syncWallet,
} from "@/app/_lib/action";
import { getUserProfile, getVirtualAccountById, getVirtualAccountTransactions, getWallet } from "@/app/_lib/data-services";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatDateTime(v) {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return String(v);
    }
}

function formatAmount(amount, currency = "NGN") {
    if (amount === undefined || amount === null || amount === "") return "—";
    const n = Number(amount);
    if (Number.isNaN(n)) return String(amount);
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(n);
    } catch {
        return `${currency} ${n.toLocaleString()}`;
    }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function WalletSettingsPage() {
    const results = await Promise.allSettled([getWallet(), getUserProfile()]);

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
    const virtualAccount = wallet.virtualAccount || null;
    const hasVirtualAccount = !!virtualAccount;

    /* ---------- Fetch full VA details ---------- */
    const vaDetailsResult = hasVirtualAccount
        ? await Promise.allSettled([getVirtualAccountById(virtualAccount?.id)])
        : null;
    const vaDetails =
        vaDetailsResult?.[0]?.status === "fulfilled"
            ? vaDetailsResult[0].value
            : null;

    /* ---------- Fetch VA transactions ---------- */
    const vaTxResult = hasVirtualAccount
        ? await Promise.allSettled([
              getVirtualAccountTransactions(virtualAccount?.id),
          ])
        : null;
    const vaTxRaw =
        vaTxResult?.[0]?.status === "fulfilled"
            ? vaTxResult[0].value
            : null;

    /* Normalize various possible response shapes */
    const vaTransactions = (() => {
        if (!vaTxRaw) return [];
        if (Array.isArray(vaTxRaw)) return vaTxRaw;
        if (Array.isArray(vaTxRaw?.transactions)) return vaTxRaw.transactions;
        if (Array.isArray(vaTxRaw?.data?.transactions))
            return vaTxRaw.data.transactions;
        if (Array.isArray(vaTxRaw?.data)) return vaTxRaw.data;
        return [];
    })();

    /* Prefer the detailed record, fall back to the embedded one */
    const va = vaDetails || virtualAccount || {};

    /* ---------- Normalized fields (matching your API response) ---------- */
    const vaId = va?.id ?? "—";
    const vaReference = va?.accountRef ?? "—";
    const vaNumber = va?.bankAccountNumber ?? null;
    const vaBankName = va?.bankName ?? null;
    const vaBankAccountName = va?.bankAccountName ?? va?.accountName ?? "—";
    const vaCurrency = va?.currency ?? "NGN";
    const vaExpired = va?.expired === true;
    const vaCreatedAt = va?.createdAt ?? null;
    const vaUpdatedAt = va?.updatedAt ?? null;

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

            {/* ---------- Hero (with VA info) ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Wallet settings
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                Virtual account
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                {hasVirtualAccount
                                    ? "Your dedicated account number for receiving deposits directly into your wallet."
                                    : "Set up a dedicated account number so you can receive deposits directly into your wallet."}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {hasVirtualAccount && (
                                <form action={refreshVirtualAccount}>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                                    >
                                        <RefreshCw
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Refresh account
                                    </button>
                                </form>
                            )}
                            <Link
                                href="/dashboard/user/wallet/fund"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12px] font-semibold text-primary transition-colors hover:bg-white/90"
                            >
                                <Wallet
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Fund wallet
                            </Link>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                                    vaExpired
                                        ? "bg-red-500/15 text-red-300"
                                        : "bg-emerald-500/15 text-emerald-300"
                                }`}
                            >
                                <span className="h-1 w-1 rounded-full bg-current" />
                                {vaExpired ? "Expired" : "Active"}
                            </span>
                        </div>
                    </div>

                    {/* VA info grid */}
                    {hasVirtualAccount && (
                        <div className="grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                            {/* Account name */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck
                                        className={`h-3.5 w-3.5 ${
                                            vaExpired
                                                ? "text-red-400"
                                                : "text-emerald-400"
                                        }`}
                                        aria-hidden="true"
                                    />
                                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/60">
                                        Account name
                                    </p>
                                </div>
                                <p className="mt-2 text-[16px] font-semibold capitalize text-white">
                                    {vaBankAccountName || "—"}
                                </p>
                                <p className="mt-1 text-[12px] text-white/60">
                                    Use these details when funding your wallet.
                                </p>
                            </div>

                            {/* Account number + copy */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <Hash
                                        className="h-3.5 w-3.5 text-white/60"
                                        aria-hidden="true"
                                    />
                                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/60">
                                        Account number
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="font-mono text-[26px] font-bold tracking-tight text-white tabular-nums sm:text-[28px]">
                                        {vaNumber || "—"}
                                    </p>
                                    {vaNumber && (
                                        <CopyButton
                                            value={vaNumber}
                                            label="account number"
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                                        />
                                    )}
                                </div>
                                <p className="mt-1 text-[12px] text-white/60">
                                    {vaBankName || "Bank not specified"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ---------- No virtual account — empty state ---------- */}
            {!hasVirtualAccount && (
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

            {/* ---------- Virtual account details ---------- */}
            {hasVirtualAccount && (
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <Landmark
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Virtual account details
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-left text-[12.5px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/60">
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                    >
                                        Field
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                    >
                                        Value
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-12 px-2 py-3 sm:px-3"
                                        aria-label="Actions"
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <KeyRound
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Account ID
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-[11.5px] font-semibold text-ink sm:px-6">
                                        <span className="block max-w-[260px] truncate">
                                            {vaId}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 text-right sm:px-3">
                                        <CopyButton
                                            value={vaId}
                                            label="account ID"
                                        />
                                    </td>
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Link2
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Reference
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-[11.5px] font-semibold text-ink sm:px-6">
                                        <span className="block max-w-[260px] truncate">
                                            {vaReference}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 text-right sm:px-3">
                                        <CopyButton
                                            value={vaReference}
                                            label="reference"
                                        />
                                    </td>
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Hash
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Account number
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-[11.5px] font-semibold text-ink sm:px-6">
                                        {vaNumber || "—"}
                                    </td>
                                    <td className="px-2 py-3 text-right sm:px-3">
                                        {vaNumber && (
                                            <CopyButton
                                                value={vaNumber}
                                                label="account number"
                                            />
                                        )}
                                    </td>
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <ShieldCheck
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Account name
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[12.5px] font-medium capitalize text-ink sm:px-6">
                                        {vaBankAccountName || "—"}
                                    </td>
                                    <td className="px-2 py-3 sm:px-3" />
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Landmark
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Bank
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                        {vaBankName || "—"}
                                    </td>
                                    <td className="px-2 py-3 sm:px-3" />
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Coins
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Currency
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                        {vaCurrency}
                                    </td>
                                    <td className="px-2 py-3 sm:px-3" />
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Activity
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Status
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 sm:px-6">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                                                vaExpired
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-emerald-50 text-emerald-700"
                                            }`}
                                        >
                                            <span className="h-1 w-1 rounded-full bg-current" />
                                            {vaExpired ? "Expired" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 sm:px-3" />
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <CalendarDays
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Created
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                        {formatDateTime(vaCreatedAt)}
                                    </td>
                                    <td className="px-2 py-3 sm:px-3" />
                                </tr>

                                <tr className="transition-colors hover:bg-primary-50/40">
                                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <CalendarDays
                                                className="h-3.5 w-3.5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                                Last updated
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                        {formatDateTime(vaUpdatedAt)}
                                    </td>
                                    <td className="px-2 py-3 sm:px-3" />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ---------- Virtual account transactions ---------- */}
            {hasVirtualAccount && (
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <Receipt
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Virtual account transactions
                            </h2>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-gray-700">
                            <span className="h-1 w-1 rounded-full bg-current" />
                            {vaTransactions.length} record
                            {vaTransactions.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    {vaTransactions.length === 0 ? (
                        <div className="px-5 py-10 text-center sm:px-6">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <Inbox
                                    className="h-6 w-6 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <h3 className="mt-3 text-[13.5px] font-semibold text-ink">
                                No transactions yet
                            </h3>
                            <p className="mx-auto mt-1 max-w-sm text-[12px] text-gray-500">
                                Deposits to your virtual account will appear
                                here within a few minutes of receipt.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-[12.5px]">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/60">
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                        >
                                            Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                        >
                                            Description
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                        >
                                            Amount
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                        >
                                            Type
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-2 py-3 sm:px-3"
                                            aria-label="Actions"
                                        />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vaTransactions.map((tx, idx) => {
                                        /* --- Normalize common shape variants --- */
                                        const txId =
                                            tx.id ??
                                            tx.transactionId ??
                                            tx.reference ??
                                            `tx-${idx}`;
                                        const txDate =
                                            tx.createdAt ??
                                            tx.date ??
                                            tx.transactionDate ??
                                            tx.created_at ??
                                            null;
                                        const txDesc =
                                            tx.description ??
                                            tx.narration ??
                                            tx.remark ??
                                            tx.reference ??
                                            "—";
                                        const txAmount =
                                            tx.amount ??
                                            tx.transactionAmount ??
                                            tx.value ??
                                            null;
                                        const txCurrency =
                                            tx.currency ?? vaCurrency;
                                        const rawType =
                                            tx.type ??
                                            tx.transactionType ??
                                            tx.direction ??
                                            "";
                                        const isCredit =
                                            /credit|inflow|deposit|in/i.test(
                                                String(rawType)
                                            ) || Number(txAmount) > 0;
                                        const txType = isCredit
                                            ? "Credit"
                                            : "Debit";
                                        const txStatus =
                                            tx.status ??
                                            tx.transactionStatus ??
                                            "successful";
                                        const statusStr = String(
                                            txStatus
                                        ).toLowerCase();
                                        const statusStyles =
                                            statusStr.includes("success") ||
                                            statusStr === "completed"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : statusStr.includes("fail") ||
                                                    statusStr.includes(
                                                        "revers"
                                                    )
                                                  ? "bg-red-50 text-red-700"
                                                  : "bg-amber-50 text-amber-700";

                                        return (
                                            <tr
                                                key={txId}
                                                className="transition-colors hover:bg-primary-50/40"
                                            >
                                                <td className="whitespace-nowrap px-5 py-3 text-[11.5px] text-gray-600 sm:px-6">
                                                    {formatDateTime(txDate)}
                                                </td>
                                                <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                                                isCredit
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-red-50 text-red-700"
                                                            }`}
                                                        >
                                                            {isCredit ? (
                                                                <ArrowDownLeft
                                                                    className="h-3 w-3"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <ArrowUpRightIcon
                                                                    className="h-3 w-3"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                        </span>
                                                        <span className="max-w-[260px] truncate">
                                                            {txDesc}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    className={`whitespace-nowrap px-5 py-3 text-right font-mono text-[12px] font-semibold sm:px-6 ${
                                                        isCredit
                                                            ? "text-emerald-700"
                                                            : "text-red-700"
                                                    }`}
                                                >
                                                    {isCredit ? "+" : "−"}
                                                    {formatAmount(
                                                        Math.abs(
                                                            Number(txAmount) ||
                                                                0
                                                        ),
                                                        txCurrency
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                                                            isCredit
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-red-50 text-red-700"
                                                        }`}
                                                    >
                                                        <span className="h-1 w-1 rounded-full bg-current" />
                                                        {txType}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${statusStyles}`}
                                                    >
                                                        <span className="h-1 w-1 rounded-full bg-current" />
                                                        {txStatus}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 text-right sm:px-3">
                                                    {(tx.reference ||
                                                        tx.id) && (
                                                        <CopyButton
                                                            value={
                                                                tx.reference ||
                                                                tx.id
                                                            }
                                                            label="transaction reference"
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* ---------- Create form ---------- */}
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

            {/* ---------- Wallet details ---------- */}
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

            {/* ============================================================ */}
            {/* DANGER ZONE                                                   */}
            {/* ============================================================ */}
            <section className="overflow-hidden rounded-2xl border border-red-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-5 py-3">
                    <div className="flex items-center gap-2">
                        <ShieldAlert
                            className="h-4 w-4 text-red-600"
                            aria-hidden="true"
                        />
                        <h2 className="text-[13.5px] font-semibold text-red-900">
                            Danger zone
                        </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-red-700">
                        <span className="h-1 w-1 rounded-full bg-current" />
                        Irreversible
                    </span>
                </div>

                <div className="divide-y divide-red-100">
                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Clock
                                    className="h-4 w-4 shrink-0 text-amber-600"
                                    aria-hidden="true"
                                />
                                <h3 className="text-[13.5px] font-semibold text-ink">
                                    Expire account
                                </h3>
                            </div>
                            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-gray-600">
                                Schedule this account for deletion after a
                                30-day grace period. You can cancel anytime
                                during that window by logging back in.
                            </p>
                        </div>

                        <DeleteAccountModal
                            id={virtualAccount?.id}
                            mode="expire"
                        >
                            <button
                                type="button"
                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-[12px] font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                            >
                                <Clock
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Expire account
                            </button>
                        </DeleteAccountModal>
                    </div>
                </div>
            </section>
        </div>
    );
}
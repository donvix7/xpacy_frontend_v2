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
    User,
    Mail,
    Phone,
} from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import CopyButton from "@/app/_components/CopyButton";
import DeleteAccountModal from "@/app/_components/DeleteAccountModal";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import {
    getAdminVirtualAccountById,
    getAdminVirtualAccountTransactions,
} from "@/app/_lib/data-services";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatDateTime(v) {
    if (!v) return "—";
    try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        return d.toLocaleString("en-NG", {
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

function getUserDisplayName(account) {
    const u = account?.user;
    if (u?.firstName || u?.lastName) {
        return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    }
    if (u?.name) return u.name;
    if (account?.accountName) {
        return account.accountName.replace(/^XPACY\/?/i, "");
    }
    return "Unknown User";
}

export async function generateMetadata(props) {
    const params = await props.params;
    return {
        title: `Virtual Account ${params?.id || ""} | Admin`,
        description: "View and manage virtual account details and transactions.",
    };
}

export default async function AdminVirtualAccountDetailPage(props) {
    const params = await props.params;
    const id = params?.id;

    const results = await Promise.allSettled([
        getAdminVirtualAccountById(id),
        getAdminVirtualAccountTransactions(id),
    ]);

    const dataErrorMessages = getSettledErrorMessages(results);

    const vaRaw =
        results[0].status === "fulfilled" ? results[0].value : null;
    const txRaw =
        results[1].status === "fulfilled" ? results[1].value : null;

    // Normalize VA data (supports { success: true, data: {...} } or {...})
    const va = vaRaw?.data ?? vaRaw ?? {};

    const vaTransactions = (() => {
        if (!txRaw) return [];
        if (Array.isArray(txRaw)) return txRaw;
        if (Array.isArray(txRaw?.transactions)) return txRaw.transactions;
        if (Array.isArray(txRaw?.data?.transactions))
            return txRaw.data.transactions;
        if (Array.isArray(txRaw?.data)) return txRaw.data;
        return [];
    })();

    const vaId = va?.id ?? id ?? "—";
    const vaReference = va?.accountRef ?? "—";
    const vaNumber = va?.bankAccountNumber ?? null;
    const vaBankName = va?.bankName ?? null;
    const vaBankAccountName = va?.bankAccountName ?? va?.accountName ?? "—";
    const vaCurrency = va?.currency ?? "NGN";
    const vaExpired = va?.expired === true;
    const vaCreatedAt = va?.createdAt ?? null;
    const vaUpdatedAt = va?.updatedAt ?? null;

    const user = va?.user ?? {};
    const userId = va?.userId ?? user?.id ?? null;
    const userName = getUserDisplayName(va);
    const userEmail = user?.email ?? null;
    const userPhone =
        user?.phone ?? user?.phoneNumber ?? user?.phone_number ?? null;
    const userRole = user?.role ?? user?.user_role ?? null;

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* Back link */}
            <Link
                href="/dashboard/admin/wallet/settings"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to virtual accounts
            </Link>

            {/* ---------- Hero (Virtual Account Overview) ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Admin Console · Virtual Account
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {vaBankAccountName}
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                Dedicated account number for receiving deposits directly into this user&apos;s wallet.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {userId && (
                                <Link
                                    href={`/dashboard/admin/users/${userId}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    View user profile
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            )}

                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                                    vaExpired
                                        ? "bg-red-500/15 text-red-300"
                                        : "bg-emerald-500/15 text-emerald-300"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        vaExpired ? "bg-red-400" : "bg-emerald-400"
                                    }`}
                                />
                                {vaExpired ? "Expired" : "Active"}
                            </span>
                        </div>
                    </div>

                    {/* VA info grid */}
                    <div className="grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                        {/* Account Name */}
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
                            <p className="mt-2 text-[16px] font-semibold text-white">
                                {vaBankAccountName}
                            </p>
                            <p className="mt-1 text-[12px] text-white/60">
                                Designated deposit name for transfers.
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
                                {vaBankName || "Bank not specified"} · {vaCurrency}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Virtual Account & Holder Details Table ---------- */}
            <section className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="flex items-center justify-between gap-3 border-b border-line bg-soft/50 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <Landmark
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                        />
                        <h2 className="text-[14px] font-semibold text-ink">
                            Virtual Account & Holder Information
                        </h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-[12.5px]">
                        <thead>
                            <tr className="border-b border-line bg-soft/30">
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
                                >
                                    Field
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
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
                        <tbody className="divide-y divide-line">
                            {/* Account ID */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Account ID
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 font-mono text-[12px] font-semibold text-ink sm:px-6">
                                    {vaId}
                                </td>
                                <td className="px-2 py-3 text-right sm:px-3">
                                    <CopyButton
                                        value={vaId}
                                        label="account ID"
                                    />
                                </td>
                            </tr>

                            {/* Reference */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <Link2 className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Account Reference
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 font-mono text-[12px] font-semibold text-ink sm:px-6">
                                    {vaReference}
                                </td>
                                <td className="px-2 py-3 text-right sm:px-3">
                                    <CopyButton
                                        value={vaReference}
                                        label="reference"
                                    />
                                </td>
                            </tr>

                            {/* Account Number */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <Hash className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Account Number
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 font-mono text-[12px] font-semibold text-ink sm:px-6">
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

                            {/* Account Name */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Account Name
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                    {vaBankAccountName}
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>

                            {/* Bank */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <Landmark className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Bank Name
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                    {vaBankName || "—"}
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>

                            {/* Currency */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <Coins className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Currency
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 font-mono text-[12.5px] font-semibold text-ink sm:px-6">
                                    {vaCurrency}
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>

                            {/* Account Holder */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Account Holder
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                    <div className="flex items-center gap-2">
                                        <span>{userName}</span>
                                        {userRole && (
                                            <span className="rounded-md bg-soft px-2 py-0.5 text-[10.5px] font-semibold capitalize text-mute">
                                                {userRole}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-right sm:px-3">
                                    {userId && (
                                        <Link
                                            href={`/dashboard/admin/users/${userId}`}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                            title="View user profile"
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </td>
                            </tr>

                            {/* Holder Email */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Email Address
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[12.5px] text-ink sm:px-6">
                                    {userEmail || "—"}
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>

                            {/* User ID */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            User ID
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 font-mono text-[12px] text-ink sm:px-6">
                                    {userId || "—"}
                                </td>
                                <td className="px-2 py-3 text-right sm:px-3">
                                    {userId && (
                                        <CopyButton
                                            value={userId}
                                            label="user ID"
                                        />
                                    )}
                                </td>
                            </tr>

                            {/* Status */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Status
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 sm:px-6">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                                            vaExpired
                                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                vaExpired
                                                    ? "bg-red-500"
                                                    : "bg-emerald-500"
                                            }`}
                                        />
                                        {vaExpired ? "Expired" : "Active"}
                                    </span>
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>

                            {/* Created Date */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Created At
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[12.5px] text-ink sm:px-6">
                                    {formatDateTime(vaCreatedAt)}
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>

                            {/* Last Updated */}
                            <tr className="transition-colors hover:bg-soft">
                                <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                    <div className="flex items-center gap-2 text-mute">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                                            Last Updated
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[12.5px] text-ink sm:px-6">
                                    {formatDateTime(vaUpdatedAt)}
                                </td>
                                <td className="px-2 py-3 sm:px-3" />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------- Virtual Account Transactions ---------- */}
            <section className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="flex items-center justify-between gap-3 border-b border-line bg-soft/50 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <Receipt
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                        />
                        <h2 className="text-[14px] font-semibold text-ink">
                            Virtual Account Transactions
                        </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-mute">
                        {vaTransactions.length} record
                        {vaTransactions.length === 1 ? "" : "s"}
                    </span>
                </div>

                {vaTransactions.length === 0 ? (
                    <div className="px-5 py-12 text-center sm:px-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-soft text-mute">
                            <Inbox className="h-6 w-6" />
                        </div>
                        <h3 className="mt-3 text-[14px] font-semibold text-ink">
                            No transactions yet
                        </h3>
                        <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-mute">
                            Deposits made into this virtual account will appear here once processed.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-[12.5px]">
                            <thead>
                                <tr className="border-b border-line bg-soft/30">
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
                                    >
                                        Date
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
                                    >
                                        Description
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
                                    >
                                        Amount
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
                                    >
                                        Type
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-mute sm:px-6"
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
                            <tbody className="divide-y divide-line">
                                {vaTransactions.map((tx, idx) => {
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
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : statusStr.includes("fail") ||
                                                statusStr.includes("revers")
                                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

                                    return (
                                        <tr
                                            key={txId}
                                            className="transition-colors hover:bg-soft"
                                        >
                                            <td className="whitespace-nowrap px-5 py-3 text-[11.5px] text-mute sm:px-6">
                                                {formatDateTime(txDate)}
                                            </td>
                                            <td className="px-5 py-3 text-[12.5px] font-medium text-ink sm:px-6">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                                            isCredit
                                                                ? "bg-emerald-500/10 text-emerald-600"
                                                                : "bg-red-500/10 text-red-600"
                                                        }`}
                                                    >
                                                        {isCredit ? (
                                                            <ArrowDownLeft className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowUpRightIcon className="h-3 w-3" />
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
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {isCredit ? "+" : "−"}
                                                {formatAmount(
                                                    Math.abs(
                                                        Number(txAmount) || 0
                                                    ),
                                                    txCurrency
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${
                                                        isCredit
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    }`}
                                                >
                                                    <span className="h-1 w-1 rounded-full bg-current" />
                                                    {txType}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${statusStyles}`}
                                                >
                                                    <span className="h-1 w-1 rounded-full bg-current" />
                                                    {txStatus}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-right sm:px-3">
                                                {(tx.reference || tx.id) && (
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

            {/* ---------- Danger Zone ---------- */}
            <section className="overflow-hidden rounded-2xl border border-red-500/20 bg-card">
                <div className="flex items-center justify-between gap-3 border-b border-red-500/20 bg-red-500/5 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <ShieldAlert
                            className="h-4 w-4 text-red-600 dark:text-red-400"
                            aria-hidden="true"
                        />
                        <h2 className="text-[14px] font-semibold text-red-600 dark:text-red-400">
                            Danger zone
                        </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                        <span className="h-1 w-1 rounded-full bg-current" />
                        Irreversible
                    </span>
                </div>

                <div className="divide-y divide-red-500/10">
                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Clock
                                    className="h-4 w-4 shrink-0 text-amber-600"
                                    aria-hidden="true"
                                />
                                <h3 className="text-[13.5px] font-semibold text-ink">
                                    Expire virtual account
                                </h3>
                            </div>
                            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-mute">
                                {vaExpired
                                    ? "This virtual account is already expired and cannot accept incoming transfers."
                                    : "Deactivate and schedule this account for deletion. Transfers to this account number will be rejected."}
                            </p>
                        </div>

                        {!vaExpired ? (
                            <DeleteAccountModal
                                id={vaId}
                                mode="expire"
                            >
                                <button
                                    type="button"
                                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[12px] font-semibold text-red-800 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                                >
                                    <Clock
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Expire account
                                </button>
                            </DeleteAccountModal>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-soft px-3 py-1.5 text-[12px] font-medium text-mute">
                                Account is expired
                            </span>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}


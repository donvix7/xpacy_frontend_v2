import Link from "next/link";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Clock,
    CreditCard,
    Plus,
    Receipt,
    Building2,
    ShieldCheck,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { formatCurrency } from "@/app/_lib/utils";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getWallet, getWalletTransactions } from "@/app/_lib/data-services";
import { syncWallet } from "@/app/_lib/action";
import SyncWalletButton from "@/app/_components/SyncWalletBtn";

const headers = [
    { heading: "Reference" },
    { heading: "Type" },
    { heading: "Description" },
    { heading: "Amount", center: true },
    { heading: "Balance after", center: true },
    { heading: "Status", center: true },
    { heading: "Date" },
];

const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const txReference = (tx, i) =>
    tx.reference ||
    tx.reference_id ||
    tx.transaction_id ||
    tx.id ||
    `TX-${String(i + 1).padStart(4, "0")}`;

const txType = (tx) => {
    const raw = String(tx.type || tx.transaction_type || "").toLowerCase();
    if (raw.includes("credit") || raw.includes("deposit") || raw.includes("inflow"))
        return "credit";
    if (raw.includes("debit") || raw.includes("withdraw") || raw.includes("outflow"))
        return "debit";
    return "credit";
};

const txAmount = (tx) => {
    const n = Number(tx.amount ?? tx.total ?? tx.value ?? 0);
    return Number.isFinite(n) ? n : 0;
};

const txBalanceAfter = (tx) => {
    const n = Number(tx.balanceAfter ?? tx.balance_after ?? NaN);
    return Number.isFinite(n) ? n : null;
};

const txStatus = (tx) => {
    const raw = String(tx.status || tx.transaction_status || "success").toLowerCase();
    if (raw === "success" || raw === "successful" || raw === "completed")
        return "completed";
    if (raw === "pending" || raw === "processing") return "pending";
    if (raw === "failed" || raw === "error" || raw === "declined") return "failed";
    return raw;
};

const txDescription = (tx) =>
    tx.description ||
    tx.narration ||
    tx.reason ||
    tx.metadata?.description ||
    (txType(tx) === "credit" ? "Wallet credit" : "Wallet debit");

export default async function WalletPage() {
    const results = await Promise.allSettled([
        getWallet(),
        getWalletTransactions(),
    ]);

    const dataErrorMessages = getSettledErrorMessages(results);
    const walletRaw =
        results[0].status === "fulfilled" ? results[0].value : null;
    const txRaw = results[1].status === "fulfilled" ? results[1].value : [];

    // Wallet shape — unwrap common wrappers
    const wallet =
        walletRaw?.wallet ??
        walletRaw?.data?.wallet ??
        walletRaw?.data ??
        walletRaw ??
        {};

    // Transactions shape — unwrap wrappers and paginated results
    const transactions = Array.isArray(txRaw)
        ? txRaw
        : Array.isArray(txRaw?.transactions)
          ? txRaw.transactions
          : Array.isArray(txRaw?.data?.transactions)
            ? txRaw.data.transactions
            : Array.isArray(txRaw?.data)
              ? txRaw.data
              : [];

    // ---------- Wallet fields ----------
    const walletId = wallet.walletId || wallet.id || "—";
    const balance = Number(wallet.balance ?? 0);
    const currency = wallet.currency || "NGN";
    const updatedAt = wallet.updatedAt || wallet.updated_at;

    const virtualAccount = wallet.virtualAccount || null;
    const hasVirtualAccount = !!virtualAccount;
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

    // ---------- Derived ----------
    const pendingTransactions = transactions.filter(
        (t) => txStatus(t) === "pending" && txType(t) === "credit",
    );
    const pending = pendingTransactions.reduce(
        (sum, t) => sum + txAmount(t),
        0,
    );

    const completedCredits = transactions.filter(
        (t) => txType(t) === "credit" && txStatus(t) === "completed",
    );
    const completedDebits = transactions.filter(
        (t) => txType(t) === "debit" && txStatus(t) === "completed",
    );
    const credits = completedCredits.reduce((sum, t) => sum + txAmount(t), 0);
    const debits = completedDebits.reduce((sum, t) => sum + txAmount(t), 0);
    const net = credits - debits;

    const heroStats = [
        {
            label: "Available balance",
            value: formatCurrency(balance),
            hint: "Ready to use",
        },
        {
            label: "Pending",
            value: formatCurrency(pending),
            hint:
                pendingTransactions.length > 0
                    ? `${pendingTransactions.length} transaction${
                          pendingTransactions.length === 1 ? "" : "s"
                      }`
                    : "Nothing pending",
        },
        {
            label: "Total credits",
            value: formatCurrency(credits),
            hint: `${completedCredits.length} completed`,
        },
        {
            label: "Total debits",
            value: formatCurrency(debits),
            hint: `${completedDebits.length} completed`,
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    // ---------- Row renderer ----------
    const renderRow = (tx, index) => {
        const type = txType(tx);
        const isCredit = type === "credit";
        const balanceAfter = txBalanceAfter(tx);

        return (
            <tr
                key={tx.id || tx.reference || index}
                className="border-b border-gray-100 text-sm transition-colors last:border-0 hover:bg-gray-50/60"
            >
                <td className="p-4 font-mono text-[12.5px] text-gray-700">
                    <Link
                        href={`/dashboard/user/wallet/${tx.id || tx.reference}`}
                        className="hover:underline"
                    >
                        {txReference(tx, index)}
                    </Link>
                </td>
                <td className="p-4">
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                            isCredit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {isCredit ? (
                            <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                            <ArrowUpRight className="h-3 w-3" />
                        )}
                        {type}
                    </span>
                </td>
                <td className="max-w-xs truncate p-4 text-gray-600">
                    {txDescription(tx)}
                </td>
                <td className="p-4 text-center">
                    <span
                        className={`font-bold tabular-nums ${
                            isCredit ? "text-emerald-700" : "text-red-600"
                        }`}
                    >
                        {isCredit ? "+" : "−"}
                        {formatCurrency(txAmount(tx))}
                    </span>
                </td>
                <td className="p-4 text-center font-mono text-[12px] tabular-nums text-gray-600">
                    {balanceAfter !== null ? formatCurrency(balanceAfter) : "—"}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={txStatus(tx)} />
                    </div>
                </td>
                <td className="p-4 text-gray-600">
                    {formatDate(tx.createdAt || tx.created_at || tx.date)}
                </td>
            </tr>
        );
    };

    // ---------- Mobile card renderer ----------
    const renderMobileCard = (tx, index) => {
        const type = txType(tx);
        const isCredit = type === "credit";
        const balanceAfter = txBalanceAfter(tx);

        return (
            <article
                key={tx.id || tx.reference || index}
                className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] text-gray-500">
                            {txReference(tx, index)}
                        </p>
                        <p className="mt-1 text-[13px] font-semibold capitalize text-ink">
                            {txDescription(tx)}
                        </p>
                    </div>
                    <StatusChips status={txStatus(tx)} />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                            isCredit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {isCredit ? (
                            <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                            <ArrowUpRight className="h-3 w-3" />
                        )}
                        {type}
                    </span>
                    <span
                        className={`text-[15px] font-bold tabular-nums ${
                            isCredit ? "text-emerald-700" : "text-red-600"
                        }`}
                    >
                        {isCredit ? "+" : "−"}
                        {formatCurrency(txAmount(tx))}
                    </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11.5px] text-gray-500">
                    <span>
                        {formatDate(tx.createdAt || tx.created_at || tx.date)}
                    </span>
                    {balanceAfter !== null && (
                        <span className="font-mono">
                            Bal: {formatCurrency(balanceAfter)}
                        </span>
                    )}
                </div>

                <div className="mt-2 flex justify-end">
                    <Link
                        href={`/dashboard/user/wallet/${tx.id || tx.reference}`}
                        className="text-[11.5px] font-semibold text-primary hover:underline"
                    >
                        View receipt →
                    </Link>
                </div>
            </article>
        );
    };

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Wallet · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                My Wallet
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                Manage your balance, track transactions, and
                                view payout history.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/dashboard/user/wallet/withdraw"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <ArrowUpRight
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                Withdraw
                            </Link>
                            <Link
                                href="/dashboard/user/wallet/fund"
                                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Fund wallet
                            </Link>
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                            >
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 truncate text-[20px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[24px]">
                                    {stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ---------- Balance card + wallet info ---------- */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {/* Big balance card */}
                <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-5 text-white shadow-lg lg:col-span-2">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                                <Wallet className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-100">
                                Available balance
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                                <span className="h-1 w-1 rounded-full bg-current" />
                                {currency}
                            </span>
                        </div>
                    </div>

                    <p className="relative mt-4 text-[40px] font-bold leading-none tracking-[-1.5px] text-white tabular-nums sm:text-[48px]">
                        {formatCurrency(balance)}
                    </p>

                    <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-white/15 pt-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
                            <TrendingUp className="h-3 w-3 text-emerald-300" />
                            {net >= 0 ? "+" : "−"}
                            {formatCurrency(Math.abs(net))} net
                        </span>
                        {pending > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-medium text-amber-100">
                                <Clock className="h-3 w-3" />
                                {formatCurrency(pending)} pending
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
                            {transactions.length} transaction
                            {transactions.length === 1 ? "" : "s"}
                        </span>
                    </div>
                </div>

                {/* Wallet info card */}
                <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                            <Building2
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            Wallet details
                        </div>

                        <div className="mt-3 flex flex-col gap-2.5 text-[12.5px]">
                            {/* Wallet ID */}
                            <div className="flex items-start justify-between gap-2">
                                <span className="shrink-0 text-gray-500">
                                    Wallet ID
                                </span>
                                <span className="truncate text-right font-mono text-[10.5px] font-semibold text-ink">
                                    {walletId}
                                </span>
                            </div>

                            {/* Currency */}
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">Currency</span>
                                <span className="font-semibold text-ink">
                                    {currency}
                                </span>
                            </div>

                            {/* Virtual account */}
                            <div className="border-t border-gray-100 pt-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                        <ShieldCheck className="h-3 w-3" />
                                        Virtual account
                                    </span>
                                    {hasVirtualAccount && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-700">
                                            Active
                                        </span>
                                    )}
                                </div>

                                {hasVirtualAccount ? (
                                    <div className="mt-2 flex flex-col gap-1">
                                        <p className="font-mono text-[14px] font-bold tabular-nums text-ink">
                                            {vaNumber || "—"}
                                        </p>
                                        <p className="truncate text-[11.5px] text-gray-600">
                                            {vaName || "—"}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {vaBank || "—"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-2.5 text-center">
                                        <p className="text-[11px] text-gray-500">
                                            No virtual account assigned yet.
                                        </p>
                                        <p className="mt-0.5 text-[10.5px] text-gray-400">
                                            Fund your wallet to get one
                                            automatically.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Last updated */}
                            {updatedAt && (
                                <div className="flex justify-between gap-2 border-t border-gray-100 pt-2.5">
                                    <span className="text-gray-500">
                                        Updated
                                    </span>
                                    <span className="text-right text-[11px] text-gray-600">
                                        {formatDateTime(updatedAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions: Sync + Manage */}
                    <div className="mt-4 flex items-center gap-2">
                        <SyncWalletButton onSync={syncWallet} />
                        <Link
                            href="/dashboard/user/wallet/settings"
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <CreditCard
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            Manage
                        </Link>
                    </div>
                </div>
            </div>

            {/* ---------- Transaction history ---------- */}
            <DashboardGridItem title="Transaction history">
                {transactions.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No transactions yet"
                        message="Your wallet activity will appear here once you make your first deposit or withdrawal."
                        cta="Fund wallet"
                        link="/dashboard/user/wallet/fund"
                    />
                ) : (
                    <DataTable
                        headers={headers}
                        data={transactions}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={true}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No transactions found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
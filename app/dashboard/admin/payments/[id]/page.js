import Link from "next/link";
import {
    ChevronLeft,
    CreditCard,
    User,
    CalendarDays,
    CheckCircle2,
    Clock,
    XCircle,
    Hash,
    Link2,
    Landmark,
    Wallet,
    Layers,
    RotateCcw,
} from "lucide-react";
import InvoiceNav from "@/app/_components/InvoiceNav";
import CopyButton from "@/app/_components/CopyButton";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import RefundPaymentModal from "@/app/_components/RefundPaymentModal"; // ← NEW
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getSubscriptionPaymentById } from "@/app/_lib/data-services";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatCurrency(amount, currency = "NGN") {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(n);
    } catch {
        return `${currency} ${n.toLocaleString()}`;
    }
}

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

function normalizeStatus(raw) {
    const s = String(raw || "").toUpperCase();
    if (["SUCCESSFUL", "SUCCESS", "PAID", "COMPLETED"].includes(s))
        return "SUCCESSFUL";
    if (["PENDING", "PROCESSING", "AWAITING"].includes(s)) return "PENDING";
    if (["CANCELLED", "CANCELED"].includes(s)) return "CANCELLED";
    if (["REFUNDED"].includes(s)) return "REFUNDED";
    if (["FAILED", "DECLINED", "EXPIRED"].includes(s)) return "FAILED";
    return s || "UNKNOWN";
}

const STATUS_STYLES = {
    SUCCESSFUL: {
        pill: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        icon: CheckCircle2,
    },
    PENDING: {
        pill: "bg-amber-50 text-amber-700 ring-amber-100",
        icon: Clock,
    },
    FAILED: {
        pill: "bg-red-50 text-red-700 ring-red-100",
        icon: XCircle,
    },
    CANCELLED: {
        pill: "bg-gray-100 text-gray-700 ring-gray-200",
        icon: XCircle,
    },
    REFUNDED: {
        pill: "bg-sky-50 text-sky-700 ring-sky-100",
        icon: RotateCcw,
    },
    UNKNOWN: {
        pill: "bg-gray-100 text-gray-700 ring-gray-200",
        icon: Clock,
    },
};

/* -------------------------------------------------------------------------- */
/* Table row helper                                                           */
/* -------------------------------------------------------------------------- */
function Row({ icon, label, value, mono = false, copyable = false }) {
    const isString = typeof value === "string";
    const hasValue =
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "—";

    return (
        <tr className="transition-colors hover:bg-primary-50/40">
            <td className="w-[180px] whitespace-nowrap px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-gray-400">{icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                        {label}
                    </span>
                </div>
            </td>
            <td
                className={`px-5 py-3 sm:px-6 ${
                    mono
                        ? "font-mono text-[11.5px] font-semibold text-ink"
                        : "text-[12.5px] font-medium text-ink"
                }`}
            >
                <span
                    className={`block ${
                        isString ? "max-w-[320px] truncate" : ""
                    }`}
                >
                    {hasValue ? value : "—"}
                </span>
            </td>
            <td className="w-12 px-2 py-3 text-right sm:px-3">
                {copyable && isString && hasValue ? (
                    <CopyButton value={value} label={label} />
                ) : null}
            </td>
        </tr>
    );
}

/* -------------------------------------------------------------------------- */
/* Section table wrapper                                                      */
/* -------------------------------------------------------------------------- */
function SectionTable({ title, icon, children }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <header className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3 sm:px-6">
                <span className="text-primary">{icon}</span>
                <h2 className="text-[13.5px] font-semibold text-ink">
                    {title}
                </h2>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[12.5px]">
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
                    <tbody className="divide-y divide-gray-100">{children}</tbody>
                </table>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function Page({ params }) {
    const pageParam = await params;

    const results = await Promise.allSettled([
        getSubscriptionPaymentById(pageParam.id),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const payment =
        results[0].status === "fulfilled" ? results[0].value : null;

    const status = normalizeStatus(payment?.status);
    const statusMeta = STATUS_STYLES[status] ?? STATUS_STYLES.UNKNOWN;
    const StatusIcon = statusMeta.icon;

    /* Refund available only for cancelled / failed / refunded payments */
    const canRefund = ["CANCELLED", "FAILED", "REFUNDED"].includes(status);

    const plan = payment?.subscription?.plan ?? null;
    const subscription = payment?.subscription ?? null;
    const payer = payment?.initiatedBy ?? null;

    const payerName =
        payer?.firstName || payer?.lastName
            ? `${payer?.firstName ?? ""} ${payer?.lastName ?? ""}`.trim()
            : payer?.email ?? "—";

    return (
        <div className="flex h-full min-h-screen w-full flex-col gap-6 border-x border-gray-100 bg-gray-50 px-2 pb-12 lg:pb-28">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {!payment ? (
                <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-12 font-mono text-gray-500">
                    <CreditCard
                        className="mb-3 h-8 w-8 text-gray-300"
                        aria-hidden="true"
                    />
                    <p className="text-xl font-bold mb-2">Payment not found</p>
                    <p className="text-sm">
                        Could not load payment data. It might be missing or
                        unavailable.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* ---------- Hero header ---------- */}
                    <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

                        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-5">
                                <div className="min-w-0">
                                    <Link
                                        href="/dashboard/admin/payments"
                                        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute transition-colors hover:text-white"
                                    >
                                        <ChevronLeft
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Back to payments
                                    </Link>
                                    <h1 className="mt-2 font-sans text-[24px] font-semibold leading-tight text-white sm:text-[28px]">
                                        {formatCurrency(
                                            payment.amount,
                                            payment.currency
                                        )}{" "}
                                        <span className="text-[14px] font-normal text-side-mute">
                                            · {plan?.name ?? "Subscription"}
                                        </span>
                                    </h1>
                                    <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-side-mute">
                                        Payment reference{" "}
                                        <span className="font-mono text-white/90">
                                            {payment.reference ?? "—"}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${statusMeta.pill}`}
                                    >
                                        <StatusIcon
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                        />
                                        {status}
                                    </span>

                                    {canRefund && (
                                        <RefundPaymentModal
                                            paymentId={payment.id}
                                            amount={payment.amount}
                                            currency={payment.currency}
                                            reference={payment.reference}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Hero stats */}
                            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                        Plan
                                    </dt>
                                    <dd className="mt-1 truncate text-[15px] font-semibold text-white">
                                        {plan?.name ?? "—"}
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                        Interval
                                    </dt>
                                    <dd className="mt-1 truncate text-[15px] font-semibold text-white">
                                        {subscription?.interval ?? "—"}
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                        Channel
                                    </dt>
                                    <dd className="mt-1 truncate text-[15px] font-semibold capitalize text-white">
                                        {payment.channel ?? "—"}
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                        Paid on
                                    </dt>
                                    <dd className="mt-1 truncate text-[15px] font-semibold text-white">
                                        {payment.paidAt
                                            ? new Date(
                                                  payment.paidAt
                                              ).toLocaleDateString("en-NG", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric",
                                              })
                                            : "Not paid"}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    {/* ---------- Payment details ---------- */}
                    <SectionTable
                        title="Payment details"
                        icon={
                            <CreditCard
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        }
                    >
                        <Row
                            icon={<Hash className="h-3.5 w-3.5" />}
                            label="Payment ID"
                            value={payment.id}
                            mono
                            copyable
                        />
                        <Row
                            icon={<Link2 className="h-3.5 w-3.5" />}
                            label="Reference"
                            value={payment.reference}
                            mono
                            copyable
                        />
                        <Row
                            icon={<Link2 className="h-3.5 w-3.5" />}
                            label="Transaction ref"
                            value={payment.transactionRef}
                            mono
                            copyable
                        />
                        <Row
                            icon={<Landmark className="h-3.5 w-3.5" />}
                            label="Channel"
                            value={
                                <span className="capitalize">
                                    {payment.channel ?? "—"}
                                </span>
                            }
                        />
                        <Row
                            icon={<Wallet className="h-3.5 w-3.5" />}
                            label="Amount"
                            value={formatCurrency(
                                payment.amount,
                                payment.currency
                            )}
                            mono
                        />
                        <Row
                            icon={<Hash className="h-3.5 w-3.5" />}
                            label="Currency"
                            value={payment.currency}
                        />
                    </SectionTable>

                    {/* ---------- Timeline & status ---------- */}
                    <SectionTable
                        title="Timeline & status"
                        icon={
                            <CalendarDays
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        }
                    >
                        <Row
                            icon={<Clock className="h-3.5 w-3.5" />}
                            label="Initiated"
                            value={formatDateTime(payment.createdAt)}
                        />
                        <Row
                            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            label="Paid"
                            value={
                                payment.paidAt
                                    ? formatDateTime(payment.paidAt)
                                    : "Not paid"
                            }
                        />
                        <Row
                            icon={<Clock className="h-3.5 w-3.5" />}
                            label="Last updated"
                            value={formatDateTime(payment.updatedAt)}
                        />
                        <Row
                            icon={<StatusIcon className="h-3.5 w-3.5" />}
                            label="Status"
                            value={
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ring-1 ${statusMeta.pill}`}
                                >
                                    <span className="h-1 w-1 rounded-full bg-current" />
                                    {status}
                                </span>
                            }
                        />
                        {payment.notes && (
                            <Row
                                icon={<Hash className="h-3.5 w-3.5" />}
                                label="Notes"
                                value={payment.notes}
                            />
                        )}
                    </SectionTable>

                    {/* ---------- Subscription ---------- */}
                    <SectionTable
                        title="Subscription"
                        icon={
                            <Layers
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        }
                    >
                        <Row
                            icon={<Hash className="h-3.5 w-3.5" />}
                            label="Subscription ID"
                            value={subscription?.id}
                            mono
                            copyable
                        />
                        <Row
                            icon={<CreditCard className="h-3.5 w-3.5" />}
                            label="Plan"
                            value={plan?.name}
                        />
                        <Row
                            icon={<Hash className="h-3.5 w-3.5" />}
                            label="Plan type"
                            value={plan?.planType}
                        />
                        <Row
                            icon={<Clock className="h-3.5 w-3.5" />}
                            label="Interval"
                            value={subscription?.interval}
                        />
                        <Row
                            icon={<CalendarDays className="h-3.5 w-3.5" />}
                            label="Renews on"
                            value={
                                subscription?.endDate
                                    ? formatDateTime(subscription.endDate)
                                    : "—"
                            }
                        />
                    </SectionTable>

                    {/* ---------- Initiated by ---------- */}
                    <SectionTable
                        title="Initiated by"
                        icon={<User className="h-4 w-4" aria-hidden="true" />}
                    >
                        {payer ? (
                            <>
                                <Row
                                    icon={<User className="h-3.5 w-3.5" />}
                                    label="Name"
                                    value={payerName}
                                />
                                <Row
                                    icon={<Hash className="h-3.5 w-3.5" />}
                                    label="Email"
                                    value={payer.email}
                                />
                                <Row
                                    icon={<User className="h-3.5 w-3.5" />}
                                    label="User ID"
                                    value={payer.id}
                                    mono
                                    copyable
                                />
                            </>
                        ) : (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-5 py-6 text-center text-[12px] text-mute sm:px-6"
                                >
                                    Payer information unavailable.
                                </td>
                            </tr>
                        )}
                    </SectionTable>
                </div>
            )}
        </div>
    );
}
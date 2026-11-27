import Link from "next/link";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import StatusChips from "@/app/_components/StatusChips";
import RecordPaymentModal from "@/app/_components/RecordPaymentModal";
import {
    getAccountSubscriptions,
    getSubscriptionPayments,
} from "@/app/_lib/data-services";
import { toRecordArray } from "@/app/_lib/utils";
import { Banknote, Clock, CheckCircle2, XCircle, Webhook } from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

function formatCurrency(amount, currency = "NGN") {
    if (amount === undefined || amount === null || amount === "") return "—";
    const num = Number(amount);
    if (!Number.isFinite(num)) return "—";
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            minimumFractionDigits: 0,
        }).format(num);
    } catch {
        return `${currency || "NGN"} ${num.toLocaleString()}`;
    }
}

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
}

function titleCase(value) {
    if (!value) return "—";
    return String(value)
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeStatus(raw) {
    const val = String(raw || "").trim().toUpperCase();
    if (
        ["SUCCESS", "SUCCESSFUL", "PAID", "COMPLETED", "SETTLED", "ACTIVE"].includes(
            val
        )
    ) {
        return "SUCCESSFUL";
    }
    if (
        [
            "FAILED",
            "FAIL",
            "DECLINED",
            "CANCELLED",
            "CANCELED",
            "REVERSED",
            "ERROR",
            "EXPIRED",
        ].includes(val)
    ) {
        return "FAILED";
    }
    return "PENDING";
}

export default async function Page() {
    const results = await Promise.allSettled([
        getSubscriptionPayments(),
        getAccountSubscriptions(),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results.slice(0, 1));

    const payments = toRecordArray(
        results[0].status === "fulfilled" ? results[0].value : []
    );
    const subscriptionsRaw =
        results[1].status === "fulfilled" ? results[1].value : null;

    /* ---------- Subscription / Total Revenue (same logic as admin overview) ---------- */
    const subscription =
        subscriptionsRaw?.subscription ??
        subscriptionsRaw?.data?.subscription ??
        subscriptionsRaw?.data ??
        subscriptionsRaw ??
        null;

    const plan = subscription?.plan ?? null;
    const planCurrency = plan?.currency ?? "NGN";

    const planPrices = plan
        ? {
              monthly: Number(plan.monthlyPrice) || 0,
              quarterly: Number(plan.quarterlyPrice) || 0,
              yearly: Number(plan.yearlyPrice) || 0,
          }
        : { monthly: 0, quarterly: 0, yearly: 0 };

    const activeIntervalPrice = (() => {
        if (!plan) return 0;
        if (subscription?.interval === "MONTHLY") return planPrices.monthly;
        if (subscription?.interval === "QUARTERLY") return planPrices.quarterly;
        if (subscription?.interval === "YEARLY") return planPrices.yearly;
        return planPrices.monthly;
    })();

    const paymentCount = subscription?._count?.payments ?? payments.length;

    // Build table rows from subscription payments, falling back to the active subscription plan record
    const rawRows =
        payments.length > 0
            ? payments
            : plan
              ? [
                    {
                        id: subscription?.id || plan.id,
                        plan,
                        name: plan.name,
                        slug: plan.slug,
                        planType: plan.planType,
                        durationDays: plan.durationDays,
                        monthlyPrice: plan.monthlyPrice,
                        quarterlyPrice: plan.quarterlyPrice,
                        yearlyPrice: plan.yearlyPrice,
                        currency: plan.currency || "NGN",
                        interval: subscription?.interval || plan.interval || "MONTHLY",
                        maxOrganizations: plan.maxOrganizations,
                        maxProperties: plan.maxProperties,
                        maxBuildings: plan.maxBuildings,
                        maxUnits: plan.maxUnits,
                        amount: activeIntervalPrice,
                        status: subscription?.status || "ACTIVE",
                        paidAt: subscription?.startDate || subscription?.createdAt || null,
                        createdAt: subscription?.createdAt || null,
                        endDate: subscription?.endDate || null,
                    },
                ]
              : [];

    const normalized = rawRows.map((p, idx) => {
        const rowPlan = p?.plan || p?.subscription?.plan || p || {};
        const currency = p?.currency || rowPlan?.currency || planCurrency;
        const interval = p?.interval || p?.subscription?.interval || rowPlan?.interval || "MONTHLY";
        const amount =
            Number(
                p?.amount ??
                    (interval === "YEARLY"
                        ? rowPlan?.yearlyPrice
                        : interval === "QUARTERLY"
                          ? rowPlan?.quarterlyPrice
                          : rowPlan?.monthlyPrice)
            ) || 0;

        return {
            ...p,
            _rowKey: p?.id || p?._id || rowPlan?.id || `payment-${idx}`,
            _status: normalizeStatus(p?.status),
            _rawStatus: p?.status || "ACTIVE",
            _amount: amount,
            _currency: currency,
            _planName: rowPlan?.name || p?.name || "Subscription Plan",
            _planSlug: rowPlan?.slug || p?.slug || "",
            _planType: rowPlan?.planType || p?.planType || "STANDARD",
            _interval: interval,
            _durationDays: rowPlan?.durationDays ?? p?.durationDays ?? null,
            _monthlyPrice: rowPlan?.monthlyPrice ?? p?.monthlyPrice ?? null,
            _quarterlyPrice: rowPlan?.quarterlyPrice ?? p?.quarterlyPrice ?? null,
            _yearlyPrice: rowPlan?.yearlyPrice ?? p?.yearlyPrice ?? null,
            _maxOrganizations: rowPlan?.maxOrganizations ?? p?.maxOrganizations ?? null,
            _maxProperties: rowPlan?.maxProperties ?? p?.maxProperties ?? null,
            _maxBuildings: rowPlan?.maxBuildings ?? p?.maxBuildings ?? null,
            _maxUnits: rowPlan?.maxUnits ?? p?.maxUnits ?? null,
            _paidAt: p?.paidAt || p?.createdAt || null,
        };
    });

    const total = normalized.length;
    const successful = normalized.filter((p) => p._status === "SUCCESSFUL");
    const pending = normalized.filter((p) => p._status === "PENDING");
    const failed = normalized.filter((p) => p._status === "FAILED");
    const pendingValue = pending.reduce((s, p) => s + p._amount, 0);

    const heroStats = [
        {
            label: "Total Payments",
            value: total || paymentCount,
            hint: `${paymentCount} payment${paymentCount === 1 ? "" : "s"} recorded`,
        },
        {
            label: "Total Revenue",
            value: formatCurrency(activeIntervalPrice, planCurrency),
            hint: `${paymentCount} payment${paymentCount === 1 ? "" : "s"} recorded`,
        },
        {
            label: "Pending Value",
            value: formatCurrency(pendingValue, planCurrency),
            hint: `${pending.length} pending`,
        },
        {
            label: "Failed",
            value: failed.length,
            hint: "Declined or reversed",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const columns = [
        {
            heading: "Plan",
            render: (row) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{row._planName}</span>
                        {row._planSlug ? (
                            <span className="rounded-md bg-soft px-1.5 py-0.5 font-mono text-[10.5px] text-mute">
                                {row._planSlug}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-mute">
                        {titleCase(row._planType)}
                        {row._durationDays ? ` · ${row._durationDays} days` : ""}
                    </p>
                </div>
            ),
        },
        {
            heading: "Interval",
            render: (row) => (
                <span className="inline-flex items-center rounded-full border border-line bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                    {titleCase(row._interval)}
                </span>
            ),
        },
        {
            heading: "Monthly",
            render: (row) => (
                <span className="whitespace-nowrap font-mono text-xs font-semibold text-ink">
                    {formatCurrency(row._monthlyPrice, row._currency)}
                </span>
            ),
        },
        {
            heading: "Quarterly",
            render: (row) => (
                <span className="whitespace-nowrap font-mono text-xs font-semibold text-ink">
                    {formatCurrency(row._quarterlyPrice, row._currency)}
                </span>
            ),
        },
        {
            heading: "Yearly",
            render: (row) => (
                <span className="whitespace-nowrap font-mono text-xs font-semibold text-ink">
                    {formatCurrency(row._yearlyPrice, row._currency)}
                </span>
            ),
        },
        {
            heading: "Limits",
            render: (row) => (
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 whitespace-nowrap font-mono text-[11.5px] text-mute">
                    <span>{row._maxOrganizations ?? 0} orgs</span>
                    <span>{row._maxProperties ?? 0} props</span>
                    <span>{row._maxBuildings ?? 0} bldgs</span>
                    <span>{row._maxUnits ?? 0} units</span>
                </div>
            ),
        },
        {
            heading: "Date",
            render: (row) => (
                <span className="whitespace-nowrap font-mono text-xs text-mute">
                    {formatDate(row._paidAt)}
                </span>
            ),
        },
        {
            heading: "Status",
            center: true,
            render: (row) => (
                <div className="flex justify-center">
                    <StatusChips status={String(row._rawStatus || "active").toLowerCase()} />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 p-2">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Hero summary ---------- */}
            <HeroBand
                tagline={`Admin console · ${today}`}
                title="Subscription payments"
                description="Every plan payment, its channel, its status, and the user who initiated it — all in one place."
                stats={heroStats}
                actions={
                    <>
                        <Link
                            href="/dashboard/admin/payments/webhooks"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <Webhook className="h-3.5 w-3.5" aria-hidden="true" />
                            Nomba webhooks
                        </Link>
                        <RecordPaymentModal />
                    </>
                }
            />

            {/* ---------- Status chips ---------- */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {successful.length} successful
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-100">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {pending.length} pending
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[12px] font-semibold text-red-700 ring-1 ring-red-100">
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {failed.length} failed
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary ring-1 ring-primary-100">
                    <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatCurrency(activeIntervalPrice, planCurrency)} revenue
                </span>
            </div>

            {/* ---------- Payments table ---------- */}
            <DashboardGridItem title={`Payment history (${normalized.length})`}>
                {normalized.length === 0 ? (
                    <EmptyState
                        icon={<Banknote className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No payment history found"
                        message="Subscription payments and active plan billing records will appear here."
                    />
                ) : (
                    <DataTable
                        data={normalized}
                        columns={columns}
                        rowKey={(row) => row._rowKey}
                        showPagination={normalized.length > 10}
                        pageSize={10}
                        className="p-0! border-none shadow-none"
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

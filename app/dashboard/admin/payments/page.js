import Link from "next/link";
import PaymentsTableList from "@/app/_components/PaymentsTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import RecordPaymentModal from "@/app/_components/RecordPaymentModal"; // ← NEW
import { getSubscriptionPayments } from "@/app/_lib/data-services";
import DateFilter from "@/app/_components/DateFilter";
import ExportButton from "@/app/_components/ExportButton";
import { toRecordArray } from "@/app/_lib/utils";
import { Suspense } from "react";
import { Banknote, Clock, CheckCircle2, XCircle, Webhook } from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

/* Helpers (unchanged) */
function formatCurrency(amount, currency = "NGN") { /* … */ }
function normalizeStatus(raw) { /* … */ }

export default async function Page() {
    const results = await Promise.allSettled([getSubscriptionPayments()]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const payments = toRecordArray(
        results[0].status === "fulfilled" ? results[0].value : []
    );

    const normalized = payments.map((p) => ({
        ...p,
        _status: normalizeStatus(p?.status),
        _amount: Number(p?.amount) || 0,
        _currency: p?.currency || "NGN",
        _paidAt: p?.paidAt || null,
        _createdAt: p?.createdAt || null,
    }));

    const total = normalized.length;
    const successful = normalized.filter((p) => p._status === "SUCCESSFUL");
    const pending = normalized.filter((p) => p._status === "PENDING");
    const failed = normalized.filter((p) => p._status === "FAILED");
    const totalRevenue = successful.reduce((s, p) => s + p._amount, 0);
    const pendingValue = pending.reduce((s, p) => s + p._amount, 0);

    const heroStats = [ /* unchanged */ ];

    const today = new Date().toLocaleDateString("en-NG", { /* … */ });

    return (
        <div className="space-y-8 p-2">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Hero summary ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Admin console · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                Subscription payments
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                Every plan payment, its channel, its status, and
                                the user who initiated it — all in one place.
                            </p>
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
                                <dd className="mt-1 truncate text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                                    {typeof stat.value === "number"
                                        ? stat.value.toLocaleString()
                                        : stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                            <Link
                                href="/dashboard/admin/payments/webhooks"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Webhook className="h-3.5 w-3.5" />
                                Nomba webhooks
                            </Link>

                            {/* Record payment (NEW) */}
                            <RecordPaymentModal />
                        </div>
                </div>
            </section>

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
                    {formatCurrency(totalRevenue)} collected
                </span>
            </div>

            {/* ---------- Payments table ---------- */}
            <DashboardGridItem title="Payment history">
                <PaymentsTableList payments={normalized} invoices={normalized} />
            </DashboardGridItem>
        </div>
    );
}
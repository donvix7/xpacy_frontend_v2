import { FaMoneyBillWave } from "react-icons/fa";
import { AlertCircle, Timer, TrendingUp, Wallet } from "lucide-react";
import { toRecordArray, formatCurrency } from "@/app/_lib/utils";

export default function PaymentsSummary({ invoices = [], showHeading = true }) {
    const invoiceList = toRecordArray(invoices);
    const isPaid = (b) =>
        ["paid", "completed", "active", "confirmed", "success", "successful"].includes(
            (b.payment_status || b.status || "").toLowerCase(),
        );
    const isPending = (b) =>
        ["pending", "processing"].includes(
            (b.payment_status || b.status || "").toLowerCase(),
        );
    const isUnpaid = (b) => !isPaid(b) && !isPending(b);

    const counts = {
        totalRevenue: invoiceList
            .filter(isPaid)
            .reduce((acc, curr) => acc + Number(curr.total || 0), 0),
        paidCount: invoiceList.filter(isPaid).length,
        pendingCount: invoiceList.filter(isPending).length,
        unpaidCount: invoiceList.filter(isUnpaid).length,
        totalInvoices: invoiceList.length,
    };

    const paidShare =
        counts.totalInvoices > 0
            ? Math.round((counts.paidCount / counts.totalInvoices) * 100)
            : 0;

    const tiles = [
        {
            label: "Paid",
            value: counts.paidCount,
            icon: <FaMoneyBillWave className="text-white" size={16} />,
            iconBg: "bg-emerald-600",
            accent: "from-emerald-600 to-emerald-400",
        },
        {
            label: "Pending",
            value: counts.pendingCount,
            icon: <Timer className="text-white" size={16} />,
            iconBg: "bg-amber-500",
            accent: "from-amber-500 to-amber-300",
        },
        {
            label: "Unpaid",
            value: counts.unpaidCount,
            icon: <AlertCircle className="text-white" size={16} />,
            iconBg: "bg-red-600",
            accent: "from-red-600 to-red-400",
        },
    ];

    return (
        // `@container` — makes the layout respond to this component's own width,
        // not the viewport. So when embedded in a narrow sidebar, it goes 1-col.
        <div className="@container flex flex-col gap-4">
            {showHeading && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">
                            <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                            Payments
                        </div>
                        <span className="text-[11.5px] font-medium text-gray-500">
                            <span className="font-bold tabular-nums text-ink">
                                {counts.totalInvoices.toLocaleString()}
                            </span>{" "}
                            invoices
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-baseline gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px]">
                            <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                                Revenue
                            </span>
                            <span className="font-bold tabular-nums text-emerald-900">
                                {formatCurrency(counts.totalRevenue)}
                            </span>
                        </span>
                        {paidShare > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                                {paidShare}% paid
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/*
                1 col when container < 28rem (~448px), 3 cols when >= 28rem.
                Because this responds to the container (not viewport), the same
                component works both full-width on a page and narrow in a panel.
            */}
            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @lg:grid-cols-3">
                {tiles.map((tile) => (
                    <div
                        key={tile.label}
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-4"
                    >
                        <div
                            className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${tile.accent}`}
                        />
                        <div className="relative pl-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 sm:text-[10.5px] sm:tracking-[0.14em]">
                                    {tile.label}
                                </span>
                                <span
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${tile.iconBg} shadow-sm sm:h-7 sm:w-7`}
                                >
                                    {tile.icon}
                                </span>
                            </div>
                            <p className="mt-2 text-[24px] font-bold leading-none tracking-[-0.6px] text-ink tabular-nums sm:text-[28px] sm:tracking-[-0.8px]">
                                {tile.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
import { IoCardOutline } from "react-icons/io5";
import { FaHandshake, FaTag, FaUsers, FaHouse } from "react-icons/fa6";
import { Receipt, TrendingUp } from "lucide-react";
import { formatCurrency } from "../_lib/utils";

export default async function InvoiceSummary({ invoices = [] }) {
    const invoiceList = Array.isArray(invoices) ? invoices.filter(Boolean) : [];

    const sum = (list, key) =>
        list.reduce((acc, curr) => acc + Number(curr?.[key] || 0), 0);

    const totalPaid = sum(invoiceList, "total_paid");
    const totalUnpaid = sum(invoiceList, "total_unpaid");
    const totalServices = sum(invoiceList, "totals_by_reasons.services");
    const totalShortlets = sum(invoiceList, "totals_by_reasons.shortlets");
    const totalRent = sum(invoiceList, "totals_by_reasons.rent");

    const paidShare =
        totalPaid + totalUnpaid > 0
            ? Math.round((totalPaid / (totalPaid + totalUnpaid)) * 100)
            : 0;

    const tiles = [
        {
            label: "Total Paid",
            value: formatCurrency(totalPaid),
            icon: <IoCardOutline className="text-white" size={16} />,
            iconBg: "bg-emerald-600",
            accent: "from-emerald-600 to-emerald-400",
        },
        {
            label: "Unpaid",
            value: formatCurrency(totalUnpaid),
            icon: <FaHandshake className="text-white" size={16} />,
            iconBg: "bg-red-600",
            accent: "from-red-600 to-red-400",
        },
        {
            label: "Services",
            value: formatCurrency(totalServices),
            icon: <FaUsers className="text-white" size={16} />,
            iconBg: "bg-sky-600",
            accent: "from-sky-600 to-sky-400",
        },
        {
            label: "Shortlets",
            value: formatCurrency(totalShortlets),
            icon: <FaHouse className="text-white" size={16} />,
            iconBg: "bg-violet-600",
            accent: "from-violet-600 to-violet-400",
        },
        {
            label: "Rent",
            value: formatCurrency(totalRent),
            icon: <FaTag className="text-white" size={16} />,
            iconBg: "bg-amber-500",
            accent: "from-amber-500 to-amber-300",
        },
    ];

    return (
        <div className="@container flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">
                        <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                        Invoices
                    </div>
                    <span className="text-[11.5px] font-medium text-gray-500">
                        <span className="font-bold tabular-nums text-ink">
                            {invoiceList.length.toLocaleString()}
                        </span>{" "}
                        total
                    </span>
                </div>
                {paidShare > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        {paidShare}% paid
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @3xl:grid-cols-5">
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
                            <p className="mt-2 truncate text-[20px] font-bold leading-none tracking-[-0.5px] text-ink tabular-nums sm:text-[22px] sm:tracking-[-0.6px]">
                                {tile.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
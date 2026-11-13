import { FaMoneyBillWave } from "react-icons/fa";
import { formatCurrency } from "@/app/_lib/utils";
import { AlertCircle, Timer } from "lucide-react";
import SummaryItemCard from "./SummaryItemCard";
import { toRecordArray } from "@/app/_lib/utils";

export default function PaymentsSummary({ invoices = [], showHeading = true }) {
    const invoiceList = toRecordArray(invoices);
    const isPaid = (b) => ['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes((b.payment_status || b.status || "").toLowerCase());
    const isPending = (b) => ['pending', 'processing'].includes((b.payment_status || b.status || "").toLowerCase());
    const isUnpaid = (b) => !isPaid(b) && !isPending(b);

    // Calculate counts and totals
    const counts = {
        totalRevenue: invoiceList
            .filter(isPaid)
            .reduce((acc, curr) => acc + Number(curr.total || 0), 0),
        paidCount: invoiceList.filter(isPaid).length,
        pendingCount: invoiceList.filter(isPending).length,
        unpaidCount: invoiceList.filter(isUnpaid).length,
    };


    const summaryItems = [
        {
            title: "Paid",
            count: counts.paidCount,
            icon: <FaMoneyBillWave />,
            color: "text-green-500",
            bgColor: "bg-green-50"
            
        },
        {
            title: "Pending",
            count: counts.pendingCount,
            icon: <Timer />,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50"
        },
        {
            title: "Unpaid",
            count: counts.unpaidCount,
            icon: <AlertCircle />,
            color: "text-red-500",
            bgColor: "bg-red-50"
        }
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-mute">Payments</span>
                <p className="text-[42px] font-semibold leading-none tracking-[-1.5px] text-ink tabular-nums sm:text-[52px]">
                    ₦ {counts.totalRevenue.toLocaleString()}
                </p>
                <span className="text-[13.5px] text-mute">Total revenue collected</span>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
                {summaryItems.map((item, index) => (
                    <SummaryItemCard key={index} label={item.title} value={item.count} icon={item.icon} iconBackground={item.bgColor} />
                ))}
            </div>
        </div>
    );
}

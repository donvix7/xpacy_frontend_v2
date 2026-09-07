import { format } from "date-fns";
import { formatCurrency } from "@/app/_lib/utils";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "./DataTable";
import PaymentsOptionsMenu from "./PaymentsOptionsMenu";

const tableHeadings = [
    { heading: "Invoice Number" },
    { heading: "Payer" },
    { heading: "Issued Date" },
    { heading: "Due Date" },
    { heading: "Status" },
    { heading: "Amount", right: true },
    { heading: "" }
];

const safeFormatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Invalid Date";
        return format(d, "MMM dd, yyyy");
    } catch {
        return "Invalid Date";
    }
};

export default function PaymentsTableList({ invoices }) {
    if (!invoices?.length) return <EmptyState message={"No payment history found."} />

    const renderRow = (invoice) => {
        const status = (invoice.payment_status || invoice.status || "N/A");
        const statusLower = status.toLowerCase();
        
        let statusColor = "bg-gray-100 text-gray-500";
        if (['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes(statusLower)) statusColor = "bg-green-100 text-green-700";
        else if (['pending', 'processing'].includes(statusLower)) statusColor = "bg-yellow-100 text-yellow-700";
        else if (['failed', 'cancelled', 'expired'].includes(statusLower)) statusColor = "bg-red-100 text-red-700";

        return (
            <tr key={invoice.id || invoice._id} className="text-gray-700 text-sm font-mono border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                <td className="p-4 font-semibold text-gray-900">
                    {invoice.invoiceNumber || "N/A"}
                </td>
                <td className="p-4">
                    {invoice.user?.firstname ? `${invoice.user.firstname} ${invoice.user.lastname || ''}` : "N/A"}
                </td>
                <td className="p-4 text-gray-500">
                    {safeFormatDate(invoice.issuedDate || invoice.createdAt || invoice.payment_date)}
                </td>
                <td className="p-4 text-gray-500">
                    {safeFormatDate(invoice.dueDate)}
                </td>
                <td className="p-4">    
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${statusColor}`}>
                        {status}
                    </span>
                </td>
                <td className="p-4 text-right font-bold text-primary">
                    {invoice.total || invoice.amount || invoice.property?.property_price ? formatCurrency(invoice.total || invoice.amount || invoice.property?.property_price) : "N/A"}
                </td>
                <td className="p-4 text-center">
                    <PaymentsOptionsMenu id={invoice.id || invoice._id} />
                </td>
            </tr>
        );
    };

    const renderMobileCard = (invoice) => {
        const status = (invoice.payment_status || invoice.status || "N/A");
        const statusLower = status.toLowerCase();
        
        let statusColor = "bg-gray-100 text-gray-500";
        if (['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes(statusLower)) statusColor = "bg-green-100 text-green-700";
        else if (['pending', 'processing'].includes(statusLower)) statusColor = "bg-yellow-100 text-yellow-700";
        else if (['failed', 'cancelled', 'expired'].includes(statusLower)) statusColor = "bg-red-100 text-red-700";

        return (
            <div key={invoice.id || invoice._id} className="flex flex-col gap-4 p-4 border-b border-gray-100 bg-white last:border-0 font-mono">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-sm text-gray-900">{invoice.property?.property_name || invoice.invoiceNumber || "N/A"}</h3>
                        <p className="text-xs text-gray-500">{invoice.user?.firstname ? `${invoice.user.firstname} ${invoice.user.lastname || ''}` : "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                            {status}
                        </span>
                        <PaymentsOptionsMenu id={invoice.id || invoice._id} />
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 font-bold uppercase text-[9px]">Date</span>
                    <span className="text-gray-700 font-medium">
                        {safeFormatDate(invoice.createdAt || invoice.issuedDate || invoice.payment_date)}
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Amount </span>
                    <span className="font-bold text-primary">
                        {invoice.amount || invoice.total || invoice.property?.property_price ? formatCurrency(invoice.amount || invoice.total || invoice.property?.property_price) : "N/A"}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <DataTable
            headers={tableHeadings}
            data={invoices}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={false}
        />
    );
}

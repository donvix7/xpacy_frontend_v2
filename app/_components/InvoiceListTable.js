import Link from "next/link";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { GiReceiveMoney } from "react-icons/gi";
import { IoCalendarOutline } from "react-icons/io5";

import EmptyState from "./EmptyState";
import UserFilterMenu from "./UserFilterMenu";
import { getInvoiceList } from "@/app/_lib/data-services";
import { formatCurrency } from "../_lib/utils";
import DataTable from "./DataTable";

const tableHeadings = [
    { heading: "Invoice No" },
    { heading: "Type" },
    { heading: "Description" },
    { heading: "Issued Date" },
    { heading: "Due Date" },
    { heading: "Payment Amount" },
    { heading: "Status", center: true },
    { heading: "" }
];

const statusBg = {
    "paid": " bg-[#C3E5C4] text-[#357B38] ",
    "unpaid": " bg-[#F44336] text-[#F5F0E7] ",
    "incomplete": " bg-[#FFF8BE] text-[#9D7B40] ",
};

export default async function InvoiceListTable({invoices}) {
    const invoiceList = invoices.data
    if (invoiceList?.length === 0) return <div className="grid place-content-center p-6 border border-primary-200 bg-white rounded-lg"><EmptyState message={"Opps... No invoices available"} /></div>

    const renderRow = (invoice) => (
        <tr key={invoice.id} className="border-b border-gray-100 text-sm font-mono hover:bg-gray-50 transition-colors last:border-0">
            <td className="p-4">{invoice.invoiceNumber}</td>
            <td className="p-4">
                <div className="flex items-center space-x-1.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 ">
                        {invoice.invoice_reason === "rent" && <span className="text-base w-6 h-6 text-primary bg-secondary-100 rounded-full flex items-center justify-center"><GiReceiveMoney /></span>}
                        {invoice.invoice_reason === "shortlet" && <span className="text-base w-6 h-6 text-primary bg-[#C3E5C4] rounded-full flex items-center justify-center "><GiReceiveMoney /></span>}
                        {invoice.invoice_reason === "service" && <span className="text-base w-6 h-6 text-primary bg-primary-100 rounded-full flex items-center justify-center "><IoCalendarOutline /></span>}
                    </div>
                    <span className="capitalize">{invoice.invoice_reason}</span>
                </div>
            </td>
            <td className="p-4 truncate max-w-[150px]" title={invoice.description}>{invoice.description}</td>
            <td className="p-4">{format(new Date(invoice.issuedDate), "dd/MM/yy")}</td>
            <td className="p-4">{format(new Date(invoice.dueDate), "dd/MM/yy")}</td>
            <td className="p-4 font-bold">{formatCurrency(invoice.total)}</td>
            <td className="p-4">
                <div className="flex justify-center">
                    <span className={`${statusBg[invoice.status?.toLowerCase()] || ""} w-max px-2.5 py-1 rounded-full text-[10px] font-bold uppercase`}>
                        {invoice.status}
                    </span>
                </div>
            </td>
            <td className="p-4 text-primary font-bold">
                <Link href={`/invoice/${invoice.id}`} className="hover:underline">View</Link>
            </td>
        </tr>
    );

    const renderMobileCard = (invoice) => (
        <div key={invoice.id} className="border-b border-gray-100 p-4 font-mono last:border-0">
            <div className="flex justify-between items-start mb-3">
                <p className="font-bold text-gray-900">{invoice.invoiceNumber}</p>
                <span className={`${statusBg[invoice.status?.toLowerCase()] || ""} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
                    {invoice.status}
                </span>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-200">
                    {invoice.invoice_reason === "rent" && <GiReceiveMoney className="text-sm text-secondary-600" />}
                    {invoice.invoice_reason === "shortlet" && <GiReceiveMoney className="text-sm text-green-600" />}
                    {invoice.invoice_reason === "service" && <IoCalendarOutline className="text-sm text-primary-600" />}
                </div>
                <span className="capitalize text-xs font-semibold text-gray-700">{invoice.invoice_reason}</span>
            </div>

            <p className="text-xs text-gray-500 mb-4 line-clamp-1">{invoice.description}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-lg text-xs">
                <div className="flex flex-col">
                    <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Amount</span>
                    <span className="font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Due Date</span>
                    <span className="text-gray-700">{format(new Date(invoice.dueDate), "dd/MM/yy")}</span>
                </div>
            </div>

            <div className="flex justify-end">
                <Link href={`/invoice/${invoice.id}`} className="text-primary font-bold text-xs underline">View Full Invoice</Link>
            </div>
        </div>
    );

    return (
        <DataTable
            title="Invoice list"
            headers={tableHeadings}
            data={invoiceList}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={false}
            headerActions={<UserFilterMenu />}
        />
    );
}


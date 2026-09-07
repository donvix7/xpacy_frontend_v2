"use client"
import Image from "next/image";
import { formatCurrency } from "../_lib/utils";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { format } from "date-fns";


export default function MobileInvoice({ invoice, users = [], ref }) {
    const rawRecipient = invoice?.recipientID || invoice?.recipientId || invoice?.reciepientID || invoice?.recipient;
    const recipientIdStr = typeof rawRecipient === 'object' && rawRecipient !== null ? String(rawRecipient._id || rawRecipient.id) : String(rawRecipient);
    
    let recipient = users?.find(u => String(u._id || u.id) === recipientIdStr) || invoice?.user;
    if (!recipient && typeof rawRecipient === 'object' && rawRecipient !== null) {
        recipient = rawRecipient;
    }

    return (
        <div ref={ref} className="flex flex-col gap-8 p-4 rounded-lg border-2 border-primary-200 bg-white lg:hidden w-full">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-4">
                <div className="w-[120px] h-[82px] sm:w-[150px] sm:h-[102px] relative shrink-0">
                    <Image src="/invoice-logo.png" alt="logo" fill className="object-cover" />
                </div>

                <div className="flex flex-col gap-4 sm:gap-6 w-full sm:w-auto items-center sm:items-end">
                    <h1 className="text-[40px] sm:text-[48px] text-primary font-bold leading-none">INVOICE</h1>
                    <div className="flex flex-col items-center sm:items-end gap-2 sm:gap-6 font-mono w-full text-base lg:text-md text-black">
                        <p>
                            Invoice Number: {invoice?.invoiceNumber || invoice?.invoice_number || ""}
                        </p>
                        <p>
                            Issued Date: {(() => {
                                const val = invoice?.issuedDate || new Date();
                                if (!val) return "N/A";
                                try { return format(new Date(val), "dd/MM/yy") } catch (e) { return "Invalid Date" }
                            })()}
                        </p>
                        <p>
                            Due Date: {(() => {
                                const val = invoice?.dueDate || new Date();
                                if (!val) return "N/A";
                                try { return format(new Date(val), "dd/MM/yy") } catch (e) { return "Invalid Date" }
                            })()}
                        </p>
                    </div>
                </div>
            </header>

            {/* Recipient */}
            <section className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
                <div className="flex flex-col gap-4 text-center sm:text-left w-full sm:w-auto">
                    <h2 className="text-primary text-xl font-bold">Recipient&apos;s Details</h2>
                    <div className="space-y-1 font-mono text-sm sm:text-base">
                        <p>{recipient?.firstname || recipient?.first_name || ""} {recipient?.lastname || recipient?.last_name || ""}</p>
                        <p>{recipient?.address || ""}</p>
                        <p>{recipient?.email || ""}</p>
                        <p>{recipient?.phone || recipient?.phone_number || ""}</p>
                    </div>
                </div>
                {(() => {
                    const status = invoice?.status || "Pending";
                    const statusLower = status.toLowerCase();
                    let statusColor = "bg-error";
                    if (['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes(statusLower)) statusColor = "bg-green-500";
                    else if (['pending', 'processing'].includes(statusLower)) statusColor = "bg-yellow-500 text-black";
                    
                    return (
                        <span className={`${statusColor} w-max text-secondary-100 px-4 py-2 rounded-full text-xl font-bold font-mono`}>
                            {status}
                        </span>
                    )
                })()}
            </section>

            {/* Items */}
            <section className="py-4 overflow-x-auto w-full">
                <table className="w-full font-mono border-collapse min-w-[500px] text-sm sm:text-base">
                    <thead>
                        <tr className="border-b border-primary-100 text-left">
                            <th className="p-3 font-bold w-[45%]">Description</th>
                            <th className="p-3 font-bold text-right w-[15%]">Price</th>
                            <th className="p-3 font-bold text-right w-[15%]">Qty</th>
                            <th className="p-3 font-bold text-right w-[25%]">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(invoice?.items || []).map((item) => (
                            <tr key={item?.id || Math.random()} className="border-b border-primary-100">
                                <td className="p-3 align-top text-left wrap-break-word">
                                    {item?.description}
                                </td>
                                <td className="p-3 align-top text-right">
                                    {formatCurrency(item?.unitPrice || 0)}
                                </td>
                                <td className="p-3 align-top text-right">
                                    {item?.quantity || 1}
                                </td>
                                <td className="p-3 align-middle text-right font-bold">
                                    {formatCurrency((item?.unitPrice || 0) * (item?.quantity || 1))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold">
                        <tr className="border-b border-primary-100">
                            <td colSpan={3} className="p-3 text-left">Sub-total</td>
                            <td className="p-3 text-right">{formatCurrency(invoice?.subTotal || 0)}</td>
                        </tr>
                        <tr className="border-b border-primary-100">
                            <td colSpan={3} className="p-3 text-left">Tax</td>
                            <td className="p-3 text-right">{Number(invoice?.tax || 0)}%</td>
                        </tr>
                        <tr className="border-b border-primary-100 bg-primary-200">
                            <td colSpan={3} className="p-3 text-left">TOTAL</td>
                            <td className="p-3 text-right">{formatCurrency(invoice?.total || 0)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {/* Footer */}
            <section className="flex flex-col-reverse sm:flex-row justify-between gap-8 items-center sm:items-start pt-4">
                <div className="flex flex-col gap-4 font-mono text-center sm:text-left items-center sm:items-start text-sm sm:text-base">
                    <p><b>Address:</b> No. 1 Joe Akonobi Street</p>
                    <p><b>Email:</b> info@xpacy.com</p>
                    <p><b>Phone:</b> 09068557780</p>
                    <div className="flex space-x-6 text-xl mt-2">
                        <Link href={"#"} className="text-black hover:text-primary transition-colors"><FaFacebook /></Link>
                        <Link href={"#"} className="text-black hover:text-primary transition-colors"><FaXTwitter /></Link>
                        <Link href={"#"} className="text-black hover:text-primary transition-colors"><FaInstagram /></Link>
                        <Link href={"#"} className="text-black hover:text-primary transition-colors"><FaTiktok /></Link>
                    </div>
                </div>
                <div className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] relative">
                    <Image src="/invoice-stamp.png" alt="stamp" fill className="object-cover" />
                </div>
            </section>
        </div>
    )
}
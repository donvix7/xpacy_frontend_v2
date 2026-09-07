import Link from "next/link";
import { IoCardOutline } from "react-icons/io5";
import PaymentItem from "./PaymentItem";
import { cookies } from "next/headers";
import { getInvoiceList } from "../_lib/data-services";
import EmptyState from "./EmptyState";

export default async function PaymentList(){
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const invoicesRes = await getInvoiceList(token);
    const invoices = invoicesRes?.data || invoicesRes || [];

    if(!invoices || invoices.length <= 0) return <EmptyState message={"Oops!... You do not have any invoice yet."}/>
    return (
        <ul className="flex flex-col gap-6">
        {invoices.slice(0, 2).map((invoice) => <PaymentItem status={invoice.status} purpose={invoice.invoice_reason} address={invoice.property_address} key={invoice?.id}/>)}
        </ul>
    )
}
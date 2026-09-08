import InvoiceListTable from "@/app/_components/InvoiceListTable";
import InvoiceSummary from "@/app/_components/InvoiceSummary";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import { getInvoiceList } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import { Suspense } from "react";



export default async function Page(){
   const cookieStore = await cookies();
   const token = cookieStore.get("token");
   const invoices = await getInvoiceList(token);

    return (
        <div className="p-2 flex flex-col lg:gap-12">
            <MobileDashboardHeader/>
            <InvoiceSummary invoices={invoices}/>
            <Suspense fallback={<div className="spinner"></div>}>
                <InvoiceListTable invoices={invoices}/>
            </Suspense>
        </div>
    )
}
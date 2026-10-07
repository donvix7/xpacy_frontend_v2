import PaymentsTableList from "@/app/_components/PaymentsTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import {getAllInvoices, getInvoices } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import DateFilter from "@/app/_components/DateFilter";
import ExportButton from "@/app/_components/ExportButton";
import { toRecordArray } from "@/app/_lib/utils";

export default async function Page() {
  
    const invoices = toRecordArray(await getAllInvoices());

    return (
        <div className="space-y-8 p-2">
            <div className="flex justify-between items-center  gap-2 mb-8">
                <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Payments</p>
                    <div className="flex gap-2">
    
                    <DateFilter />
                    <ExportButton 
                        data={invoices} 
                        filename="invoice_payment_summary" 
                        options={[
                            { id: "all", label: "All data" },
                            { id: "summary", label: "Summary" },
                            { id: "overview", label: "properties overview" }
                        ]}
                    />
                    </div>
    
                </div>            
                <PaymentsOverviewWrapper bookings={invoices} invoices={invoices} />

            <DashboardGridItem title={"Payment History"}>
                <PaymentsTableList invoices={invoices} /> 
            </DashboardGridItem>
        </div>
    );
}

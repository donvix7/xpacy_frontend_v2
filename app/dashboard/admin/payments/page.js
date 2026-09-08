import PaymentsTableList from "@/app/_components/PaymentsTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import {getInvoices } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import DateFilter from "@/app/_components/DateFilter";
import ExportButton from "@/app/_components/ExportButton";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    // Placeholder data until endpoint is ready
    const invoices = await getInvoices(token) || [];

    return (
        <div className="space-y-8 p-2">
            <div className="flex justify-between items-center gap-2">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Payments</h1>
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

import InvoiceListTable from "@/app/_components/InvoiceListTable";
import InvoiceSummary from "@/app/_components/InvoiceSummary";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import { getInvoiceList } from "@/app/_lib/data-services";
import { Suspense } from "react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
  const results = await Promise.allSettled([getInvoiceList()]);
  const dataErrorMessages = getSettledErrorMessages(results);
  const invoices = results[0].status === "fulfilled" ? results[0].value || [] : [];
  return (
    <div className="p-2 flex flex-col lg:gap-12">
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
      <MobileDashboardHeader />
      <InvoiceSummary invoices={invoices} />
      <Suspense fallback={<div className="spinner" />}>
        <InvoiceListTable invoices={invoices} />
      </Suspense>
    </div>
  );
}

import PaymentsTableList from "@/app/_components/PaymentsTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import { getAllInvoices } from "@/app/_lib/data-services";
import DateFilter from "@/app/_components/DateFilter";
import ExportButton from "@/app/_components/ExportButton";
import { toRecordArray } from "@/app/_lib/utils";
import { Suspense } from "react";
import Link from "next/link";
import { Download, Plus, Receipt, Wrench } from "lucide-react";

export default async function Page() {
  const invoices = toRecordArray(await getAllInvoices());

  // --- Hero stats -----------------------------------------------------------
  const total = invoices.length;
  const paid = invoices.filter((i) => i.status === "paid").length;
  const pending = invoices.filter((i) => i.status === "pending").length;
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const heroStats = [
    {
      label: "Invoices",
      value: total,
      hint: "All time",
    },
    {
      label: "Paid",
      value: paid,
      hint: "Settled invoices",
    },
    {
      label: "Pending",
      value: pending,
      hint: "Awaiting payment",
    },
    {
      label: "Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      hint: overdue ? `${overdue} overdue` : "No overdue",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8 p-2">
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Admin console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Payments
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Here is the pulse of the portfolio: approvals, service tickets and revenue health in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* DateFilter styled to match the hero */}
              <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border [&_button]:border-white/30 [&_button]:bg-white/10 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-[13px] [&_button]:font-medium [&_button]:text-white [&_button]:backdrop-blur-sm [&_button]:transition-colors [&_button:hover]:bg-white/20">
                <Suspense fallback={<div className="h-10 w-32" />}>
                  <DateFilter />
                </Suspense>
              </div>

              {/* ExportButton styled to match the hero's primary button */}
              <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:bg-white/95 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-[13px] [&_button]:font-semibold [&_button]:text-side [&_button:hover]:bg-white">
                <ExportButton
                  data={invoices}
                  filename="invoice_payment_summary"
                  options={[
                    { id: "all", label: "All data" },
                    { id: "summary", label: "Summary" },
                    { id: "overview", label: "properties overview" },
                  ]}
                />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
              >
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </dd>
                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                  {stat.hint}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Existing content ---------- */}

      <DashboardGridItem title="Payment History">
        <PaymentsTableList invoices={invoices} />
      </DashboardGridItem>
    </div>
  );
}
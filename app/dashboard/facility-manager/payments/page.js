import InvoiceListTable from "@/app/_components/InvoiceListTable";
import InvoiceSummary from "@/app/_components/InvoiceSummary";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import { getInvoiceList } from "@/app/_lib/data-services";
import { Suspense } from "react";

function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.invoices)) return payload.invoices;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.invoices)) return payload.data.invoices;
  return [];
}

const getStatus = (inv) => String(inv?.status || "").toLowerCase();
const parseAmount = (inv) => {
  const n = parseFloat(inv?.amount ?? inv?.total ?? inv?.total_amount ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export default async function Page() {
  const invoices = await getInvoiceList();
  const list = toList(invoices);

  // ---- Hero stats ----------------------------------------------------------
  const paid = list.filter((inv) => getStatus(inv) === "paid");
  const pending = list.filter((inv) => getStatus(inv) === "pending");
  const overdue = list.filter((inv) =>
    ["overdue", "past_due", "past due"].includes(getStatus(inv)),
  );

  const collected = paid.reduce((sum, inv) => sum + parseAmount(inv), 0);
  const outstanding = pending.reduce((sum, inv) => sum + parseAmount(inv), 0);

  const heroStats = [
    { label: "Invoices", value: list.length, hint: "All invoices" },
    {
      label: "Collected",
      value: `₦${collected.toLocaleString()}`,
      hint: `${paid.length} paid`,
    },
    {
      label: "Outstanding",
      value: `₦${outstanding.toLocaleString()}`,
      hint: `${pending.length} pending`,
    },
    {
      label: "Overdue",
      value: overdue.length,
      hint: overdue.length ? "Needs follow-up" : "All clear",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 p-2 lg:gap-8">
      <MobileDashboardHeader />

      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Billing console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Invoices
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                All your invoices in one place — what's been paid, what's pending and what needs attention.
              </p>
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
      <InvoiceSummary invoices={invoices} />

      <Suspense fallback={<div className="spinner" />}>
        <InvoiceListTable invoices={invoices} />
      </Suspense>
    </div>
  );
}
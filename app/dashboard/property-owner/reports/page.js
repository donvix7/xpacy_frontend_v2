import { cookies } from "next/headers";
import {
  getPropertyOwnerProperties,
  getPropertyOwnerServices,
  getPropertyOwnerBookings,
  getPropertyOwnerInvoices,
} from "@/app/_lib/data-services";
import PropertiesPieChart from "@/app/_components/PropertiesPieChart";
import PropertyStatusChart from "@/app/_components/PropertyStatusChart";
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import ServiceStatusChart from "@/app/_components/ServiceStatusChart";
import BookingsStatusChart from "@/app/_components/BookingsStatusChart";
import BookingsTrendChart from "@/app/_components/BookingsTrendChart";
import InvoiceStatusChart from "@/app/_components/InvoiceStatusChart";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { formatCurrency } from "@/app/_lib/utils";
import {
  getReportAmount,
  getReportPaidAmount,
  getReportStatus,
  toReportArray,
} from "@/app/_lib/report-utils";

const chartBox =
  "bg-white p-3 sm:p-6 rounded-lg border border-primary-100 shadow-sm min-h-[320px] min-w-0";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getPropertyOwnerProperties(token, { limit: 10000 }),
    getPropertyOwnerServices(token),
    getPropertyOwnerBookings(token),
    getPropertyOwnerInvoices(token),
  ]);

  const propertiesData =
    results[0].status === "fulfilled" ? results[0].value : [];
  const services = results[1].status === "fulfilled" ? results[1].value : [];
  const bookings = results[2].status === "fulfilled" ? results[2].value : [];
  const invoices = results[3].status === "fulfilled" ? results[3].value : [];

  const properties = toReportArray(
    Array.isArray(propertiesData?.[0]) ? propertiesData[0] : propertiesData,
  );
  const myServices = toReportArray(services);
  const myBookings = toReportArray(bookings);
  const myInvoices = toReportArray(invoices);

  const occupiedCount = properties.filter((p) =>
    ["occupied", "rented", "leased"].includes(
      getReportStatus(p, [
        "availability_status",
        "occupancy_status",
        "status",
      ]),
    ),
  ).length;
  const occupancyRate =
    properties.length > 0
      ? Math.round((occupiedCount / properties.length) * 100)
      : 0;

  const paidInvoices = myInvoices.filter((inv) =>
    ["paid", "completed", "successful", "success"].includes(
      getReportStatus(inv, ["payment_status", "invoice_status", "status"]),
    ),
  );
  const outstandingInvoices = myInvoices.filter((inv) =>
    ["pending", "overdue", "partial", "partially-paid", "unpaid"].includes(
      getReportStatus(inv, ["payment_status", "invoice_status", "status"]),
    ),
  );
  const collected = paidInvoices.reduce(
    (sum, inv) => sum + getReportPaidAmount(inv),
    0,
  );
  const outstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + getReportAmount(inv),
    0,
  );

  const maintenanceServices = myServices.filter((s) =>
    [
      "maintenance",
      "repair",
      "plumbing",
      "electrical",
      "cleaning",
      "hvac",
      "painting",
      "general",
    ].includes((s.service_type || s.category || "").toLowerCase()),
  );
  const maintenanceCost = maintenanceServices.reduce(
    (sum, s) => sum + getReportAmount({ amount: s.cost ?? s.amount }),
    0,
  );

  const serviceChargeInvoices = myInvoices.filter((inv) =>
    (inv.reason || inv.type || "").toLowerCase().includes("service charge"),
  );
  const serviceChargeCollected = serviceChargeInvoices
    .filter((inv) =>
      ["paid", "completed", "successful", "success"].includes(
        getReportStatus(inv, ["payment_status", "invoice_status", "status"]),
      ),
    )
    .reduce((sum, inv) => sum + getReportPaidAmount(inv), 0);

  const totalRevenue = collected;
  const netIncome = collected - maintenanceCost;

  // ---- Hero stats (top 4 headline numbers) --------------------------------
  const heroStats = [
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      hint: `${occupiedCount} of ${properties.length} occupied`,
    },
    {
      label: "Revenue Collected",
      value: formatCurrency(collected),
      hint: `${paidInvoices.length} paid invoices`,
    },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding),
      hint: `${outstandingInvoices.length} awaiting`,
    },
    {
      label: "Net Income",
      value: formatCurrency(netIncome),
      hint: "Revenue − maintenance",
    },
  ];

  // ---- Secondary strip (remaining financials) -----------------------------
  const statusStats = [
    {
      label: "Maintenance Costs",
      value: formatCurrency(maintenanceCost),
      tone: "slate",
    },
    {
      label: "Service Charges",
      value: formatCurrency(serviceChargeCollected),
      tone: "pink",
    },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), tone: "emerald" },
    { label: "Total Expenses", value: formatCurrency(maintenanceCost), tone: "red" },
  ];

  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    pink: "bg-pink-50 text-pink-700 border-pink-100",
  };

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 p-2">
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Reports console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Reports & Analytics
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Occupancy, revenue, services and expenses — the full financial picture across your portfolio.
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

      {/* ---------- Secondary financials strip ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statusStats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-4 ${toneClasses[s.tone]}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-80">
              {s.label}
            </p>
            <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] tabular-nums sm:text-[26px]">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ---------- Existing charts ---------- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGridItem title="Properties Distribution">
          <div className={`${chartBox} flex items-center justify-center`}>
            <PropertiesPieChart properties={properties} />
          </div>
        </DashboardGridItem>

        <DashboardGridItem title="Property Status Distribution">
          <div className={chartBox}>
            <PropertyStatusChart properties={properties} />
          </div>
        </DashboardGridItem>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGridItem title="Service Requests by Category">
          <div className={chartBox}>
            <ServicesByTypeChart services={myServices} />
          </div>
        </DashboardGridItem>

        <DashboardGridItem title="Service Status Breakdown">
          <div className={chartBox}>
            <ServiceStatusChart services={myServices} />
          </div>
        </DashboardGridItem>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGridItem title="Service Request Growth (by Month)">
          <div className={chartBox}>
            <ServiceGrowthChart services={myServices} />
          </div>
        </DashboardGridItem>

        <DashboardGridItem title="Bookings Trend (by Month)">
          <div className={chartBox}>
            <BookingsTrendChart bookings={myBookings} />
          </div>
        </DashboardGridItem>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGridItem title="Bookings Status">
          <div className={chartBox}>
            <BookingsStatusChart bookings={myBookings} />
          </div>
        </DashboardGridItem>

        <DashboardGridItem title="Revenue by Status">
          <div className={chartBox}>
            <InvoiceStatusChart invoices={myInvoices} currency />
          </div>
        </DashboardGridItem>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGridItem title="Monthly Revenue Overview">
          <div className={chartBox}>
            <RevenueOverviewChart payments={myInvoices} />
          </div>
        </DashboardGridItem>

        <DashboardGridItem title="Financial Summary">
          <div className="h-full rounded-lg border border-primary-100 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-primary-100 p-4 text-center">
                <p className="mb-1 text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="rounded-lg border border-primary-100 p-4 text-center">
                <p className="mb-1 text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(maintenanceCost)}
                </p>
              </div>
              <div className="rounded-lg border border-primary-100 p-4 text-center">
                <p className="mb-1 text-sm text-gray-500">Net Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(netIncome)}
                </p>
              </div>
            </div>
          </div>
        </DashboardGridItem>
      </div>
    </div>
  );
}
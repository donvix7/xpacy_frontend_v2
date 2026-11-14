import { cookies } from "next/headers";
import {
  getManagedProperties,
  getBookedServices,
  getMyBookings,
  getInvoiceList,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertiesPieChart from "@/app/_components/PropertiesPieChart";
import PropertyStatusChart from "@/app/_components/PropertyStatusChart";
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import ServiceStatusChart from "@/app/_components/ServiceStatusChart";
import BookingsStatusChart from "@/app/_components/BookingsStatusChart";
import BookingsTrendChart from "@/app/_components/BookingsTrendChart";
import InvoiceStatusChart from "@/app/_components/InvoiceStatusChart";
import { formatCurrency } from "@/app/_lib/utils";
import {
  getReportAmount,
  getReportStatus,
  toReportArray,
} from "@/app/_lib/report-utils";

const chartBox =
  "bg-white p-3 sm:p-6 rounded-lg border border-primary-100 shadow-sm min-h-[320px] min-w-0";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getManagedProperties(10000),
    getBookedServices(token),
    getMyBookings(),
    getInvoiceList(),
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

  const totalWorkOrders = myServices.length;
  const serviceStatus = (s) => getReportStatus(s, ["service_status", "status"]);
  const inProgressOrders = myServices.filter(
    (s) => serviceStatus(s) === "in-progress",
  ).length;
  const awaitingParts = myServices.filter(
    (s) => serviceStatus(s) === "awaiting-parts",
  ).length;
  const completedOrders = myServices.filter(
    (s) => serviceStatus(s) === "completed",
  ).length;
  const closedOrders = myServices.filter(
    (s) => serviceStatus(s) === "closed",
  ).length;

  const completionRate =
    totalWorkOrders > 0
      ? Math.round(((completedOrders + closedOrders) / totalWorkOrders) * 100)
      : 0;

  const totalMaintenanceCost = myServices.reduce(
    (sum, s) => sum + getReportAmount({ amount: s.cost ?? s.amount }),
    0,
  );

  const vendorIds = new Set(
    myServices.map((s) => s.service_provider_id || s.provider_id).filter(Boolean),
  );
  const uniqueVendors = vendorIds.size;

  // ---- Hero stats (top 4) -------------------------------------------------
  const heroStats = [
    {
      label: "Total Work Orders",
      value: totalWorkOrders,
      hint: "All service requests",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      hint: `${completedOrders + closedOrders} resolved`,
    },
    {
      label: "In Progress",
      value: inProgressOrders,
      hint: "Currently active",
    },
    {
      label: "Awaiting Parts",
      value: awaitingParts,
      hint: "Blocked on supplies",
    },
  ];

  // ---- Secondary strip (remaining) ----------------------------------------
  const secondaryStats = [
    {
      label: "Maintenance Cost",
      value: formatCurrency(totalMaintenanceCost),
      tone: "slate",
    },
    {
      label: "Active Vendors",
      value: uniqueVendors,
      tone: "amber",
    },
  ];

  const toneClasses = {
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
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
                Work orders, properties, bookings and revenue across your managed portfolio.
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

      {/* ---------- Secondary strip ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {secondaryStats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-4 ${toneClasses[s.tone]}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-80">
              {s.label}
            </p>
            <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] tabular-nums sm:text-[26px]">
              {typeof s.value === "number"
                ? s.value.toLocaleString()
                : s.value}
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
        <DashboardGridItem title="Work Order Status Breakdown">
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
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardGridItem title="Monthly Revenue Overview">
          <div className={chartBox}>
            <RevenueOverviewChart payments={myInvoices} />
          </div>
        </DashboardGridItem>

        <DashboardGridItem title="Revenue by Status">
          <div className={chartBox}>
            <InvoiceStatusChart invoices={myInvoices} currency />
          </div>
        </DashboardGridItem>
      </div>
    </div>
  );
}
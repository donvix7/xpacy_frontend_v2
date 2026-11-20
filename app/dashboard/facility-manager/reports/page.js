import { cookies } from "next/headers";
import {
  getManagedProperties,
  getPropertyOwnerProperties,
  getBookedServices,
  getPropertyOwnerServices,
  getMyBookings,
  getPropertyOwnerBookings,
  getInvoiceList,
  getPropertyOwnerInvoices,
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
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const chartBox =
  "bg-card text-ink p-3 sm:p-6 rounded-lg border border-line shadow-sm min-h-[320px] min-w-0";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getManagedProperties(10000),
    getPropertyOwnerProperties(token, { limit: 10000 }),
    getBookedServices(token),
    getPropertyOwnerServices(token),
    getMyBookings(),
    getPropertyOwnerBookings(token),
    getInvoiceList(),
    getPropertyOwnerInvoices(token),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const rawProps1 = results[0].status === "fulfilled" ? results[0].value : [];
  const rawProps2 = results[1].status === "fulfilled" ? results[1].value : [];
  const propList1 = toReportArray(rawProps1);
  const propList2 = toReportArray(rawProps2);
  const propertyMap = new Map();
  [...propList1, ...propList2].forEach((p) => {
    const id = p?.id || p?._id || p?.property_id;
    if (id && !propertyMap.has(id)) propertyMap.set(id, p);
    else if (!id) propertyMap.set(Math.random(), p);
  });
  const properties = Array.from(propertyMap.values());

  const rawServices1 = results[2].status === "fulfilled" ? results[2].value : [];
  const rawServices2 = results[3].status === "fulfilled" ? results[3].value : [];
  const servList1 = toReportArray(rawServices1);
  const servList2 = toReportArray(rawServices2);
  const serviceMap = new Map();
  [...servList1, ...servList2].forEach((s) => {
    const id = s?.id || s?._id || s?.service_id;
    if (id && !serviceMap.has(id)) serviceMap.set(id, s);
    else if (!id) serviceMap.set(Math.random(), s);
  });
  const myServices = Array.from(serviceMap.values());

  const rawBookings1 = results[4].status === "fulfilled" ? results[4].value : [];
  const rawBookings2 = results[5].status === "fulfilled" ? results[5].value : [];
  const bookList1 = toReportArray(rawBookings1);
  const bookList2 = toReportArray(rawBookings2);
  const bookingMap = new Map();
  [...bookList1, ...bookList2].forEach((b) => {
    const id = b?.id || b?._id || b?.booking_id;
    if (id && !bookingMap.has(id)) bookingMap.set(id, b);
    else if (!id) bookingMap.set(Math.random(), b);
  });
  const myBookings = Array.from(bookingMap.values());

  const rawInvoices1 = results[6].status === "fulfilled" ? results[6].value : [];
  const rawInvoices2 = results[7].status === "fulfilled" ? results[7].value : [];
  const invList1 = toReportArray(rawInvoices1);
  const invList2 = toReportArray(rawInvoices2);
  const invoiceMap = new Map();
  [...invList1, ...invList2].forEach((inv) => {
    const id = inv?.id || inv?._id || inv?.invoice_id;
    if (id && !invoiceMap.has(id)) invoiceMap.set(id, inv);
    else if (!id) invoiceMap.set(Math.random(), inv);
  });
  const myInvoices = Array.from(invoiceMap.values());

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
    slate: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  };

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 p-2">
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
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
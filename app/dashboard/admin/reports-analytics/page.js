import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertiesPieChart from "@/app/_components/PropertiesPieChart";
import PropertyStatusChart from "@/app/_components/PropertyStatusChart";
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import UserDistributionChart from "@/app/_components/UserDistributionChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import ServiceStatusChart from "@/app/_components/ServiceStatusChart";
import BookingsStatusChart from "@/app/_components/BookingsStatusChart";
import BookingsTrendChart from "@/app/_components/BookingsTrendChart";
import InvoiceStatusChart from "@/app/_components/InvoiceStatusChart";
import {
  getAdminProperties,
  getAdminServices,
  getAllAdmin,
  getAllUsers,
  getPropertyOwner,
  getAllInvoices,
  getAdminBooking,
} from "@/app/_lib/data-services";
import { toReportArray } from "@/app/_lib/report-utils";
import { cookies } from "next/headers";

const chartBox =
  "bg-white p-3 sm:p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[320px] min-w-0";

const getStatus = (r) => String(r?.status || "").trim().toLowerCase();
const parseAmount = (r) => {
  const n = parseFloat(r?.amount ?? r?.total ?? r?.total_amount ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const [
    propertiesData,
    servicesData,
    propertyOwners,
    admins,
    users,
    invoices,
    bookingsData,
  ] = await Promise.all([
    getAdminProperties(token, { limit: 10000 }),
    getAdminServices(token),
    getPropertyOwner(token),
    getAllAdmin(token),
    getAllUsers(token, 10000),
    getAllInvoices(undefined, token),
    getAdminBooking(token),
  ]);

  const properties = toReportArray(propertiesData);
  const services = toReportArray(servicesData);
  const bookings = toReportArray(bookingsData);
  const payments = toReportArray(invoices);
  const userRecords = toReportArray(users);
  const ownerRecords = toReportArray(propertyOwners);
  const adminRecords = toReportArray(admins);

  const getRole = (user) =>
    String(user.role || user.user_type || "")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-");

  const userStats = {
    propertyOwners: ownerRecords.length,
    residents: userRecords.filter((u) =>
      ["resident", "tenant", "user"].includes(getRole(u)),
    ).length,
    serviceProviders: userRecords.filter((u) =>
      ["service-provider", "provider", "vendor"].includes(getRole(u)),
    ).length,
    admins: adminRecords.length,
    otherUsers: userRecords.filter(
      (u) =>
        ![
          "resident",
          "tenant",
          "user",
          "service-provider",
          "provider",
          "vendor",
          "owner",
          "property-owner",
          "admin",
          "administrator",
        ].includes(getRole(u)),
    ).length,
  };

  // ---- Hero stats ----------------------------------------------------------
  const totalUsers =
    userRecords.length + ownerRecords.length + adminRecords.length;

  const paidInvoices = payments.filter((p) =>
    ["paid", "completed", "successful", "success"].includes(getStatus(p)),
  );
  const collected = paidInvoices.reduce((sum, p) => sum + parseAmount(p), 0);

  const heroStats = [
    {
      label: "Properties",
      value: properties.length,
      hint: "Total on the platform",
    },
    {
      label: "Users",
      value: totalUsers,
      hint: "All roles combined",
    },
    {
      label: "Services",
      value: services.length,
      hint: "All service requests",
    },
    {
      label: "Revenue",
      value: `₦${collected.toLocaleString()}`,
      hint: `${paidInvoices.length} paid invoices`,
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
                Admin reports · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Reports & Analytics
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Platform-wide metrics across properties, users, services and revenue — everything at a glance.
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

      {/* ---------- Existing charts ---------- */}
      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem title="Properties Distribution">
            <div className={chartBox}>
              <PropertiesPieChart properties={properties} />
            </div>
          </DashboardGridItem>

          <DashboardGridItem title="User Type Distribution">
            <div className={chartBox}>
              <UserDistributionChart stats={userStats} />
            </div>
          </DashboardGridItem>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem title="Property Status Distribution">
            <div className={chartBox}>
              <PropertyStatusChart properties={properties} />
            </div>
          </DashboardGridItem>

          <DashboardGridItem title="Bookings Status">
            <div className={chartBox}>
              <BookingsStatusChart bookings={bookings} />
            </div>
          </DashboardGridItem>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem title="Bookings Trend (by Month)">
            <div className={chartBox}>
              <BookingsTrendChart bookings={bookings} />
            </div>
          </DashboardGridItem>

          <DashboardGridItem title="Revenue by Status">
            <div className={chartBox}>
              <InvoiceStatusChart invoices={payments} currency />
            </div>
          </DashboardGridItem>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem title="Service Requests by Category (All Time)">
            <div className="min-h-[400px] rounded-lg border border-primary-100 bg-white p-6 shadow-sm">
              <ServicesByTypeChart services={services} />
            </div>
          </DashboardGridItem>

          <DashboardGridItem title="Service Status Breakdown">
            <div className={chartBox}>
              <ServiceStatusChart services={services} />
            </div>
          </DashboardGridItem>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem title="Service Request Growth (by Month)">
            <div className="min-h-[350px] rounded-lg border border-primary-100 bg-white p-6 shadow-sm">
              <ServiceGrowthChart services={services} />
            </div>
          </DashboardGridItem>

          <DashboardGridItem title="Monthly Revenue Overview">
            <div className="min-h-[350px] rounded-lg border border-primary-100 bg-white p-6 shadow-sm">
              <RevenueOverviewChart payments={payments} />
            </div>
          </DashboardGridItem>
        </div>
      </div>
    </div>
  );
}
import { cookies } from "next/headers";
import {
  getPropertyOwnerBookings,
  getPropertyOwnerServices,
  getPropertyOwnerProfile,
  getUserNotifications,
  getPropertyOwnerProperties,
  getPropertyOwnerInvoices,
} from "@/app/_lib/data-services";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import ShareOrganizationListings from "@/app/_components/ShareOrganizationListings";
import { isValidOrganizationId } from "@/app/_lib/public-navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const organizationId = cookieStore.get("organizationId")?.value;
  const canShareOrganizationListings = isValidOrganizationId(organizationId);

  const results = await Promise.allSettled([
    getPropertyOwnerProfile(token),
    getPropertyOwnerProperties(token, { limit: 10000 }),
    getPropertyOwnerServices(token),
    getPropertyOwnerBookings(token),
    getUserNotifications(token),
    getPropertyOwnerInvoices(token),
  ]);

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
  const services = results[2].status === "fulfilled" ? results[2].value : [];
  const bookings = results[3].status === "fulfilled" ? results[3].value : [];
  const notifications = results[4].status === "fulfilled" ? results[4].value : [];
  const invoices = results[5].status === "fulfilled" ? results[5].value : [];

  const allProperties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];
  const properties = allProperties.filter((p) => p.property_owner_id === profile?.id);
  const myServices = Array.isArray(services) ? services : [];
  const myBookings = Array.isArray(bookings) ? bookings : [];
  const myInvoices = Array.isArray(invoices) ? invoices : [];

  const occupiedCount = properties.filter(
    (p) => (p.availability_status || "").toLowerCase() === "occupied",
  ).length;
  const occupancyRate =
    properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

  const paidInvoices = myInvoices.filter(
    (inv) => (inv.status || "").toLowerCase() === "paid",
  );
  const pendingInvoices = myInvoices.filter(
    (inv) => (inv.status || "").toLowerCase() === "pending",
  );
  const collected = paidInvoices.reduce(
    (sum, inv) => sum + (parseFloat(inv.amount) || 0),
    0,
  );
  const outstanding = pendingInvoices.reduce(
    (sum, inv) => sum + (parseFloat(inv.amount) || 0),
    0,
  );

  const today = new Date().toISOString().split("T")[0];
  const todayRevenue = myInvoices
    .filter((inv) => (inv.created_at || "").startsWith(today))
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  const firstName =
    profile?.first_name ||
    profile?.firstname ||
    profile?.name ||
    profile?.full_name ||
    "Owner";

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Properties",
      value: properties.length,
      hint: "Managed listings",
    },
    {
      label: "Occupancy",
      value: `${occupancyRate}%`,
      hint: `${occupiedCount} of ${properties.length} occupied`,
    },
    {
      label: "Today's Revenue",
      value: `$${todayRevenue.toLocaleString()}`,
      hint: "Collected today",
    },
    {
      label: "Monthly Revenue",
      value: `$${collected.toLocaleString()}`,
      hint: "Paid invoices",
    },
  ];

  const formattedDate = new Date().toLocaleDateString("en-NG", {
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
                Owner console · {formattedDate}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Here is the pulse of your portfolio: properties, services, bookings and revenue health in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/property-owner/properties"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                View properties
              </Link>
              <Link
                href="/dashboard/property-owner/properties/new"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add property
              </Link>
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
      {canShareOrganizationListings && (
        <ShareOrganizationListings organizationId={organizationId} />
      )}

      <div className="flex flex-col gap-8">
        <DashboardGridItem
          title="Recent Properties"
          viewAllLink="/dashboard/property-owner/properties"
        >
          <PropertiesOverviewWrapper properties={properties} showFilters={false} />
        </DashboardGridItem>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem
            title="Recent Services"
            viewAllLink="/dashboard/property-owner/services"
          >
            <ServicesOverviewWrapper services={myServices} showFilters={false} />
          </DashboardGridItem>

          <DashboardGridItem
            title="Recent Bookings"
            viewAllLink="/dashboard/property-owner/bookings"
          >
            <PaymentsOverviewWrapper bookings={myBookings} showFilters={false} />
          </DashboardGridItem>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DashboardGridItem
            title="Notifications"
            viewAllLink="/dashboard/property-owner/notifications"
          >
            <NotificationsSummary
              notifications={Array.isArray(notifications) ? notifications : []}
            />
          </DashboardGridItem>

          <DashboardGridItem
            title="Properties"
            viewAllLink="/dashboard/property-owner/properties"
          >
            <PropertiesTableList properties={properties} recent={true} />
          </DashboardGridItem>
        </div>
      </div>
    </div>
  );
}
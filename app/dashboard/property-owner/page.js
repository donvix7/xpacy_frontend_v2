import { cookies } from "next/headers";
import {
  getPropertyOwnerBookings,
  getPropertyOwnerServices,
  getPropertyOwnerProfile,
  getUserNotifications,
  getMyProperties,
  getManagedProperties,
  getMyRentedProperties,
  getPropertyOwnerInvoices,
  getOwnerDashboard,
} from "@/app/_lib/data-services";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import {
  DashboardSummaryOverview,
  UnitsOccupancySummary,
  normalizeDashboardStats,
} from "@/app/_components/DashboardPortfolioSummary";
import ShareOrganizationListings from "@/app/_components/ShareOrganizationListings";
import { isValidOrganizationId } from "@/app/_lib/public-navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const organizationId = cookieStore.get("organizationId")?.value;
  const canShareOrganizationListings = isValidOrganizationId(organizationId);

  const results = await Promise.allSettled([
    getPropertyOwnerProfile(token),
    getMyProperties(),
    getManagedProperties(),
    getMyRentedProperties(),
    getPropertyOwnerBookings(token),
    getUserNotifications(token),
    getOwnerDashboard(organizationId),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const unwrap = (result) => {
    if (result.status !== "fulfilled") return [];
    const val = result.value;
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) return val.data;
    if (Array.isArray(val?.properties)) return val.properties;
    return [];
  };

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const ownedProperties = unwrap(results[1]);
  const managedProperties = unwrap(results[2]);
  const rentedProperties = unwrap(results[3]);
  const bookings = results[4].status === "fulfilled" ? results[4].value : [];
  const notifications = results[5].status === "fulfilled" ? results[5].value : [];
  const dashboardStats = results[6].status === "fulfilled" ? results[6].value : null;

  const counts = {
    owned: ownedProperties.length,
    managed: managedProperties.length,
    rented: rentedProperties.length,
  };

  const totalPropertiesCount = counts.owned + counts.managed + counts.rented;

  // Combine and deduplicate properties across owned, managed, and rented
  const combined = [...ownedProperties, ...managedProperties, ...rentedProperties];
  const seen = new Set();
  const properties = combined.filter((p) => {
    const id = p?.id || p?._id;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const myBookings = Array.isArray(bookings) ? bookings : [];

  const occupiedCount = properties.filter((p) =>
    ["occupied", "rented", "shortlet"].includes(
      String(p.property_status || p.availability_status || "").toLowerCase(),
    ),
  ).length;
  const occupancyRate =
    properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

  const today = new Date().toISOString().split("T")[0];

  const firstName =
    profile?.first_name ||
    profile?.firstname ||
    profile?.name ||
    profile?.full_name ||
    "Owner";

  // ---- Hero stats (from getOwnerDashboard) --------------------------------
  const stats = normalizeDashboardStats(dashboardStats, {
    totalProperties: totalPropertiesCount,
    occupiedUnits: occupiedCount,
    occupancyRate,
  });

  const heroStats = [
    {
      label: "Properties",
      value: stats.totalProperties,
      hint: `${counts.owned} owned · ${counts.managed} managed`,
    },
    {
      label: "Total Units",
      value: stats.totalUnits,
      hint: `${stats.occupiedUnits} occupied · ${stats.vacantUnits} vacant`,
    },
    {
      label: "Occupied Units",
      value: stats.occupiedUnits,
      hint: "Currently leased",
    },
    {
      label: "Vacant Units",
      value: stats.vacantUnits,
      hint: "Ready for occupancy",
    },
    {
      label: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      hint: `${stats.occupiedUnits} of ${stats.totalUnits} units`,
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
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
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

            
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
              {canShareOrganizationListings && (
                <ShareOrganizationListings organizationId={organizationId} variant="hero" />
              )}
              <Link
                href="/dashboard/property-owner/properties"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                View properties
              </Link>
            </div>

         
        </div>
      </section>

      {/* ---------- Existing content ---------- */}


      <UnitsOccupancySummary
        stats={stats}
        propertiesHref="/dashboard/property-owner/properties"
      />

      <div className="flex flex-col gap-8">
       

       
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

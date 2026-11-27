import DashboardGridItem from "@/app/_components/DashboardGridItems";
import OrganizationDistributionChart from "@/app/_components/OrganizationDistributionChart";
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
  getAllAdminOrganization,
  getAdminOrganizationMembers,
  getAllUsers,
  getAllInvoices,
  getAdminBooking,
  getSubscriptionPayments,
} from "@/app/_lib/data-services";
import { toReportArray } from "@/app/_lib/report-utils";
import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const chartBox =
  "bg-card text-ink p-3 sm:p-6 rounded-lg border border-line shadow-sm flex items-center justify-center min-h-[320px] min-w-0";

const getStatus = (r) => String(r?.status || "").trim().toLowerCase();
const parseAmount = (r) => {
  const n = parseFloat(r?.amount ?? r?.total ?? r?.total_amount ?? 0);
  return Number.isFinite(n) ? n : 0;
};

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function unwrapOrgs(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.organizations)) return payload.organizations;
  if (Array.isArray(payload?.data?.organizations)) return payload.data.organizations;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function unwrapMembers(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.members)) return payload.members;
  if (Array.isArray(payload?.data?.members)) return payload.data.members;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getMemberKey(member) {
  const u = member?.user || member?.profile || member || {};
  return String(
    u?.id || u?._id || member?.userId || member?.user_id || member?.id || u?.email || member?.email || ""
  ).trim();
}

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getAdminProperties(),
    getAdminServices(token),
    getAllAdminOrganization(),
    getAllAdmin(token),
    getAllUsers(token, 10000),
    getAllInvoices(undefined, token),
    getAdminBooking(token),
    getSubscriptionPayments({ limit: 1000 }),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const propertiesData = results[0].status === "fulfilled" ? results[0].value : [];
  const servicesData = results[1].status === "fulfilled" ? results[1].value : [];
  const organizations =
    results[2].status === "fulfilled" ? unwrapOrgs(results[2].value) : [];
  const admins = results[3].status === "fulfilled" ? results[3].value : [];
  const users = results[4].status === "fulfilled" ? results[4].value : [];
  const invoices = results[5].status === "fulfilled" ? results[5].value : [];
  const bookingsData = results[6].status === "fulfilled" ? results[6].value : [];
  const subscriptionPayments = results[7].status === "fulfilled" ? results[7].value : [];

  const properties = toReportArray(propertiesData);
  const services = toReportArray(servicesData);
  const bookings = toReportArray(bookingsData);
  const invoiceRecords = toReportArray(invoices);
  const subscriptionRecords = toReportArray(subscriptionPayments);
  const payments = [...invoiceRecords, ...subscriptionRecords];
  const userRecords = toReportArray(users);
  const adminRecords = toReportArray(admins);

  // Fetch organization members using the same logic as /dashboard/admin/users
  const orgMembersResults = await Promise.allSettled(
    organizations.map((org) => {
      const orgId = org?.id || org?._id || org?.organizationId;
      return orgId
        ? getAdminOrganizationMembers(orgId, 100).catch(() => [])
        : Promise.resolve([]);
    })
  );

  const orgOwnersMap = new Map();
  const facilityManagersMap = new Map();
  const propertyManagersMap = new Map();

  organizations.forEach((org, index) => {
    if (org?.owner && typeof org.owner === "object") {
      const key = getMemberKey({ user: org.owner });
      if (key && !orgOwnersMap.has(key)) orgOwnersMap.set(key, org.owner);
    }

    const res = orgMembersResults[index];
    const members = res?.status === "fulfilled" ? unwrapMembers(res.value) : [];

    members.forEach((member) => {
      const rawRole =
        member?.role?.name ||
        member?.role?.value ||
        member?.role ||
        member?.organizationRole ||
        member?.memberRole ||
        "";
      const norm = normalizeRole(rawRole);
      const key = getMemberKey(member);
      if (!key) return;

      if (["owner", "organizationowner", "orgowner"].includes(norm)) {
        if (!orgOwnersMap.has(key)) orgOwnersMap.set(key, member);
      } else if (norm === "facilitymanager") {
        if (!facilityManagersMap.has(key)) facilityManagersMap.set(key, member);
      } else if (norm === "propertymanager") {
        if (!propertyManagersMap.has(key)) propertyManagersMap.set(key, member);
      }
    });
  });

  const regularUsersMap = new Map();
  const tenantsMap = new Map();
  const serviceProvidersMap = new Map();
  const adminsMap = new Map();
  const otherUsersMap = new Map();

  adminRecords.forEach((a) => {
    const key = getMemberKey(a);
    if (key && !adminsMap.has(key)) adminsMap.set(key, a);
  });

  userRecords.forEach((u) => {
    const norm = normalizeRole(u?.role || u?.user_role || u?.user_type);
    const key = getMemberKey(u);
    if (!key) return;

    if (norm === "facilitymanager") {
      if (!facilityManagersMap.has(key)) facilityManagersMap.set(key, u);
    } else if (norm === "propertymanager") {
      if (!propertyManagersMap.has(key)) propertyManagersMap.set(key, u);
    } else if (["owner", "organizationowner", "orgowner", "propertyowner"].includes(norm)) {
      if (!orgOwnersMap.has(key)) orgOwnersMap.set(key, u);
    } else if (norm === "user") {
      if (!regularUsersMap.has(key)) regularUsersMap.set(key, u);
    } else if (["resident", "tenant"].includes(norm)) {
      if (!tenantsMap.has(key)) tenantsMap.set(key, u);
    } else if (["serviceprovider", "provider", "vendor"].includes(norm)) {
      if (!serviceProvidersMap.has(key)) serviceProvidersMap.set(key, u);
    } else if (["admin", "superadmin", "administrator"].includes(norm)) {
      if (!adminsMap.has(key)) adminsMap.set(key, u);
    } else {
      if (!otherUsersMap.has(key)) otherUsersMap.set(key, u);
    }
  });

  const userStats = {
    organizationOwners: orgOwnersMap.size,
    facilityManagers: facilityManagersMap.size,
    propertyManagers: propertyManagersMap.size,
    regularUsers: regularUsersMap.size,
    residents: tenantsMap.size,
    serviceProviders: serviceProvidersMap.size,
    admins: adminsMap.size,
    otherUsers: otherUsersMap.size,
  };

  // ---- Hero stats ----------------------------------------------------------
  const allUniqueUserKeys = new Set([
    ...orgOwnersMap.keys(),
    ...facilityManagersMap.keys(),
    ...propertyManagersMap.keys(),
    ...regularUsersMap.keys(),
    ...tenantsMap.keys(),
    ...serviceProvidersMap.keys(),
    ...adminsMap.keys(),
    ...otherUsersMap.keys(),
  ]);
  const totalUsers = allUniqueUserKeys.size;

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
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
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
          <DashboardGridItem title="Organization Distribution">
            <div className={chartBox}>
              <OrganizationDistributionChart organizations={organizations} />
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
            <div className="min-h-[400px] rounded-lg border border-line bg-card text-ink p-6 shadow-sm">
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
            <div className="min-h-[350px] rounded-lg border border-line bg-card text-ink p-6 shadow-sm">
              <ServiceGrowthChart services={services} />
            </div>
          </DashboardGridItem>

          <DashboardGridItem title="Monthly Revenue Overview">
            <div className="min-h-[350px] rounded-lg border border-line bg-card text-ink p-6 shadow-sm">
              <RevenueOverviewChart payments={payments} />
            </div>
          </DashboardGridItem>
        </div>
      </div>
    </div>
  );
}
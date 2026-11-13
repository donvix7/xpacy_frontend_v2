import { cookies } from "next/headers";
import {
  getPropertyOwnerProfile,
  getPropertyOwnerProperties,
  getPropertyOwnerServices,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getPropertyOwnerProfile(token),
    getPropertyOwnerProperties(token, { limit: 10000 }),
    getPropertyOwnerServices(token),
  ]);

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const propertiesData =
    results[1].status === "fulfilled" ? results[1].value : [];
  const services = results[2].status === "fulfilled" ? results[2].value : [];

  const allProperties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];
  const properties = allProperties.filter(
    (p) => p.property_owner_id === profile?.id,
  );
  const myServices = Array.isArray(services) ? services : [];

  const uniqueVendors = myServices.reduce((acc, s) => {
    const id = s.service_provider_id || s.provider_id;
    const name =
      s.provider_name || s.service_provider_name || "Unknown Provider";
    if (id && !acc.find((v) => v.id === id)) {
      acc.push({ id, name, type: s.service_type || "General" });
    }
    return acc;
  }, []);

  const completedJobsCount = myServices.filter(
    (s) => (s.status || "").toLowerCase() === "completed",
  ).length;

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Total Services",
      value: myServices.length,
      hint: "All service requests",
    },
    {
      label: "Active Vendors",
      value: uniqueVendors.length,
      hint: "Unique providers",
    },
    {
      label: "Properties",
      value: properties.length,
      hint: "In your portfolio",
    },
    {
      label: "Completed Jobs",
      value: completedJobsCount,
      hint: "Fully resolved",
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
                Vendor console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Vendors
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Your service network at a glance — providers, assigned jobs and completion rates in one place.
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
      <DashboardGridItem title="Service Providers">
        {uniqueVendors.length === 0 ? (
          <EmptyState message="No vendors found. Service providers will appear here once services are requested." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Service Type
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Jobs Assigned
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {uniqueVendors.map((vendor, i) => {
                  const vendorJobs = myServices.filter(
                    (s) =>
                      (s.service_provider_id || s.provider_id) === vendor.id,
                  );
                  const completedJobs = vendorJobs.filter(
                    (s) => (s.status || "").toLowerCase() === "completed",
                  );
                  return (
                    <tr
                      key={vendor.id || i}
                      className="border-b border-primary-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {vendor.name}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-gray-600">
                        {vendor.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vendorJobs.length}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {completedJobs.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardGridItem>
    </div>
  );
}
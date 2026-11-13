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

  const pendingMaintenance = maintenanceServices.filter(
    (s) => (s.status || "").toLowerCase() === "pending",
  );
  const inProgressMaintenance = maintenanceServices.filter(
    (s) => (s.status || "").toLowerCase() === "in-progress",
  );
  const completedMaintenance = maintenanceServices.filter(
    (s) => (s.status || "").toLowerCase() === "completed",
  );

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Total Requests",
      value: maintenanceServices.length,
      hint: "All maintenance",
    },
    {
      label: "Pending",
      value: pendingMaintenance.length,
      hint: "Awaiting action",
    },
    {
      label: "In Progress",
      value: inProgressMaintenance.length,
      hint: "Being worked on",
    },
    {
      label: "Completed",
      value: completedMaintenance.length,
      hint: "Resolved",
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
                Maintenance console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Maintenance
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Track every maintenance request from submission to completion — spot bottlenecks and see what needs attention.
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
      <DashboardGridItem title="Maintenance Requests">
        {maintenanceServices.length === 0 ? (
          <EmptyState message="No maintenance requests found. Requests will appear here when submitted." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Request
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {maintenanceServices.slice(0, 20).map((service, i) => (
                  <tr
                    key={service.id || service._id || i}
                    className="border-b border-primary-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {service.title ||
                        service.description ||
                        `Request ${i + 1}`}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-gray-600">
                      {service.service_type || service.category || "General"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {service.created_at
                        ? new Date(service.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          (service.status || "").toLowerCase() === "completed"
                            ? "bg-green-100 text-green-700"
                            : (service.status || "").toLowerCase() ===
                                "in-progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {service.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardGridItem>
    </div>
  );
}
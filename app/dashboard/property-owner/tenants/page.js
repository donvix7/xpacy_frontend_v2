import { cookies } from "next/headers";
import {
  getPropertyOwnerProfile,
  getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import DashboardMobileCards from "@/app/_components/DashboardMobileCards";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const results = await Promise.allSettled([
    token ? getPropertyOwnerProfile(token) : Promise.resolve(null),
    token
      ? getPropertyOwnerProperties(token, { limit: 10000 })
      : Promise.resolve([]),
  ]);

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const propertiesData =
    results[1].status === "fulfilled" ? results[1].value : [];

  const allProperties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];

  // Only filter by owner if we actually have a profile id
  const properties = profile?.id
    ? allProperties.filter((p) => p.property_owner_id === profile.id)
    : allProperties;

  const rentedProperties = properties.filter(
    (p) => (p.property_status || p.purpose || "").toLowerCase() === "rent",
  );
  const vacantProperties = properties.filter((p) =>
    ["vacant", "available", "active"].includes(
      (p.availability_status || "").toLowerCase(),
    ),
  );

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Total Tenants",
      value: rentedProperties.length,
      hint: "Active rentals",
    },
    {
      label: "Occupied Units",
      value: rentedProperties.length,
      hint: "Currently leased",
    },
    {
      label: "Vacant Units",
      value: vacantProperties.length,
      hint: "Ready to let",
    },
    {
      label: "Total Properties",
      value: properties.length,
      hint: "In your portfolio",
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
                Tenant console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Tenants
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Your rental portfolio at a glance — occupied units, vacancies and the tenant directory in one place.
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
      <DashboardGridItem title="Tenant Directory">
        {rentedProperties.length === 0 ? (
          <EmptyState message="No tenants found. Tenants will appear here once properties are rented out." />
        ) : (
          <div>
            <DashboardMobileCards
              items={rentedProperties.map((property, i) => ({
                key: property.id || property._id || i,
                title: property.title || property.name || "Untitled",
                fields: [
                  {
                    label: "Location",
                    value: property.location || property.state || "—",
                  },
                  {
                    label: "Type",
                    value: property.property_type || property.type || "—",
                  },
                  {
                    label: "Status",
                    value: (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Occupied
                      </span>
                    ),
                  },
                ],
              }))}
            />

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-primary-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Property
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Location
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentedProperties.map((property, i) => (
                    <tr
                      key={property.id || property._id || i}
                      className="border-b border-primary-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {property.title || property.name || "Untitled"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {property.location || property.state || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-gray-600">
                        {property.property_type || property.type || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Occupied
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardGridItem>
    </div>
  );
}
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getManagedProperties } from "@/app/_lib/data-services";

const getStatus = (p, keys = ["availability_status", "status", "occupancy_status"]) => {
  for (const k of keys) {
    if (p?.[k]) return String(p[k]).toLowerCase();
  }
  return "";
};

export default async function Page() {
  const response = await getManagedProperties(10000);
  const properties = Array.isArray(response?.[0])
    ? response[0]
    : Array.isArray(response)
      ? response
      : [];

  // ---- Hero stats ----------------------------------------------------------
  const occupied = properties.filter((p) =>
    ["occupied", "rented", "leased"].includes(getStatus(p)),
  ).length;
  const available = properties.filter((p) =>
    ["available", "vacant", "active", "for_rent", "for_sale"].includes(getStatus(p)),
  ).length;

  const cities = new Set(
    properties.map((p) => p.city || p.state).filter(Boolean),
  ).size;

  const heroStats = [
    {
      label: "Managed Properties",
      value: properties.length,
      hint: "Under your care",
    },
    {
      label: "Occupied",
      value: occupied,
      hint: "Currently leased",
    },
    {
      label: "Available",
      value: available,
      hint: "Ready to lease",
    },
    {
      label: "Locations",
      value: cities,
      hint: "Distinct cities/states",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-2">
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Manager console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Managed Properties
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every property under your management — with occupancy, availability and locations at a glance.
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
      <DashboardGridItem title="Managed Properties List">
        <PropertiesTableList properties={properties} />
      </DashboardGridItem>
    </div>
  );
}
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import {
  getManagedProperties,
  getMyProperties,
  getMyRentedProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function Page() {
  const results = await Promise.allSettled([
    getMyProperties(),
    getManagedProperties(),
    getMyRentedProperties(),
  ]);

  const unwrap = (result) =>
    result.status === "fulfilled" && Array.isArray(result.value)
      ? result.value
      : [];

  const ownedProperties = unwrap(results[0]);
  const managedProperties = unwrap(results[1]);
  const rentedProperties = unwrap(results[2]);

  const counts = {
    owned: ownedProperties.length,
    managed: managedProperties.length,
    rented: rentedProperties.length,
  };

  const total =
    counts.owned + counts.managed + counts.rented;

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    { label: "Owned", value: counts.owned, hint: "Properties you own" },
    { label: "Managed", value: counts.managed, hint: "Under management" },
    { label: "Rented", value: counts.rented, hint: "Currently rented" },
    { label: "Total", value: total, hint: "Across all categories" },
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
                Property console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                My Properties
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Everything you own, manage and rent — with the details and status you need, in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
      <DashboardGridItem title="My Properties List">
        <PropertiesTableList properties={ownedProperties} />
      </DashboardGridItem>

      <DashboardGridItem title="Managed Properties List">
        <PropertiesTableList properties={managedProperties} />
      </DashboardGridItem>

      <DashboardGridItem title="Rented Properties List">
        <PropertiesTableList properties={rentedProperties} />
      </DashboardGridItem>
    </div>
  );
}
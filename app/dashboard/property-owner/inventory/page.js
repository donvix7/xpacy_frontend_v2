import { cookies } from "next/headers";
import {
  getPropertyOwnerProfile,
  getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertyManagerInventory from "@/app/_components/PropertyManagerInventory";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getPropertyOwnerProfile(token),
    getPropertyOwnerProperties(token, { limit: 10000 }),
  ]);

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const propertiesData =
    results[1].status === "fulfilled" ? results[1].value : [];

  const allProperties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];
  const properties = allProperties.filter(
    (p) => p.property_owner_id === profile?.id,
  );

  // ---- Hero stats ----------------------------------------------------------
  // Static placeholders — replace with real inventory counts once wired up.
  const heroStats = [
    {
      label: "Properties",
      value: properties.length,
      hint: "Tracked properties",
    },
    { label: "Unit Items", value: 16, hint: "Assets recorded" },
    { label: "Categories", value: 4, hint: "Distinct types" },
    { label: "Conditions", value: 4, hint: "State tiers" },
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
                Inventory console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Inventory
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every item, category and condition state across your properties — all in one place.
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
      <DashboardGridItem title="Property Inventory">
        {properties.length === 0 ? (
          <p className="font-mono text-sm text-gray-500">
            No properties available. Add a property to start tracking its inventory.
          </p>
        ) : (
          <PropertyManagerInventory properties={properties} />
        )}
      </DashboardGridItem>
    </div>
  );
}
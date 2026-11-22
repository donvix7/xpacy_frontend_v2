import PropertiesTableList from "@/app/_components/PropertiesTableList";
import {
  getManagedProperties,
  getMyProperties,
  getMyRentedProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import Link from "next/link";
import { Plus } from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

function isArchivedProperty(property) {
  const status = String(
    property?.status || property?.property_status || ""
  ).toUpperCase();
  return (
    status === "ARCHIVED" ||
    status === "DELETED" ||
    Boolean(property?.archivedAt || property?.deletedAt)
  );
}

function isActiveProperty(property) {
  if (isArchivedProperty(property)) return false;
  const status = String(
    property?.status || property?.property_status || "ACTIVE"
  ).toUpperCase();
  return status === "ACTIVE";
}

export default async function Page() {
  const results = await Promise.allSettled([
    getMyProperties(),
    getManagedProperties(),
    getMyRentedProperties(),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const unwrap = (result) =>
    result.status === "fulfilled" && Array.isArray(result.value)
      ? result.value
      : [];

  const ownedProperties = unwrap(results[0]);
  const managedProperties = unwrap(results[1]);
  const rentedProperties = unwrap(results[2]);

  const activeOwnedProperties = ownedProperties.filter(isActiveProperty);
  const activeManagedProperties = managedProperties.filter(isActiveProperty);
  const activeRentedProperties = rentedProperties.filter(isActiveProperty);

  // Deduplicate archived properties across owned, managed, and rented
  const seenArchivedIds = new Set();
  const archivedProperties = [
    ...ownedProperties,
    ...managedProperties,
    ...rentedProperties,
  ].filter((property) => {
    if (!isArchivedProperty(property)) return false;
    const key = property?.id || property?._id;
    if (key) {
      if (seenArchivedIds.has(key)) return false;
      seenArchivedIds.add(key);
    }
    return true;
  });

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Owned",
      value: activeOwnedProperties.length,
      hint: "Active properties you own",
    },
    {
      label: "Managed",
      value: activeManagedProperties.length,
      hint: "Active under management",
    },
    {
      label: "Rented",
      value: activeRentedProperties.length,
      hint: "Currently rented",
    },
    {
      label: "Archived",
      value: archivedProperties.length,
      hint: "Archived across all lists",
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
      {dataErrorMessages.length > 0 ? (
        <DataErrorNotice messages={dataErrorMessages} />
      ) : null}

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
                Everything you own, manage and rent — with active properties up
                front and archived records neatly separated below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
             
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

      {/* ---------- Active Properties Sections ---------- */}
      <DashboardGridItem title={`My Properties List (${activeOwnedProperties.length})`}>
        <PropertiesTableList properties={activeOwnedProperties} />
      </DashboardGridItem>

      <DashboardGridItem title={`Managed Properties List (${activeManagedProperties.length})`}>
        <PropertiesTableList properties={activeManagedProperties} />
      </DashboardGridItem>

      <DashboardGridItem title={`Rented Properties List (${activeRentedProperties.length})`}>
        <PropertiesTableList properties={activeRentedProperties} />
      </DashboardGridItem>

      {/* ---------- Archived Properties Section ---------- */}
      <DashboardGridItem title={`Archived Properties (${archivedProperties.length})`}>
        <PropertiesTableList properties={archivedProperties} />
      </DashboardGridItem>
    </div>
  );
}

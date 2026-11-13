import { cookies } from "next/headers";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import { getPropertyOwnerProperties } from "@/app/_lib/data-services";
import PropertiesSummary from "@/app/_components/PropertiesSummary";
import ExportButton from "@/app/_components/ExportButton";
import DateFilter from "@/app/_components/DateFilter";
import { checkDateInRange } from "@/app/_lib/utils";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { Suspense } from "react";

const getPrice = (p) => {
  const n = Number(p?.property_price ?? p?.price ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const params = await searchParams;
  const filterRange = params?.range;

  // Fetch data - explicitly query full unpaginated list
  const propertiesData = await getPropertyOwnerProperties(token, { limit: 10000 });
  const allPropertiesForSummary = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];

  let propertiesList = allPropertiesForSummary || [];

  // Filter by Date Range
  if (filterRange && filterRange !== "all_time") {
    propertiesList = propertiesList.filter((p) => {
      const dateStr = p.createdAt || p.created_at || p.date_added;
      return checkDateInRange(dateStr, filterRange);
    });
  }

  // Local Filtering exactly matching frontend query params
  if (params.status) {
    propertiesList = propertiesList.filter(
      (p) => p.property_status?.toLowerCase() === params.status.toLowerCase(),
    );
  }
  if (params.type) {
    propertiesList = propertiesList.filter(
      (p) => p.property_type?.toLowerCase() === params.type.toLowerCase(),
    );
  }
  if (params.minPrice) {
    propertiesList = propertiesList.filter(
      (p) => Number(p.property_price) >= Number(params.minPrice),
    );
  }
  if (params.maxPrice) {
    propertiesList = propertiesList.filter(
      (p) => Number(p.property_price) <= Number(params.maxPrice),
    );
  }
  if (params.location) {
    const query = params.location.toLowerCase();
    propertiesList = propertiesList.filter(
      (p) =>
        p.city?.toLowerCase().includes(query) ||
        p.state?.toLowerCase().includes(query) ||
        p.property_name?.toLowerCase().includes(query),
    );
  }

  // Manual Pagination
  const page = Number(params.page) || 1;
  const limit = 10;
  const totalItems = propertiesList.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedProperties = propertiesList.slice(
    (page - 1) * limit,
    page * limit,
  );

  const pagination = {
    page,
    limit,
    totalPages,
    total: totalItems,
  };

  // ---- Hero stats ----------------------------------------------------------
  const available = propertiesList.filter((p) =>
    ["available", "vacant", "for_rent", "for_sale"].includes(
      String(p.property_status || "").toLowerCase(),
    ),
  ).length;
  const occupied = propertiesList.filter(
    (p) => String(p.property_status || "").toLowerCase() === "occupied",
  ).length;
  const prices = propertiesList.map(getPrice).filter((n) => n > 0);
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  const heroStats = [
    { label: "Properties", value: totalItems, hint: "Matching filter" },
    {
      label: "Available",
      value: available,
      hint: "Ready for listing",
    },
    {
      label: "Occupied",
      value: occupied,
      hint: "Currently leased",
    },
    {
      label: "Avg. Price",
      value: `₦${avgPrice.toLocaleString()}`,
      hint: "Across matching",
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
                Property console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Properties
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Your full portfolio at a glance — filter, review and export your listings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* DateFilter re-styled to match the hero's glassy secondary */}
              <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border [&_button]:border-white/30 [&_button]:bg-white/10 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-[13px] [&_button]:font-medium [&_button]:text-white [&_button]:backdrop-blur-sm [&_button]:transition-colors [&_button:hover]:bg-white/20">
                <Suspense fallback={<div className="h-10 w-32" />}>
                  <DateFilter />
                </Suspense>
              </div>

              {/* ExportButton re-styled to match the hero's primary */}
              <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:bg-white/95 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-[13px] [&_button]:font-semibold [&_button]:text-side [&_button:hover]:bg-white">
                <ExportButton
                  data={propertiesList}
                  filename="property_summary"
                  options={[
                    { id: "all", label: "All data" },
                    { id: "summary", label: "Summary" },
                    { id: "overview", label: "properties overview" },
                  ]}
                />
              </div>
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
      <DashboardGridItem title="Property Summary">
        <PropertiesSummary properties={allPropertiesForSummary || []} />
      </DashboardGridItem>

      <DashboardGridItem title="Property List">
        <PropertiesTableList
          properties={paginatedProperties}
          pagination={pagination}
        />
      </DashboardGridItem>
    </div>
  );
}
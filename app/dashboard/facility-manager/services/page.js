import { cookies } from "next/headers";
import PropertyOwnerServicesTable from "@/app/_components/PropertyOwnerServicesTable";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import { getBookedServices } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

const getStatus = (s) => String(s?.status || "").toLowerCase();

export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const services = await getBookedServices(token);

  // Filter services that are linked to my properties
  let myServices = Array.isArray(services) ? services : [];

  // Pagination (mock for now as API support is unclear from context, using similar logic to properties)
  const page = Number(searchParams?.page) || 1;
  const limit = 10;
  const total = myServices.length;
  const totalPages = Math.ceil(total / limit);

  // Slice for local pagination if API doesn't paginated
  const paginatedServices = myServices.slice((page - 1) * limit, page * limit);

  const pagination = {
    page,
    limit,
    totalPages,
    total,
  };

  // ---- Hero stats ----------------------------------------------------------
  const completed = myServices.filter((s) => getStatus(s) === "completed").length;
  const inProgress = myServices.filter((s) =>
    ["in-progress", "in progress", "ongoing", "active"].includes(getStatus(s)),
  ).length;
  const pending = myServices.filter((s) => getStatus(s) === "pending").length;

  const heroStats = [
    {
      label: "Services",
      value: total,
      hint: "All requests",
    },
    {
      label: "Completed",
      value: completed,
      hint: "Fully resolved",
    },
    {
      label: "In Progress",
      value: inProgress,
      hint: "Being worked on",
    },
    {
      label: "Pending",
      value: pending,
      hint: "Awaiting action",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-4">
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Services console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Services
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every service request across your properties — what's completed, what's in progress and what still needs attention.
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
      <ServicesOverviewWrapper services={myServices} />

      <DashboardGridItem title="All Services">
        <PropertyOwnerServicesTable
          services={paginatedServices}
          pagination={pagination}
        />
      </DashboardGridItem>
    </div>
  );
}
import { cookies } from "next/headers";
import {
  getPropertyOwnerProfile,
  getPropertyOwnerProperties,
  getPropertyOwnerBookings,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import ScheduleInspection from "@/app/_components/ScheduleInspection";
import InspectionsTable from "@/app/_components/InspectionsTable";
import { isInspectionBooking, parseBookingDate } from "@/app/_lib/utils";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getPropertyOwnerProfile(token),
    getPropertyOwnerProperties(token, { limit: 10000 }),
    getPropertyOwnerBookings(token),
  ]);

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const propertiesData =
    results[1].status === "fulfilled" ? results[1].value : [];
  const bookingsData =
    results[2].status === "fulfilled" ? results[2].value : [];

  const allProperties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];
  const properties = allProperties.filter(
    (p) => p.property_owner_id === profile?.id,
  );

  const allBookings = Array.isArray(bookingsData?.[0])
    ? bookingsData[0]
    : Array.isArray(bookingsData)
      ? bookingsData
      : [];
  const inspections = allBookings.filter(isInspectionBooking);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduledCount = inspections.filter((i) => {
    const date = parseBookingDate(i.start_date);
    return date && date >= today;
  }).length;
  const completedCount = inspections.filter((i) => {
    const date = parseBookingDate(i.start_date);
    return date && date < today;
  }).length;
  const pendingCount = Math.max(
    0,
    inspections.length - scheduledCount - completedCount,
  );

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Total Properties",
      value: properties.length,
      hint: "In your portfolio",
    },
    {
      label: "Scheduled",
      value: scheduledCount,
      hint: "Upcoming inspections",
    },
    {
      label: "Completed",
      value: completedCount,
      hint: "Past inspections",
    },
    {
      label: "Pending",
      value: pendingCount,
      hint: "Unresolved",
    },
  ];

  const formattedDate = new Date().toLocaleDateString("en-NG", {
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
                Inspection console · {formattedDate}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Inspections
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Schedule and track inspections across your properties — see what's upcoming, completed and pending.
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
      <DashboardGridItem title="Property Inspections">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-sm text-gray-500">
            Schedule and track inspections for your properties.
          </p>
          <ScheduleInspection properties={properties} />
        </div>
        {inspections.length > 0 ? (
          <InspectionsTable inspections={inspections} />
        ) : (
          <EmptyState message='No inspections scheduled yet. Click "Schedule Inspection" to book an inspection date for your property.' />
        )}
      </DashboardGridItem>
    </div>
  );
}
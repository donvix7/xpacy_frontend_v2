import { getPropertyOwnerBookings } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import PaymentsTableList from "@/app/_components/PaymentsTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

const getStatus = (b) => String(b?.status || "").toLowerCase();
const getAmount = (b) => {
  const n = parseFloat(b?.amount ?? b?.total ?? b?.total_amount ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const bookingsData = await getPropertyOwnerBookings(token);

  // Bookings for my properties
  const myBookings = Array.isArray(bookingsData) ? bookingsData : [];

  // ---- Hero stats ----------------------------------------------------------
  const paidBookings = myBookings.filter((b) => getStatus(b) === "paid");
  const pendingBookings = myBookings.filter((b) =>
    ["pending", "awaiting payment"].includes(getStatus(b)),
  );
  const failedBookings = myBookings.filter((b) =>
    ["failed", "cancelled", "canceled"].includes(getStatus(b)),
  );

  const collected = paidBookings.reduce((sum, b) => sum + getAmount(b), 0);
  const outstanding = pendingBookings.reduce((sum, b) => sum + getAmount(b), 0);

  const heroStats = [
    {
      label: "Payments",
      value: myBookings.length,
      hint: "All transactions",
    },
    {
      label: "Collected",
      value: `₦${collected.toLocaleString()}`,
      hint: `${paidBookings.length} paid`,
    },
    {
      label: "Outstanding",
      value: `₦${outstanding.toLocaleString()}`,
      hint: `${pendingBookings.length} pending`,
    },
    {
      label: "Failed",
      value: failedBookings.length,
      hint: failedBookings.length ? "Needs review" : "All clear",
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
                Payments console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Payments
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every payment for your properties in one place — collected, outstanding and what needs attention.
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
      <PaymentsOverviewWrapper bookings={myBookings} />

      <DashboardGridItem title="All Payments">
        <PaymentsTableList bookings={myBookings} />
      </DashboardGridItem>
    </div>
  );
}
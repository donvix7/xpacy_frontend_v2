import DashboardGridItem from "@/app/_components/DashboardGridItems";
import NotificationList from "@/app/_components/NotificationList";
import SavedPropCardList from "@/app/_components/SavedProCardList";
import {
  getBookingList,
  getInvoiceList,
  getSavedProperties,
  getUserNotifications,
  getUserProfile,
} from "@/app/_lib/data-services";
import BookedServiceList from "@/app/_components/BookedServicesList";
import PaymentList from "@/app/_components/PaymentList";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default async function Page() {
  const [
    bookingList,
    invoiceList,
    savedPropertiesRes,
    notifications,
    profile,
  ] = await Promise.all([
    getBookingList(),
    getInvoiceList(),
    getSavedProperties(),
    getUserNotifications(),
    getUserProfile(),
  ]);

  const savedProperties = savedPropertiesRes?.data ?? [];
  const invoices = invoiceList ?? [];
  const pendingPayments = invoices.filter(
    (inv) => inv?.status?.toLowerCase() === "pending",
  );

  const bookingCount = bookingList?.length ?? 0;
  const notificationCount = notifications?.length ?? 0;
  const savedCount = savedProperties.length;
  const pendingCount = pendingPayments.length;

  const firstName = profile?.firstName || profile?.first_name || "there";

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Saved Properties",
      value: savedCount,
      hint: "On your shortlist",
    },
    {
      label: "Bookings",
      value: bookingCount,
      hint: "All time",
    },
    {
      label: "Pending Payments",
      value: pendingCount,
      hint: "Awaiting payment",
    },
    {
      label: "Notifications",
      value: notificationCount,
      hint: "Recent activity",
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
      <MobileDashboardHeader />

      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Your dashboard · {formattedDate}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Your saved properties, bookings, payments and notifications — all in one glance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Browse properties
              </Link>
              <Link
                href="/dashboard/user/saved-properties"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                View saved
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
      <div className="mt-2 grid grid-cols-1 grid-rows-[auto] gap-12 lg:grid-cols-[1fr_370px]">
        <DashboardGridItem
          title="Saved Properties"
          viewAllLink="/dashboard/user/saved-properties"
        >
          <SavedPropCardList />
        </DashboardGridItem>

        <DashboardGridItem
          title="Notifications"
          viewAllLink="/dashboard/user/notifications"
        >
          <NotificationList />
        </DashboardGridItem>

        <DashboardGridItem
          title="Booked Services"
          viewAllLink="/dashboard/user/booked-services"
        >
          <BookedServiceList />
        </DashboardGridItem>

        <DashboardGridItem
          title="Payments"
          viewAllLink="/dashboard/user/payments"
        >
          <PaymentList />
        </DashboardGridItem>
      </div>
    </div>
  );
}
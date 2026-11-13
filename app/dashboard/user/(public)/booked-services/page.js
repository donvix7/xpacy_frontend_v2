import { cookies } from "next/headers";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getMyBookings } from "@/app/_lib/data-services";
import Link from "next/link";
import { Search } from "lucide-react";

const tableHeadings = [
  { heading: "Unit" },
  { heading: "Check-In" },
  { heading: "Check-Out" },
  { heading: "Guests", center: true },
  { heading: "Status", center: true },
  { heading: "" },
];

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const formatGuestCount = (booking) => {
  const total =
    booking.numberOfGuests ??
    Number(booking.numberOfAdults || 0) + Number(booking.numberOfChildren || 0);
  return `${total} ${total === 1 ? "guest" : "guests"}`;
};

const bookingStatus = (booking) =>
  String(booking.status || "pending").toLowerCase();
const bookingCheckIn = (booking) =>
  booking.checkIn || booking.check_in || booking.start_date;

export default async function BookingList({ bookings }) {
  let bookingList = bookings;

  // If not passed in, fetch using the token from cookies
  if (!bookingList) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    bookingList = await getMyBookings(token);
  }
/*
  if (!bookingList || bookingList.length <= 0) {
    return (
      <EmptyState
        message={"Oops!... You have no bookings yet."}
        cta={"Browse Listings"}
        link={"/listings"}
      />
    );
  }*/

  // ---- Hero stats ----------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCount = bookingList.filter((booking) => {
    const checkIn = new Date(bookingCheckIn(booking));
    return (
      !Number.isNaN(checkIn.getTime()) &&
      checkIn >= today &&
      !["cancelled", "canceled", "completed"].includes(bookingStatus(booking))
    );
  }).length;

  const pendingCount = bookingList.filter((b) =>
    ["pending", "awaiting payment"].includes(bookingStatus(b)),
  ).length;

  const completedCount = bookingList.filter((b) =>
    ["completed", "complete"].includes(bookingStatus(b)),
  ).length;

  const heroStats = [
    { label: "Total bookings", value: bookingList.length, hint: "All time" },
    { label: "Upcoming", value: upcomingCount, hint: "Confirmed & ahead" },
    { label: "Pending", value: pendingCount, hint: "Awaiting payment" },
    { label: "Completed", value: completedCount, hint: "Past stays" },
  ];

  const formattedDate = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const renderRow = (booking) => (
    <tr
      key={booking.id || booking._id}
      className="border-b border-gray-100 text-sm font-mono transition-colors last:border-0 hover:bg-gray-50"
    >
      <td className="p-4">{booking.unitId || "—"}</td>
      <td className="p-4">{formatDate(booking.checkIn)}</td>
      <td className="p-4">{formatDate(booking.checkOut)}</td>
      <td className="p-4 text-center">{formatGuestCount(booking)}</td>
      <td className="p-4 text-center">
        <div className="flex justify-center">
          <StatusChips status={booking.status || "PENDING"} />
        </div>
      </td>
      <td className="p-4">
        {/* Optional: add a details link */}
        {/* <Link href={`/bookings/${booking.id}`}>View</Link> */}
      </td>
    </tr>
  );

  const renderMobileCard = (booking) => (
    <div
      key={booking.id || booking._id}
      className="flex flex-col gap-4 border-b border-gray-100 bg-white py-6 font-mono last:border-0"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">
          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-gray-800">
          {booking.unitId || "—"}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Status:
          </span>
          <StatusChips status={booking.status || "PENDING"} />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase text-neutral-500">
            Guests
          </p>
          <p className="text-gray-700">
            {formatGuestCount(booking)}
            {booking.numberOfChildren > 0 && (
              <span className="text-gray-500">
                {" "}
                ({booking.numberOfAdults} adults, {booking.numberOfChildren}{" "}
                children)
              </span>
            )}
          </p>
        </div>

        {booking.specialRequests && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase text-neutral-500">
              Special Requests
            </p>
            <p className="whitespace-pre-wrap break-words text-gray-700">
              {booking.specialRequests}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-2">
      <MobileDashboardHeader />

      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Your trips · {formattedDate}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                My Bookings
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                All your stays in one place — upcoming check-ins, pending payments and past trips.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Browse listings
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
      <DataTable
        headers={tableHeadings}
        data={bookingList}
        renderRow={renderRow}
        renderMobileCard={renderMobileCard}
        showPagination={false}
        className="border-none p-0! shadow-none"
      />
    </div>
  );
}
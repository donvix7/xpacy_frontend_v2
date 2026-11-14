import { cookies } from "next/headers";
import {
  getPropertyOwnerProfile,
  getPropertyOwnerProperties,
  getPropertyOwnerInvoices,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";

const parseAmount = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const results = await Promise.allSettled([
    getPropertyOwnerProfile(token),
    getPropertyOwnerProperties(token, { limit: 10000 }),
    getPropertyOwnerInvoices(token),
  ]);

  const profile = results[0].status === "fulfilled" ? results[0].value : null;
  const propertiesData =
    results[1].status === "fulfilled" ? results[1].value : [];
  const invoices = results[2].status === "fulfilled" ? results[2].value : [];

  const allProperties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];
  const properties = allProperties.filter(
    (p) => p.property_owner_id === profile?.id,
  );
  const myInvoices = Array.isArray(invoices) ? invoices : [];

  const rentProperties = properties.filter(
    (p) => (p.purpose || "").toLowerCase() === "rent",
  );
  const rentInvoices = myInvoices.filter((inv) =>
    (inv.reason || inv.type || "").toLowerCase().includes("rent"),
  );
  const paidRent = rentInvoices.filter(
    (inv) => (inv.status || "").toLowerCase() === "paid",
  );
  const pendingRent = rentInvoices.filter(
    (inv) => (inv.status || "").toLowerCase() === "pending",
  );

  const totalCollected = paidRent.reduce(
    (sum, inv) => sum + parseAmount(inv.amount),
    0,
  );
  const totalPending = pendingRent.reduce(
    (sum, inv) => sum + parseAmount(inv.amount),
    0,
  );

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Rent Properties",
      value: rentProperties.length,
      hint: "Listed for rent",
    },
    {
      label: "Collected",
      value: `$${totalCollected.toLocaleString()}`,
      hint: `${paidRent.length} paid invoices`,
    },
    {
      label: "Pending",
      value: `$${totalPending.toLocaleString()}`,
      hint: `${pendingRent.length} awaiting payment`,
    },
    {
      label: "Total Invoices",
      value: rentInvoices.length,
      hint: "Rent invoices",
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
                Rent console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Rents
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every rent invoice in one place — see what's been collected, what's outstanding and which properties are leased.
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
      <DashboardGridItem title="Rent Collection">
        {rentInvoices.length === 0 ? (
          <EmptyState message="No rent records found. Rent invoices will appear here once properties are leased." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rentInvoices.slice(0, 20).map((inv, i) => (
                  <tr
                    key={inv.id || inv._id || i}
                    className="border-b border-primary-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {inv.invoice_number || inv.id || `INV-${i + 1}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ${parseAmount(inv.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {inv.created_at
                        ? new Date(inv.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          (inv.status || "").toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {inv.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardGridItem>
    </div>
  );
}
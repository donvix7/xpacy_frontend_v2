import { getInvoiceList, getManagedProperties } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";

const parseAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default async function Page() {
  const [propertiesData, invoicesData] = await Promise.all([
    getManagedProperties(10000),
    getInvoiceList(),
  ]);

  const properties = Array.isArray(propertiesData?.[0])
    ? propertiesData[0]
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];

  const rentProperties = properties.filter((property) =>
    String(property.purpose || property.listingType || "")
      .toLowerCase()
      .includes("rent"),
  );
  const rentInvoices = invoices.filter((invoice) =>
    `${invoice.reason || ""} ${invoice.type || ""}`
      .toLowerCase()
      .includes("rent"),
  );
  const paid = rentInvoices.filter(
    (invoice) => String(invoice.status || "").toLowerCase() === "paid",
  );
  const pending = rentInvoices.filter(
    (invoice) => String(invoice.status || "").toLowerCase() === "pending",
  );
  const total = (items) =>
    items.reduce((sum, invoice) => sum + parseAmount(invoice.amount), 0);

  const collected = total(paid);
  const outstanding = total(pending);

  // ---- Hero stats ----------------------------------------------------------
  const heroStats = [
    {
      label: "Rent Properties",
      value: rentProperties.length,
      hint: "Listed for rent",
    },
    {
      label: "Collected",
      value: `₦${collected.toLocaleString()}`,
      hint: `${paid.length} paid invoices`,
    },
    {
      label: "Pending",
      value: `₦${outstanding.toLocaleString()}`,
      hint: `${pending.length} awaiting payment`,
    },
    {
      label: "Rent Invoices",
      value: rentInvoices.length,
      hint: "All rent invoices",
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
          <EmptyState message="No rent records found. Rent invoices will appear here once available." />
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
                {rentInvoices.slice(0, 20).map((invoice, index) => (
                  <tr
                    key={invoice.id || invoice._id || index}
                    className="border-b border-primary-100"
                  >
                    <td className="px-4 py-3">
                      {invoice.invoice_number ||
                        invoice.id ||
                        `INV-${index + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      {parseAmount(invoice.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {invoice.created_at
                        ? new Date(invoice.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {invoice.status || "Pending"}
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
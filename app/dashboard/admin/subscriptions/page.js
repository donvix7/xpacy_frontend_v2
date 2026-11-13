import AdminSubscriptionPlans from "@/app/_components/AdminSubscriptionPlans";
import { getSubscriptionList } from "@/app/_lib/data-services";

function unwrapPlans(result) {
  if (Array.isArray(result)) return result;
  return (
    result?.plans ||
    result?.items ||
    result?.results ||
    result?.data?.plans ||
    result?.data?.items ||
    result?.data?.results ||
    (Array.isArray(result?.data) ? result.data : []) ||
    []
  );
}

function formatPrice(amount, currency = "₦") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `${currency}${n.toLocaleString()}`;
}

export default async function Page() {
  const plans = unwrapPlans(await getSubscriptionList());

  // ---- Hero stats ----------------------------------------------------------
  const totalPlans = plans.length;
  const activePlans = plans.filter(
    (p) => p.isActive === true || p.active === true || p.status === "active",
  ).length;
  const monthlyPlans = plans.filter(
    (p) => (p.interval || p.billingCycle || p.period) === "monthly",
  ).length;

  const prices = plans
    .map((p) => Number(p.price ?? p.amount ?? p.cost))
    .filter((n) => Number.isFinite(n) && n > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const priceRange =
    minPrice != null && maxPrice != null
      ? minPrice === maxPrice
        ? formatPrice(minPrice)
        : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
      : "—";

  const heroStats = [
    { label: "Plans", value: totalPlans, hint: "Configured tiers" },
    { label: "Active", value: activePlans, hint: "Visible to customers" },
    { label: "Monthly", value: monthlyPlans, hint: "Billed monthly" },
    { label: "Price range", value: priceRange, hint: "Across all plans" },
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
                Admin console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Manage Subscriptions
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Create and update the plans shown on the subscriptions page — pricing, billing cycles and visibility in one place.
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
      <AdminSubscriptionPlans plans={plans} />
    </div>
  );
}
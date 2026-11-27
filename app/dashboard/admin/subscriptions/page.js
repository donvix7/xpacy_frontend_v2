import AdminSubscriptionPlans from "@/app/_components/AdminSubscriptionPlans";
import CreateSubscriptionPlanButton from "@/app/_components/CreateSubscriptionPlanButton";
import HeroBand from "@/app/_components/HeroBand";
import { getSubscriptionList, getAllUsers } from "@/app/_lib/data-services";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

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

export default async function Page({ searchParams }) {
  const resolvedParams = (await searchParams) || {};
  const openCreate = resolvedParams?.create === "1";

  const results = await Promise.allSettled([
    getSubscriptionList(),
    getAllUsers(),
  ]);
  const dataErrorMessages = getSettledErrorMessages([results[0]]);
  const plans = unwrapPlans(results[0].status === "fulfilled" ? results[0].value : null);
  const users =
    results[1].status === "fulfilled" && Array.isArray(results[1].value)
      ? results[1].value
      : [];

  // ---- Hero stats ----------------------------------------------------------
  const totalPlans = plans.length;
  const activePlans = plans.filter(
    (p) =>
      p.isActive !== false &&
      p.active !== false &&
      String(p.status || "ACTIVE").toLowerCase() !== "inactive"
  ).length;
  const monthlyPlans = plans.filter(
    (p) =>
      String(p.interval || p.billingCycle || p.period || "").toLowerCase() ===
      "monthly"
  ).length;

  const prices = plans
    .map((p) =>
      Number(
        p.monthlyPrice ??
          p.price ??
          p.quarterlyPrice ??
          p.yearlyPrice ??
          p.amount ??
          p.cost
      )
    )
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
    { label: "Monthly range", value: priceRange, hint: "Across all plans" },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8 p-2">
      {dataErrorMessages.length > 0 ? (
        <DataErrorNotice messages={dataErrorMessages} />
      ) : null}

      <HeroBand
        tagline={`Admin console · ${today}`}
        title="Manage Subscriptions"
        description="Create and update the plans shown on the subscriptions page — pricing, billing cycles and visibility in one place."
        actions={<CreateSubscriptionPlanButton />}
        stats={heroStats}
      />

      <AdminSubscriptionPlans
        plans={plans}
        users={users}
        defaultCreateOpen={openCreate}
      />
    </div>
  );
}

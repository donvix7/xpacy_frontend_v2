import Link from "next/link";
import EmptyState from "@/app/_components/EmptyState";
import { getSubscriptionList } from "@/app/_lib/data-services";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

function getPlans(result) {
  if (Array.isArray(result)) return result;
  return result?.plans || result?.items || result?.results || result?.data?.plans || result?.data?.items || result?.data?.results || (Array.isArray(result?.data) ? result.data : []) || [];
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

function getFeatureRows(features) {
  if (Array.isArray(features)) {
    return features.map((item, index) => [String(index + 1), typeof item === "string" ? item : item?.name || JSON.stringify(item)]);
  }
  if (features && typeof features === "object") {
    return Object.entries(features).map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]);
  }
  return [];
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-primary-100 bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export default async function Page({ params }) {
  const { id } = await params;
  const results = await Promise.allSettled([getSubscriptionList()]);
  const dataErrorMessages = getSettledErrorMessages(results);
  const plans = getPlans(results[0].status === "fulfilled" ? results[0].value : null);
  const plan = plans.find((item) => String(item?.id || item?._id || item?.planId || "") === String(id));

  if (!plan) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
        <Link href="/dashboard/admin/subscriptions" className="text-sm font-semibold text-primary hover:underline">← Back to subscriptions</Link>
        <EmptyState message="Subscription plan not found." />
      </div>
    );
  }

  const name = plan.name || plan.title || "Untitled plan";
  const status = plan.isActive === false || String(plan.status || "").toUpperCase() === "INACTIVE" ? "Inactive" : "Active";
  const monthlyPrice = plan.price ?? plan.monthly ?? plan.monthlyPrice;
  const yearlyPrice = plan.yearly ?? plan.yearlyPrice;
  const quaterlyPrice = plan.quarterly ?? plan.quarterlyPrice;


  const features = getFeatureRows(plan.features);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
      <Link href="/dashboard/admin/subscriptions" className="text-sm font-semibold text-primary hover:underline">← Back to subscriptions</Link>

      <header className="rounded-2xl bg-primary-900 p-6 text-white md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Subscription plan</p>
            <h1 className="mt-2 text-3xl font-bold">{name}</h1>
            <p className="mt-2 text-sm text-white/75">{plan.description || "No description provided."}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-white/15 text-white"}`}>{status}</span>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Plan details</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Monthly Price" value={monthlyPrice == null ? "Custom" : `${plan.currency || "NGN"} ${Number(monthlyPrice).toLocaleString()}`} />
          <Detail label="Yearly Price" value={yearlyPrice == null ? "Custom" : `${plan.currency || "NGN"} ${Number(yearlyPrice).toLocaleString()}`} />
          <Detail label="Quarterly Price" value={quaterlyPrice == null ? "Custom" : `${plan.currency || "NGN"} ${Number(quaterlyPrice).toLocaleString()}`} />
          <Detail label="Currency" value={plan.currency || "NGN"} />
          <Detail label="Sort order" value={plan.sortOrder ?? 0} />  

          <Detail label="Maximum organizations" value={plan.maxOrganizations ?? 0} />
          <Detail label="Maximum properties" value={plan.maxProperties ?? 0} />
          <Detail label="Maximum units" value={plan.maxUnits ?? 0} />
          <Detail label="Maximum buildings" value={plan.maxBuildings ?? 0} />

          </dl>
      </section>

      <section className="rounded-2xl border border-primary-100 bg-white p-5 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">Features</h2>
        {features.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No features have been set for this plan.</p>
        ) : (
          <dl className="mt-4 divide-y divide-gray-100">
            {features.map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <dt className="font-medium text-gray-700">{label}</dt>
                <dd className="max-w-xl break-words text-gray-600">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}

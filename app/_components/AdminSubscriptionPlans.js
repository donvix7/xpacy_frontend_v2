"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "@/app/_components/DataTable";
import {
  saveSubscriptionPlan,
  assignUserSubscription,
} from "@/app/_lib/action";
import {
  OPEN_CREATE_PLAN_EVENT,
  OPEN_ASSIGN_SUBSCRIPTION_EVENT,
} from "@/app/_components/CreateSubscriptionPlanButton";

function formatMoney(amount, currency = "NGN") {
  if (amount === undefined || amount === null || amount === "") return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";
  const symbol = String(currency).toUpperCase() === "NGN" ? "₦" : `${currency} `;
  return `${symbol}${num.toLocaleString()}`;
}

function titleCase(value) {
  if (!value) return "—";
  return String(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPlanId(plan) {
  return String(plan?.id || plan?._id || plan?.planId || "");
}

function randomAlphaNum(length = 5) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function buildPlanSlug(name, suffix) {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `${base}-${suffix}` : "";
}

function getFeatures(features) {
  if (features && typeof features === "object" && !Array.isArray(features)) {
    return JSON.stringify(features, null, 2);
  }
  if (Array.isArray(features)) {
    return JSON.stringify(Object.fromEntries(features.map((feature, index) => [
      typeof feature === "string" ? feature : feature?.name || `feature${index + 1}`,
      true,
    ])), null, 2);
  }
  return "{}";
}

function getUserDisplayLabel(user) {
  const fullName = [
    user?.firstName || user?.firstname || user?.first_name,
    user?.lastName || user?.lastname || user?.last_name,
  ]
    .filter(Boolean)
    .join(" ");
  const email = user?.email || "";
  if (fullName && email) return `${fullName} (${email})`;
  return fullName || email || String(user?.id || user?._id || "User");
}

export default function AdminSubscriptionPlans({
  plans = [],
  users = [],
  defaultCreateOpen = false,
}) {
  const router = useRouter();
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(Boolean(defaultCreateOpen));
  const [isAssigning, setIsAssigning] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState("STANDARD");
  const [slugSuffix, setSlugSuffix] = useState(() => randomAlphaNum(5));
  const [message, setMessage] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setMessage("");
    setAssignMessage("");
    setAssignSuccess("");
    setIsAssigning(false);
    setEditingPlan(null);
    setPlanName("");
    setPlanType("STANDARD");
    setSlugSuffix(randomAlphaNum(5));
    setIsCreating(true);
  };

  const openAssign = () => {
    setMessage("");
    setAssignMessage("");
    setAssignSuccess("");
    setEditingPlan(null);
    setIsCreating(false);
    setIsAssigning(true);
  };

  useEffect(() => {
    if (defaultCreateOpen) {
      openCreate();
    }
  }, [defaultCreateOpen]);

  useEffect(() => {
    const onOpenCreate = () => openCreate();
    const onOpenAssign = () => openAssign();
    window.addEventListener(OPEN_CREATE_PLAN_EVENT, onOpenCreate);
    window.addEventListener(OPEN_ASSIGN_SUBSCRIPTION_EVENT, onOpenAssign);
    return () => {
      window.removeEventListener(OPEN_CREATE_PLAN_EVENT, onOpenCreate);
      window.removeEventListener(OPEN_ASSIGN_SUBSCRIPTION_EVENT, onOpenAssign);
    };
  }, []);

  const openEdit = (plan) => {
    setMessage("");
    setAssignMessage("");
    setAssignSuccess("");
    setIsAssigning(false);
    setIsCreating(false);
    setPlanName(plan?.name || plan?.title || "");
    setPlanType(String(plan?.planType || "STANDARD").toUpperCase());
    setEditingPlan(plan);
  };

  const closeForm = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setIsAssigning(false);
    setPlanName("");
    setPlanType("STANDARD");
    setMessage("");
    setAssignMessage("");
    setAssignSuccess("");
    if (defaultCreateOpen) {
      router.replace("/dashboard/admin/subscriptions", { scroll: false });
    }
  };

  const computedSlug = editingPlan
    ? editingPlan.slug || buildPlanSlug(planName, slugSuffix)
    : buildPlanSlug(planName, slugSuffix);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = editingPlan ? getPlanId(editingPlan) : "";
    if (id) formData.set("id", id);
    formData.set("slug", computedSlug);

    startTransition(async () => {
      const result = await saveSubscriptionPlan(formData);
      if (result?.success) {
        closeForm();
        window.location.reload();
      } else {
        setMessage(result?.message || "Could not save this plan. Please try again.");
      }
    });
  };

  const handleAssignSubmit = (event) => {
    event.preventDefault();
    setAssignMessage("");
    setAssignSuccess("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await assignUserSubscription(formData);
      if (result?.success) {
        setAssignSuccess(result?.message || "Subscription assigned successfully.");
        event.target?.reset?.();
      } else {
        setAssignMessage(result?.message || "Could not assign this subscription. Please try again.");
      }
    });
  };

  const activePlan = editingPlan || {};
  const formOpen = isCreating || Boolean(editingPlan);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Subscription plans</h2>
        <p className="mt-1 text-sm text-mute">
          These plans are available on the public subscriptions page.
        </p>
      </div>

      {isAssigning && (
        <form
          onSubmit={handleAssignSubmit}
          className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm md:p-7"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Assign subscription to user
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Assign a subscription plan directly to a user account (one active subscription per user).
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="rounded-full px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
            >
              ×
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-gray-700">
              User account *
              {users.length > 0 ? (
                <select
                  name="userId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Select a user…
                  </option>
                  {users.map((u) => {
                    const uid = String(u?.id || u?._id || "");
                    if (!uid) return null;
                    return (
                      <option key={uid} value={uid}>
                        {getUserDisplayLabel(u)}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  name="userId"
                  required
                  placeholder="User UUID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                />
              )}
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Subscription plan *
              <select
                name="planId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Select a plan…
                </option>
                {plans.map((plan) => {
                  const pid = getPlanId(plan);
                  if (!pid) return null;
                  return (
                    <option key={pid} value={pid}>
                      {plan.name || plan.title || "Untitled plan"} ({titleCase(plan.planType || "STANDARD")})
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Billing interval
              <select
                name="billingInterval"
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary"
              >
                <option value="">Plan default</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
              <span className="block text-[11px] font-normal text-gray-500">
                Defaults to the plan&apos;s default interval; must be offered by the plan.
              </span>
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Start date <span className="font-normal text-gray-500">(optional)</span>
              <input
                name="startDate"
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
              <span className="block text-[11px] font-normal text-gray-500">
                Defaults to now if omitted.
              </span>
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700 md:col-span-2">
              End date <span className="font-normal text-gray-500">(optional)</span>
              <input
                name="endDate"
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
              <span className="block text-[11px] font-normal text-gray-500">
                Derived from plan type/interval if omitted (trial: durationDays, lifetime: +100y).
              </span>
            </label>
          </div>
          {assignMessage && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {assignMessage}
            </p>
          )}
          {assignSuccess && (
            <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {assignSuccess}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Assigning…" : "Assign subscription"}
            </button>
          </div>
        </form>
      )}

      {formOpen && (
        <form key={editingPlan ? getPlanId(editingPlan) : "new-plan"} onSubmit={handleSubmit} className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-primary">{editingPlan ? "Edit subscription plan" : "Create subscription plan"}</h3>
            <button type="button" onClick={closeForm} aria-label="Close form" className="rounded-full px-3 py-1 text-xl text-gray-500 hover:bg-gray-100">×</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Plan name *
              <input
                name="name"
                required
                placeholder="Growth"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Slug
              <input
                type="text"
                value={computedSlug}
                disabled
                placeholder="growth-a1b2c"
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 font-mono text-gray-500 outline-none"
              />
              <input type="hidden" name="slug" value={computedSlug} />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Plan type
              <select
                name="planType"
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary"
              >
                <option value="STANDARD">Standard</option>
                <option value="TRIAL">Trial (free time-limited)</option>
                <option value="LIFETIME">Lifetime (admin-assign only)</option>
              </select>
            </label>

            {planType === "TRIAL" ? (
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Trial duration (days)
                <input
                  name="durationDays"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={activePlan.durationDays ?? 14}
                  placeholder="14"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
                />
              </label>
            ) : (
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Currency
                <input
                  name="currency"
                  defaultValue={activePlan.currency || "NGN"}
                  placeholder="NGN"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
                />
              </label>
            )}

            {planType === "TRIAL" && (
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Currency
                <input
                  name="currency"
                  defaultValue={activePlan.currency || "NGN"}
                  placeholder="NGN"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
                />
              </label>
            )}

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Default billing interval
              <select
                name="interval"
                defaultValue={activePlan.interval || "MONTHLY"}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Monthly price
              <input
                name="monthlyPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="25000 (blank to clear)"
                defaultValue={activePlan.monthlyPrice ?? activePlan.price ?? activePlan.priceMonthly ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Quarterly price
              <input
                name="quarterlyPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="70000 (blank to clear)"
                defaultValue={activePlan.quarterlyPrice ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Yearly price
              <input
                name="yearlyPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="260000 (blank to clear)"
                defaultValue={activePlan.yearlyPrice ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700 md:col-span-2">
              Description
              <textarea
                name="description"
                rows={2}
                defaultValue={activePlan.description || activePlan.tagline || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700 md:col-span-2">
              Features <span className="font-normal text-gray-500">(JSON object, e.g. {`{ "features": ["..."] }`})</span>
              <textarea
                name="features"
                rows={4}
                defaultValue={getFeatures(activePlan.features)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Maximum organizations <span className="font-normal text-gray-500">(blank = unlimited)</span>
              <input
                name="maxOrganizations"
                type="number"
                min="0"
                step="1"
                placeholder="Unlimited"
                defaultValue={activePlan.maxOrganizations ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Maximum properties <span className="font-normal text-gray-500">(blank = unlimited)</span>
              <input
                name="maxProperties"
                type="number"
                min="0"
                step="1"
                placeholder="Unlimited"
                defaultValue={activePlan.maxProperties ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Maximum buildings <span className="font-normal text-gray-500">(blank = unlimited)</span>
              <input
                name="maxBuildings"
                type="number"
                min="0"
                step="1"
                placeholder="Unlimited"
                defaultValue={activePlan.maxBuildings ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Maximum units <span className="font-normal text-gray-500">(blank = unlimited)</span>
              <input
                name="maxUnits"
                type="number"
                min="0"
                step="1"
                placeholder="Unlimited"
                defaultValue={activePlan.maxUnits ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-gray-700">
              Sort order
              <input
                name="sortOrder"
                type="number"
                min="0"
                step="1"
                defaultValue={activePlan.sortOrder ?? 0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={activePlan.isActive !== false && activePlan.status !== "INACTIVE"}
                className="h-4 w-4 accent-primary"
              />
              Active and visible
            </label>
          </div>
          {message && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
            <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isPending ? "Saving…" : editingPlan ? "Save changes" : "Create plan"}</button>
          </div>
        </form>
      )}

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card py-8">
          <EmptyState message="No subscription plans have been created yet." />
        </div>
      ) : (
        <DataTable
          headers={[
            { heading: "Plan" },
            { heading: "Type / Interval" },
            { heading: "Monthly" },
            { heading: "Quarterly" },
            { heading: "Yearly" },
            { heading: "Limits" },
            { heading: "Order", center: true },
            { heading: "Action", center: true },
          ]}
          data={plans}
          showPagination={false}
          renderRow={(plan, index) => {
            const currency = plan.currency || "NGN";
            const planId = getPlanId(plan);
            const monthly = plan.monthlyPrice ?? plan.price ?? plan.priceMonthly;
            const quarterly = plan.quarterlyPrice;
            const yearly = plan.yearlyPrice;
            const planType = plan.planType || "STANDARD";
            const interval = plan.interval || "MONTHLY";
            const maxOrgs = plan.maxOrganizations ?? 0;
            const maxProps = plan.maxProperties ?? 0;
            const maxBldgs = plan.maxBuildings ?? 0;
            const maxUnits = plan.maxUnits ?? 0;
            const sortOrder = plan.sortOrder ?? 0;

            return (
              <tr
                key={planId || `${plan.name || plan.title}-${index}`}
                className="border-b border-line hover:bg-soft transition-colors text-sm last:border-0"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">
                      {plan.name || plan.title || "Untitled plan"}
                    </p>
                    {plan.slug && (
                      <span className="rounded-md bg-soft px-1.5 py-0.5 font-mono text-[10.5px] text-mute">
                        {plan.slug}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 max-w-xs truncate text-xs text-mute">
                    {plan.description || plan.tagline || "—"}
                  </p>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full border border-line bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                    {titleCase(planType)}
                  </span>
                  <p className="mt-1 text-xs text-mute">
                    {titleCase(interval)} · {currency}
                  </p>
                </td>
                <td className="p-4 whitespace-nowrap font-mono text-xs font-semibold text-ink">
                  {formatMoney(monthly, currency)}
                </td>
                <td className="p-4 whitespace-nowrap font-mono text-xs font-semibold text-ink">
                  {formatMoney(quarterly, currency)}
                </td>
                <td className="p-4 whitespace-nowrap font-mono text-xs font-semibold text-ink">
                  {formatMoney(yearly, currency)}
                </td>
                <td className="p-4 text-xs text-mute">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11.5px] whitespace-nowrap">
                    <span>{maxOrgs} orgs</span>
                    <span>{maxProps} props</span>
                    <span>{maxBldgs} bldgs</span>
                    <span>{maxUnits} units</span>
                  </div>
                </td>
                <td className="p-4 text-center font-mono text-xs text-mute">
                  {sortOrder}
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/admin/subscriptions/${planId}`}
                      className="xp-btn px-3 py-1.5 text-xs font-mono"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="xp-btn xp-btn-fill px-3 py-1.5 text-xs font-mono cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
          renderMobileCard={(plan, index) => {
            const currency = plan.currency || "NGN";
            const planId = getPlanId(plan);
            const monthly = plan.monthlyPrice ?? plan.price ?? plan.priceMonthly;
            const quarterly = plan.quarterlyPrice;
            const yearly = plan.yearlyPrice;
            const planType = plan.planType || "STANDARD";
            const interval = plan.interval || "MONTHLY";

            return (
              <article
                key={planId || `${plan.name || plan.title}-${index}`}
                className="rounded-xl border border-line bg-card p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">
                        {plan.name || plan.title || "Untitled plan"}
                      </p>
                      {plan.slug && (
                        <span className="rounded-md bg-soft px-1.5 py-0.5 font-mono text-[10.5px] text-mute">
                          {plan.slug}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-mute">
                      {plan.description || plan.tagline || "—"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-line bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                    {titleCase(planType)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-soft/60 p-2.5 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-mute">Monthly</p>
                    <p className="mt-0.5 font-mono text-xs font-bold text-ink">
                      {formatMoney(monthly, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-mute">Quarterly</p>
                    <p className="mt-0.5 font-mono text-xs font-bold text-ink">
                      {formatMoney(quarterly, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-mute">Yearly</p>
                    <p className="mt-0.5 font-mono text-xs font-bold text-ink">
                      {formatMoney(yearly, currency)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11.5px] text-mute">
                  <span>{plan.maxOrganizations ?? 0} orgs</span>
                  <span>·</span>
                  <span>{plan.maxProperties ?? 0} props</span>
                  <span>·</span>
                  <span>{plan.maxBuildings ?? 0} bldgs</span>
                  <span>·</span>
                  <span>{plan.maxUnits ?? 0} units</span>
                </div>

                <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="font-mono text-mute">
                    {titleCase(interval)} · Order #{plan.sortOrder ?? 0}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/admin/subscriptions/${planId}`}
                      className="xp-btn px-2.5 py-1 text-xs"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="xp-btn xp-btn-fill px-2.5 py-1 text-xs cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            );
          }}
          className="p-0 border-none shadow-none"
        />
      )}
    </div>
  );
}

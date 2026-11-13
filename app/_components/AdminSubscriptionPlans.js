"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import EmptyState from "@/app/_components/EmptyState";
import { saveSubscriptionPlan } from "@/app/_lib/action";

function getPlanId(plan) {
  return String(plan?.id || plan?._id || plan?.planId || "");
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

export default function AdminSubscriptionPlans({ plans = [] }) {
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setMessage("");
    setEditingPlan(null);
    setIsCreating(true);
  };

  const openEdit = (plan) => {
    setMessage("");
    setIsCreating(false);
    setEditingPlan(plan);
  };

  const closeForm = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = editingPlan ? getPlanId(editingPlan) : "";
    if (id) formData.set("id", id);

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

  const activePlan = editingPlan || {};
  const formOpen = isCreating || Boolean(editingPlan);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Subscription plans</h2>
          <p className="mt-1 text-sm text-gray-500">These plans are available on the public subscriptions page.</p>
        </div>
        <button type="button" onClick={openCreate} className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-900">
          Create plan
        </button>
      </div>

      {formOpen && (
        <form key={editingPlan ? getPlanId(editingPlan) : "new-plan"} onSubmit={handleSubmit} className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-primary">{editingPlan ? "Edit subscription plan" : "Create subscription plan"}</h3>
            <button type="button" onClick={closeForm} aria-label="Close form" className="rounded-full px-3 py-1 text-xl text-gray-500 hover:bg-gray-100">×</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Plan name
              <input name="name" required defaultValue={activePlan.name || activePlan.title || ""} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Slug
              <input name="slug" required defaultValue={activePlan.slug || ""} placeholder="growth" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Currency
              <input name="currency" defaultValue={activePlan.currency || "NGN"} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700 md:col-span-2">
              Description
              <textarea name="description" rows={2} defaultValue={activePlan.description || activePlan.tagline || ""} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Price
              <input name="price" type="number" min="0" step="0.01" required defaultValue={activePlan.price ?? activePlan.monthly ?? activePlan.priceMonthly ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Billing interval
              <select name="interval" defaultValue={activePlan.interval || "MONTHLY"} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700 md:col-span-2">
              Features <span className="font-normal text-gray-500">(JSON object)</span>
              <textarea name="features" rows={5} defaultValue={getFeatures(activePlan.features)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Maximum organizations
              <input name="maxOrganizations" type="number" min="0" step="1" defaultValue={activePlan.maxOrganizations ?? 0} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Maximum properties
              <input name="maxProperties" type="number" min="0" step="1" defaultValue={activePlan.maxProperties ?? 0} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Sort order
              <input name="sortOrder" type="number" min="0" step="1" defaultValue={activePlan.sortOrder ?? 0} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input name="isActive" type="checkbox" defaultChecked={activePlan.isActive !== false && activePlan.status !== "INACTIVE"} className="h-4 w-4 accent-primary" />
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
        <div className="rounded-2xl border border-primary-100 bg-white py-8"><EmptyState message="No subscription plans have been created yet." /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-primary-50 text-xs uppercase tracking-wide text-primary-900">
                <tr><th className="px-5 py-4">Plan</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Interval</th><th className="px-5 py-4">Limits</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan, index) => {
                  const currency = plan.currency || "NGN";
                  const price = plan.price ?? plan.monthly ?? plan.priceMonthly;
                  const active = plan.isActive !== false && String(plan.status || "").toUpperCase() !== "INACTIVE";
                  return (
                    <tr key={getPlanId(plan) || `${plan.name || plan.title}-${index}`} className="text-gray-700">
                      <td className="px-5 py-4"><p className="font-semibold text-gray-900">{plan.name || plan.title || "Untitled plan"}</p><p className="mt-1 max-w-xs truncate text-xs text-gray-500">{plan.slug || plan.description || plan.tagline || "No description"}</p></td>
                      <td className="px-5 py-4">{price == null ? "Custom" : `${currency} ${Number(price).toLocaleString()}`}</td>
                      <td className="px-5 py-4">{String(plan.interval || "MONTHLY").toLowerCase()}</td>
                      <td className="px-5 py-4 text-xs">{plan.maxOrganizations ?? 0} orgs · {plan.maxProperties ?? 0} properties</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{active ? "Active" : "Inactive"}</span></td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/admin/subscriptions/${getPlanId(plan)}`} className="rounded-lg border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">View</Link>
                          <button type="button" onClick={() => openEdit(plan)} className="rounded-lg border border-primary-200 px-4 py-2 font-semibold text-primary hover:bg-primary-50">Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

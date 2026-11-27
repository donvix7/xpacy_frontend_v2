"use client";

import { Plus, UserPlus } from "lucide-react";

export const OPEN_CREATE_PLAN_EVENT = "xpacy:open-create-plan";
export const OPEN_ASSIGN_SUBSCRIPTION_EVENT = "xpacy:open-assign-subscription";

export default function CreateSubscriptionPlanButton() {
  const handleCreateClick = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CREATE_PLAN_EVENT));
  };

  const handleAssignClick = () => {
    window.dispatchEvent(new CustomEvent(OPEN_ASSIGN_SUBSCRIPTION_EVENT));
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAssignClick}
        className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
      >
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Assign subscription
      </button>
      <button
        type="button"
        onClick={handleCreateClick}
        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white cursor-pointer"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create plan
      </button>
    </>
  );
}

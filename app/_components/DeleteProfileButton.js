"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerMini from "./SpinnerMini";
import { deleteCurrentUserProfile } from "../_lib/action";

export default function DeleteProfileButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCurrentUserProfile();
      if (!result?.success) {
        toast.error(result?.message || "Could not delete your profile.");
        return;
      }
      toast.success("Your profile has been deleted.");
      router.replace("/auth/log-in");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-gray-900">Delete profile</p>
        <p className="mt-1 text-sm text-gray-600">This permanently deletes your profile and signs you out.</p>
      </div>
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)} className="w-fit rounded-lg border border-red-300 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-50">
          Delete Profile
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-red-700">Are you sure?</span>
          <button type="button" onClick={handleDelete} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? <SpinnerMini /> : "Yes, delete profile"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 disabled:opacity-60">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

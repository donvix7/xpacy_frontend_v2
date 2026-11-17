"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ActivateUserButton({ userId, onActivate }) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const handleClick = () => {
        startTransition(async () => {
            try {
                const result = await onActivate(userId);
                if (result?.success === false || result?.error) {
                    toast.error(
                        result?.message ||
                            result?.error ||
                            "Could not activate user.",
                    );
                    return;
                }
                toast.success("User activated.");
                router.refresh();
            } catch (err) {
                toast.error(
                    err?.message || "Could not activate user.",
                );
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {pending ? "Activating…" : "Activate user"}
        </button>
    );
}
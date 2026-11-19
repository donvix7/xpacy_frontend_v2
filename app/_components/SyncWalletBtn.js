"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function SyncWalletButton({ onSync }) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const handleSync = () => {
        startTransition(async () => {
            try {
                const result = await onSync();
                if (result?.success === false || result?.error) {
                    toast.error(
                        result?.message ||
                            result?.error ||
                            "Could not sync wallet.",
                    );
                    return;
                }
                toast.success("Wallet synced.");
                router.refresh();
            } catch (err) {
                toast.error(err?.message || "Could not sync wallet.");
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleSync}
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <RefreshCw
                className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`}
                aria-hidden="true"
            />
            {pending ? "Syncing…" : "Sync wallet"}
        </button>
    );
}
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function DeleteUserButton({ userId, userName, userEmail, onDelete }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const confirmDeactivate = () => {
        startTransition(async () => {
            try {
                const result = await onDelete(userId);
                if (result?.success === false || result?.error) {
                    toast.error(
                        result?.message ||
                            result?.error ||
                            "Could not deactivate user.",
                    );
                    return;
                }
                toast.success("User deactivated successfully.");
                setOpen(false);
                router.refresh();
            } catch (err) {
                toast.error(err?.message || "Could not deactivate user.");
            }
        });
    };

    const displayName = userName || "this user";
    const subtext = `Are you sure you want to deactivate ${displayName}${
        userEmail ? ` (${userEmail})` : ""
    }? This user will lose access to the platform until reactivated.`;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
            >
                <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                Deactivate user
            </button>

            {open && (
                <div
                    className="xp-surface fixed inset-0 z-50 flex items-center justify-center bg-side/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="deactivate-user-title"
                    onClick={() => !pending && setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ConfirmDeleteModal
                            heading="Deactivate user account"
                            description={subtext}
                            confirmLabel="Deactivate user"
                            cancelLabel="Cancel"
                            variant="warning"
                            icon={UserX}
                            onConfirm={confirmDeactivate}
                            onClose={() => setOpen(false)}
                            isPending={pending}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

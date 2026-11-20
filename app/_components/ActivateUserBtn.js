"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function ActivateUserButton({ userId, userName, userEmail, onActivate }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const confirmActivate = () => {
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
                toast.success("User activated successfully.");
                setOpen(false);
                router.refresh();
            } catch (err) {
                toast.error(
                    err?.message || "Could not activate user.",
                );
            }
        });
    };

    const displayName = userName || "this user";
    const subtext = `Are you sure you want to activate ${displayName}${
        userEmail ? ` (${userEmail})` : ""
    }? This will restore full platform and dashboard access for this account.`;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Activate user
            </button>

            <Modal.Window
                open={open}
                onClose={() => !pending && setOpen(false)}
                hideCloseButton
                closeOnOverlayClick={!pending}
                closeOnEscape={!pending}
                className="max-w-md"
                ariaLabelledBy="activate-user-title"
            >
                <ConfirmDeleteModal
                    heading="Activate user account"
                    description={subtext}
                    confirmLabel="Activate user"
                    cancelLabel="Cancel"
                    variant="success"
                    icon={UserCheck}
                    onConfirm={confirmActivate}
                    onClose={() => setOpen(false)}
                    isPending={pending}
                />
            </Modal.Window>
        </>
    );
}

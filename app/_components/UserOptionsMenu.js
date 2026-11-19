"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, UserX, Wrench } from "lucide-react";
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { deleteUser } from "../_lib/action";
import toast from "react-hot-toast";

const DeactivateUserModal = ({ id, onClose }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDeactivate = () => {
        startTransition(async () => {
            try {
                const res = await deleteUser(id);
                if (res?.success === false || res?.error) {
                    toast.error(res?.message || res?.error || "Could not deactivate user.");
                } else {
                    toast.success("User deactivated successfully");
                    onClose?.();
                    router.refresh();
                }
            } catch (err) {
                toast.error(err?.message || "Could not deactivate user.");
            }
        });
    };

    return (
        <ConfirmDeleteModal
            heading="Deactivate this user?"
            description="Are you sure you want to deactivate this user account? The user will lose access to the platform until reactivated."
            confirmLabel="Deactivate user"
            cancelLabel="Cancel"
            variant="warning"
            icon={UserX}
            onConfirm={handleDeactivate}
            onClose={onClose}
            isPending={isPending}
        />
    );
};

export default function UserOptionsMenu({ id, role }) {
    const isProvider = role === 'provider' || role === 'service-provider';
    const detailHref = isProvider ? `/admin/provider-details/${id}` : `/dashboard/admin/users/${id}`;

    const actions = [
        {
            label: "View details",
            href: detailHref,
            icon: <User className="text-mute" />,
        },
        ...(isProvider ? [
            {
                label: "Edit provider",
                href: `/admin/edit-provider/${id}`,
                icon: <Wrench className="text-mute" />,
            }
        ] : []),
        {
            label: "Deactivate user",
            icon: <UserX className="text-mute" />,
            modal: <DeactivateUserModal id={id} />,
        },
    ];

    return (
        <TableItemOptionsMenu actions={actions} menuId={`user-menu-${id}`} />
    );
}

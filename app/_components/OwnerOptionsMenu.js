"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { VscNote } from "react-icons/vsc";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbInvoice } from "react-icons/tb";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { deletePropertyOwner } from "../_lib/action";
import toast from "react-hot-toast";

const DeleteOwnerModal = ({ id, onClose }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const res = await deletePropertyOwner(id);
                if (res?.success === false || res?.error) {
                    toast.error(res?.message || res?.error || "Could not delete owner.");
                } else {
                    toast.success("Owner deleted successfully");
                    onClose?.();
                    router.refresh();
                }
            } catch (err) {
                toast.error(err?.message || "Could not delete owner.");
            }
        });
    };

    return (
        <ConfirmDeleteModal
            heading="Delete this owner?"
            description="Are you sure you want to delete this property owner record? This action cannot be undone."
            confirmLabel="Delete owner"
            cancelLabel="Cancel"
            variant="danger"
            onConfirm={handleDelete}
            onClose={onClose}
            isPending={isPending}
        />
    );
};

export default function OwnerOptionsMenu({ id }) {
    const actions = [
        {
            label: "View owner details",
            href: `/admin/owner-details/${id}`,
            icon: <VscNote className="text-gray-400" />,
        },
        {
            label: "Issue invoice",
            href: `/admin/issue-invoice/${id}`,
            icon: <TbInvoice className="text-gray-400" />,
        },
        {
            label: "Delete owner",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            modal: <DeleteOwnerModal id={id} />,
        },
    ];

    return (
        <TableItemOptionsMenu actions={actions} menuId={`owner-menu-${id}`} />
    );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { VscNote } from "react-icons/vsc";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineReceipt } from "react-icons/md";
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import toast from "react-hot-toast";

const DeleteBookingModal = ({ bookingId, onClose }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                // Booking deletion endpoint stub
                const res = { success: false, message: "Booking deletion is restricted or not yet attached." };
                if (res?.success) {
                    toast.success(res?.message || "Booking deleted successfully");
                    router.refresh();
                    onClose?.();
                } else {
                    toast.error(res?.message || "Failed to delete booking");
                }
            } catch (err) {
                toast.error(err.message || "An error occurred");
            }
        });
    };

    return (
        <ConfirmDeleteModal
            heading="Delete this booking?"
            description="Are you sure you want to delete this booking record? This action cannot be undone."
            confirmLabel="Delete booking"
            cancelLabel="Cancel"
            variant="danger"
            onConfirm={handleDelete}
            onClose={onClose}
            isPending={isPending}
        />
    );
};

export default function BookingOptionsMenu({ id }) {
    const tableOptions = [
        {
            label: "View booking",
            href: `/admin/booking-details/${id}`,
            icon: <VscNote className="text-gray-400" />
        },
        {
            label: "Edit booking",
            href: `/admin/edit-booking/${id}`,
            icon: <CiEdit className="text-gray-400" />
        },
        {
            label: "Issue invoice",
            href: `/dashboard/admin/bookings/issue-invoice/${id}`,
            icon: <MdOutlineReceipt className="text-gray-400" />
        },
        {
            label: "Delete booking",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            modal: <DeleteBookingModal bookingId={id} />
        },
    ];

    return (
        <TableItemOptionsMenu actions={tableOptions} menuId={`booking-menu-${id}`} />
    );
}

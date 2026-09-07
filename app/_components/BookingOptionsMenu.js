"use client"
import { VscNote } from "react-icons/vsc"
import { CiEdit } from "react-icons/ci"
import { RiDeleteBin6Line } from "react-icons/ri"
import { MdOutlineReceipt } from "react-icons/md"
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SpinnerMini from "./SpinnerMini";

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
            modal: <DeleteWindow bookingId={id} />
        },
    ];

    return (
        <TableItemOptionsMenu actions={tableOptions} menuId={`booking-menu-${id}`} />
    );
}

const DeleteWindow = ({ onClose, bookingId }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                // UI stub since endpoint logic wasn't explicitly provided
                // const res = await deleteBooking(bookingId);
                const res = { success: false, message: "Endpoint not yet attached." };
                
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
        <div className="flex flex-col">
            <p className="px-6 pt-6 font-mono text-error font-bold ">Are you sure you want to delete this booking?</p>
            <div className="flex items-center justify-between p-6">
                <button 
                    disabled={isPending} 
                    onClick={handleDelete} 
                    className="px-4 py-2 bg-red-100 flex items-center gap-2 text-primary rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                    {isPending ? <SpinnerMini /> : "Yes, delete"}
                </button>
                <button 
                    disabled={isPending} 
                    onClick={onClose} 
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                    No, undo
                </button>
            </div>
        </div>
    )
}

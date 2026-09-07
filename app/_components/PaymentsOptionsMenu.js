"use client"
import { VscNote } from "react-icons/vsc"
import { RiDeleteBin6Line } from "react-icons/ri"
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SpinnerMini from "./SpinnerMini";

export default function PaymentsOptionsMenu({ id }) {
    const tableOptions = [
        {
            label: "View details",
            href: `/dashboard/admin/payments/${id}`,
            icon: <VscNote className="text-gray-400" />
        },
        {
            label: "Delete record",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            modal: <DeleteWindow recordId={id} />
        },
    ];

    return (
        <TableItemOptionsMenu actions={tableOptions} menuId={`payment-menu-${id}`} />
    );
}

const DeleteWindow = ({ onClose, recordId }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                // UI stub since endpoint logic wasn't explicitly provided
                const res = { success: false, message: "Endpoint not yet attached." };
                
                if (res?.success) {
                    toast.success(res?.message || "Payment deleted successfully");
                    router.refresh(); 
                    onClose?.(); 
                } else {
                    toast.error(res?.message || "Failed to delete payment");
                }
            } catch (err) {
                toast.error(err.message || "An error occurred");
            }
        });
    };

    return (
        <div className="flex flex-col">
            <p className="px-6 pt-6 font-mono text-error font-bold ">Are you sure you want to delete this payment record?</p>
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

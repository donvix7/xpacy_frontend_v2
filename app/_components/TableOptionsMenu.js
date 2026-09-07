"use client"
import { IoDocumentTextOutline } from "react-icons/io5"
import { CiEdit } from "react-icons/ci"
import { RiDeleteBin6Line } from "react-icons/ri"
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { useTransition } from "react";
import { deleteProperty } from "../_lib/action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SpinnerMini from "./SpinnerMini";

export default function TableOptionsMenu({ id }) {
    const tableOptions = [
        {
            label: "View property details",
            href: `/admin/property-details/${id}`,
            icon: <IoDocumentTextOutline className="text-gray-400" />
        },
        {
            label: "Edit property",
            href: `/admin/edit-property/${id}`,
            icon: <CiEdit className="text-gray-400" />
        },
        {
            label: "Delete property",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            modal: <DeleteWindow propertyId={id} />
            
        },
    ];

    return (
        <TableItemOptionsMenu actions={tableOptions} menuId={`table-menu-${id}`} />
    );
}


const DeleteWindow = ({ onClose, propertyId }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const res = await deleteProperty(propertyId);
                if (res?.success) {
                    toast.success(res?.message || "Property deleted successfully");
                    router.refresh(); // Refresh the page to show latest data
                    onClose?.(); // Close the modal
                } else {
                    toast.error(res?.message || "Failed to delete property");
                }
            } catch (err) {
                toast.error(err.message || "An error occurred");
            }
        });
    };

    return (
        <div className="flex flex-col">
            <p className="px-6 pt-6 font-mono text-error font-bold ">Are you sure you want to delete this property?</p>
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
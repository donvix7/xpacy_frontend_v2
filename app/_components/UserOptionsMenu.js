"use client";
import { VscNote } from "react-icons/vsc";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { RiDeleteBin6Line } from "react-icons/ri";
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { TbInvoice } from "react-icons/tb";
import { User, Wrench } from "lucide-react";

export default function UserOptionsMenu({ id, role }) {
    const isOwner = ['property-owner', 'admin', 'super-admin', 'SUPER_ADMIN'].includes(role);
    const isProvider = role === 'provider' || role === 'service-provider';
    const isTenant = role === 'tenant' || role === 'TENANT';

    const actions = [
      
        {
            label: "View details",
            href: `/dashboard/admin/users/${id}`,
            icon: <User className="text-gray-400" />,
        },

        
        {
            label: "Remove user",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            modal:
                <ConfirmDeleteModal
                    title={`Are you sure you want to remove this user?`}
                    onConfirm={() => console.log("remove user", id)}
                />
            ,
        }
    ];

    return (
        <TableItemOptionsMenu actions={actions} menuId={`user-menu-${id}`} />
    );
}
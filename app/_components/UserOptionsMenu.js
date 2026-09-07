"use client";
import { VscNote } from "react-icons/vsc";
import  ConfirmDeleteModal  from "./ConfirmDeleteModal";
import { RiDeleteBin6Line } from "react-icons/ri";
import TableItemOptionsMenu from "./TableItemOptionsMenu";
import { TbInvoice } from "react-icons/tb";
import { User, Wrench } from "lucide-react";

export default function UserOptionsMenu({ id, role }){
    const isOwner = ['property-owner', 'admin', 'super-admin'].includes(role);
    const isProvider = role === 'provider' || role === 'service-provider';

    const actions = [
        {
            label: "View details",
            href: isProvider 
                ? `/admin/provider-details/${id}` 
                : (isOwner ? `/admin/owner-details/${id}` : `/admin/users/${id}`),
            icon: <VscNote className="text-gray-400" />,
        },

        // Only show invoice option for owners for now, unless tenants also get invoices here
        ...((isOwner || isProvider) ? [
            {
            label: "Issue invoice",
            href: `/admin/issue-invoice/${id}`,
            icon: <TbInvoice className="text-gray-400" />,
        },
        {
            label: "Assign service request",
            href: `/admin/assign-service/${id}`,
            icon: <Wrench className="text-gray-400" />,
        }
      
    ] : []),
        {
            label: "Delete Provider",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            modal: 
                <ConfirmDeleteModal
                title={`Are you sure you want to delete this provider?`}
                onConfirm={() => console.log("delete", id)}
                />
            ,
        },
    ]

    return (
        <TableItemOptionsMenu actions={actions} menuId={`user-menu-${id}`}/>
    )
}

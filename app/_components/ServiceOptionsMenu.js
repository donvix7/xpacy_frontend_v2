"use client";
import { VscNote } from "react-icons/vsc";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineAssignmentInd, MdOutlineReceipt } from "react-icons/md";
import TableItemOptionsMenu from "./TableItemOptionsMenu";

export default function ServiceOptionsMenu({ id, hasProvider }) {
    const actions = [
        {
            label: "View details",
            href: `/admin/service-details/${id}`,
            icon: <VscNote className="text-gray-400" />,
        },
        {
            label: "Issue invoice",
            href: `/dashboard/admin/services/issue-invoice/${id}`,
            icon: <MdOutlineReceipt className="text-gray-400" />,
        },
        {
            label: hasProvider ? "Reassign provider" : "Assign provider",
            href: `/admin/assign-provider/${id}`,
            icon: <MdOutlineAssignmentInd className="text-gray-400" />,
        },
        {
            label: "Delete service request",
            icon: <RiDeleteBin6Line className="text-gray-400" />,
            onClick: () => console.log("delete service", id),
        },
    ];

    return (
        <TableItemOptionsMenu actions={actions} menuId={`service-menu-${id}`} />
    );
}

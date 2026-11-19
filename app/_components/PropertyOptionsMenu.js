"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaEye, FaTools, FaCalendar, FaEdit } from "react-icons/fa";
import OptionsMenu from "./OptionsMenu";

export default function PropertyOptionsMenu({ id }) {
    const pathname = usePathname() || "";

    // Determine role-isolated base paths dynamically
    let roleBasePath = "/dashboard/property-owner/properties";
    let maintenanceHref = `/dashboard/property-owner/maintenance`;
    let bookingsHref = `/dashboard/property-owner/bookings`;

    if (pathname.startsWith("/dashboard/admin")) {
        roleBasePath = "/dashboard/admin/properties";
        maintenanceHref = `/dashboard/admin/maintenance`;
        bookingsHref = `/dashboard/admin/bookings`;
    } else if (pathname.startsWith("/dashboard/facility-manager")) {
        roleBasePath = "/dashboard/facility-manager/properties";
        maintenanceHref = `/dashboard/facility-manager/maintenance`;
        bookingsHref = `/dashboard/facility-manager/bookings`;
    } else if (pathname.startsWith("/dashboard/property-manager")) {
        roleBasePath = "/dashboard/property-manager/properties";
        maintenanceHref = `/dashboard/property-manager/maintenance`;
        bookingsHref = `/dashboard/property-manager/bookings`;
    } else if (pathname.startsWith("/dashboard/user")) {
        roleBasePath = "/dashboard/user/my-properties";
        maintenanceHref = `/dashboard/user/maintenance`;
        bookingsHref = `/dashboard/user/bookings`;
    }

    const actions = [
        {
            label: "View property details",
            href: `${roleBasePath}/${id}`,
            icon: <FaEye className="text-mute" />,
        },
        {
            label: "Maintenance requests",
            href: maintenanceHref,
            icon: <FaTools className="text-mute" />,
        },
        {
            label: "Bookings",
            href: bookingsHref,
            icon: <FaCalendar className="text-mute" />,
        },
        {
            label: "Edit property",
            href: `/admin/edit-property/${id}`,
            icon: <FaEdit className="text-mute" />,
        },
    ];

    return (
        <OptionsMenu id={`property-menu-${id}`}>
            {actions.map((action, i) => (
                <Link key={i} href={action.href} className="w-full text-left">
                    <div
                        className={`flex items-center px-4 py-3 gap-3 hover:bg-soft transition-colors ${
                            i !== actions.length - 1 ? "border-b border-line" : ""
                        }`}
                    >
                        {action.icon && <span className="text-lg">{action.icon}</span>}
                        <span className="text-[13px] font-medium text-ink">
                            {action.label}
                        </span>
                    </div>
                </Link>
            ))}
        </OptionsMenu>
    );
}

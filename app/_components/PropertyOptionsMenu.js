import Link from "next/link";
import { FaEye, FaTools, FaChartLine } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import OptionsMenu from "./OptionsMenu";
import { FaCalendar } from "react-icons/fa6";

export default function PropertyOptionsMenu({ id }) {
    const actions = [
        {
            label: "View property details",
            href: `/dashboard/user/my-properties/${id}`,
            icon: <FaEye className="text-gray-400" />,
        },
        {
            label: "Maintenance requests",
            href: `/dashboard/admin/maintenance/${id}/requests`, 
            icon: <FaTools className="text-gray-400" />,
        },
        {
            label: "Bookings",
            href: `/dashboard/admin/bookings/${id}`,
            icon: <FaCalendar className="text-gray-400" />,
        },
        {
            label: "Property valuation",
            href: `/dashboard/user/properties/${id}/valuation`,
            icon: <FaChartLine className="text-gray-400" />,
        },
    ];

    return (
        <OptionsMenu id={`property-menu-${id}`}>
            {actions.map((action, i) => (
                <Link key={i} href={action.href} className="w-full text-left">
                     <div className={`flex items-center px-4 py-4 gap-4 hover:bg-gray-50 transition-colors ${i !== actions.length - 1 ? "border-b border-gray-100" : ""}`}>
                        {action.icon && <span className="text-xl">{action.icon}</span>}
                        <span className="text-sm font-medium text-gray-600">
                            {action.label}
                        </span>
                    </div>
                </Link>
            ))}
        </OptionsMenu>
    );
}

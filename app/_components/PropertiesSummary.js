import { Building, Building2 } from "lucide-react";
import { FaHome, FaCheckCircle, FaTools, FaTag, FaHandshake } from "react-icons/fa";
import SummaryItemCard from "./SummaryItemCard";

export default function PropertiesSummary({ properties, totalProperties, showHeading = true }) {
    // Calculate counts based on passed properties (which are already filtered if needed)
    // Calculate counts based on passed properties
    const counts = {
        shortlet: properties.filter(p => p.property_status?.toLowerCase() === 'shortlet').length,
        rented: properties.filter(p => p.property_status?.toLowerCase() === 'rent').length,
        featured: properties.filter(p => p.featured || p.isFeatured || p.is_featured).length,
        available: properties.filter(p => ['active', 'available', 'vacant'].includes(p.availability_status?.toLowerCase())).length,
    };

    const summaryItems = [
        {
            title: "Shortlet",
            count: counts.shortlet,
            icon: <FaHome className="text-blue-500" size={20} />,
            color: "bg-blue-50 border-blue-100",
            bgColor:"bg-blue-50"
        },
        {
            title: "Rented",
            count: counts.rented,
            icon: <FaHandshake className="text-green-500" size={20} />,
            color: "bg-green-50 border-green-100",
            bgColor:"bg-green-50"
        },
        {
            title: "Featured",
            count: counts.featured,
            icon: <FaTag className="text-orange-500" size={20} />,
            color: "bg-orange-50 border-orange-100",
            bgColor:"bg-orange-50"
        },
        {
            title: "Available",
            count: counts.available,
            icon: <FaCheckCircle className="text-purple-500" size={20} />,
            color: "bg-purple-50 border-purple-100",
            bgColor:"bg-purple-50"
        }
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-mute">Portfolio</span>
                <p className="text-[42px] font-semibold leading-none tracking-[-1.5px] text-ink tabular-nums sm:text-[52px]">
                    {totalProperties || properties.length}
                </p>
                <span className="text-[13.5px] text-mute">Total properties in your portfolio</span>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:gap-4">
                {summaryItems.map((item, index) => (
                    <SummaryItemCard key={index} label={item.title} value={item.count} icon={item.icon} iconBackground={item.bgColor} />
                ))}
            </div>
        </div>
    );
}

import { Building, Building2 } from "lucide-react";
import { BiBuildings } from "react-icons/bi";
import { FaHome, FaCheckCircle, FaTools, FaTag, FaHandshake } from "react-icons/fa";

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
        <div className="flex flex-col gap-4  bg-white">
         

            <div className="flex flex-col gap-4">
                {/* Main Hero Card */}
                <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white min-w-[250px] justify-center">
                    <div className="relative z-20 flex flex-col lg:items-start items-center lg:w-max">
                        <div className="flex gap-3 items-center">
                            <span className="w-12 h-12 text-primary bg-primary-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-sm">
                                <BiBuildings />
                            </span>
                            <span className="font-mono text-primary-900 font-bold uppercase tracking-wide text-sm">Properties Owned</span>
                        </div>
                        <p className="text-center lg:text-left font-bold text-4xl font-mono mt-4 lg:ml-[60px] text-gray-800">{totalProperties || properties.length}</p>
                    </div>

                    {/* Decorative Background Circles */}
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[10%] -right-[70%] lg:-top-4 -top-10 bg-primary-700 z-10 opacity-90 transition-transform duration-700 hover:scale-105"></div>
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[2%] -right-[65%] top-6 bg-[#73A0BE] z-0 opacity-70 transition-transform duration-700 hover:-translate-x-2"></div>
                </div>

                {/* Grid Items */}
               <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl border border-primary-200  p-6 duration-300 flex justify-between ">
                    <div className="flex flex-col gap-2">
                        <p className="text-gray-600 text-sm capitalize">{item.title}</p>
                        <p className="text-2xl font-bold mt-1">{item.count.toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                        {item.icon}
                    </div>
                </div>
            ))}
        </div>
            </div>
        </div>
    );
}

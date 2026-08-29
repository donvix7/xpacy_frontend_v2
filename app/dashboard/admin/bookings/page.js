import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminBookingList from "@/app/_components/AdminBookingList";
import SummaryCards from "@/app/_components/SummaryCards";
import Link from "next/link";
import { Plus, Timer } from "lucide-react";
import { FaCalendarCheck, FaPersonDigging, FaRegCalendarCheck } from "react-icons/fa6";
import { FaCheckCircle, FaHome } from "react-icons/fa";
import { HiOutlinePending } from "react-icons/hi";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const bookings = await getAdminBooking(token) || [];

    console.log("bookings data from admin",bookings);
    

      const counts = {
        totalBookings: bookings.length,
        rented: bookings.filter(p => p.status?.toLowerCase() === 'rented').length,
        pending: bookings.filter(p => p.status === 'pending').length,
        available: bookings.filter(p => p.status === 'available').length,
    };
    console.log
    
    const summaryItems = [
        {
            title: "Total ",
            count: counts.totalBookings,
            icon: <FaRegCalendarCheck className="text-blue-500" size={20} />,
            color: "bg-blue-50 border-blue-100",
            bgColor:"bg-blue-50"
        },
        {
            title: "Rented",
            count: counts.rented,
            icon: <FaHome className="text-green-500" size={20} />,
            color: "bg-green-50 border-green-100",
            bgColor:"bg-green-50"
        },
        {
            title: "Available",
            count: counts.available,
            icon: <FaCheckCircle className="text-purple-500" size={20} />,
            color: "bg-purple-50 border-purple-100",
            bgColor:"bg-purple-50"
        },
        {
            title: "Pending",
            count: counts.pending,
            icon: <Timer className="text-orange-500" size={20} />,
            color: "bg-orange-50 border-orange-100",
            bgColor:"bg-orange-50"
        }
    ]

    return (
        <div className=" space-y-6">
             <div className=" space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Bookings</h1>
                <Link 
                    href="/dashboard/admin/bookings/create" 
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create New Booking</span>
                </Link>
            </div>            
            <DashboardGridItem title={""}>

             <div className="flex flex-col gap-4  bg-white">
                <div className="flex flex-col gap-4">
                    {/* Main Hero Card */}
                    <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white min-w-[250px] justify-center">
                        <div className="relative z-20 flex flex-col lg:items-start items-center lg:w-max">
                            <div className="flex gap-3 items-center">
                                <span className="w-12 h-12 text-primary bg-primary-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-sm">
                                    <FaCalendarCheck />
                                </span>
                                <span className="font-mono text-primary-900 font-bold uppercase tracking-wide text-sm">Bookings</span>
                            </div>
                            <p className="text-center lg:text-left font-bold text-4xl font-mono mt-4 lg:ml-[60px] text-gray-800">{counts.totalBookings}</p>
                        </div>
    
                        {/* Decorative Background Circles */}
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[10%] -right-[70%] lg:-top-4 -top-10 bg-primary-700 z-10 opacity-90 transition-transform duration-700 hover:scale-105"></div>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[2%] -right-[65%] top-6 bg-[#73A0BE] z-0 opacity-70 transition-transform duration-700 hover:-translate-x-2"></div>
                    </div>
                  
                    {/* Grid Items */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
                    {summaryItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl border border-primary-200 p-4 md:p-6 duration-300 flex items-center justify-between transition-shadow min-w-[160px]">
                            <div className="flex flex-col gap-1 md:gap-2 min-w-0 flex-1">
                                <p className="text-gray-600 text-xs sm:text-sm capitalize truncate">{item.title}</p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5">{item.count.toLocaleString()}</p>
                        </div>
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl flex-shrink-0 ml-2 sm:ml-3 ${item.color} ${item.bgColor}`}>
                            {item.icon}
                        </div>
                    </div>
                    ))}
                    </div>
                </div>
            </div>
            </DashboardGridItem>
        </div>
        
            <DashboardGridItem title={"All Bookings"}>
                    <AdminBookingList token={token} bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}

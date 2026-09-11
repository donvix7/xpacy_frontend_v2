import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import AdminBookingList from "@/app/_components/AdminBookingList";
import SummaryCards from "@/app/_components/SummaryCards";
import Link from "next/link";
import { Plus, Timer } from "lucide-react";
import { FaPersonDigging, FaRegCalendarCheck } from "react-icons/fa6";
import { FaCheckCircle, FaHome } from "react-icons/fa";

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
            label: "Total",
            value: counts.totalBookings,
            icon: <FaRegCalendarCheck className="text-blue-500" size={20} />,
            color: "bg-blue-50"
        },
        {
            label: "Rented",
            value: counts.rented,
            icon: <FaHome className="text-green-500" size={20} />,
            color: "bg-green-50"
        },
        {
            label: "Available",
            value: counts.available,
            icon: <FaCheckCircle className="text-purple-500" size={20} />,
            color: "bg-purple-50"
        },
        {
            label: "Pending",
            value: counts.pending,
            icon: <Timer className="text-orange-500" size={20} />,
            color: "bg-orange-50"
        }
    ]

    return (
        <div className=" space-y-6 p-2">
             <div className=" space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Bookings</h1>
                <Link 
                    href="/dashboard/admin/bookings/create" 
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create New Booking</span>
                </Link>
            </div>
            <SummaryCards cards={summaryItems} title="Bookings Summary" />
        </div>
        
            <DashboardGridItem title={"All Bookings"}>
                    <AdminBookingList token={token} bookings={bookings} />
            </DashboardGridItem>
        </div>
    );
}

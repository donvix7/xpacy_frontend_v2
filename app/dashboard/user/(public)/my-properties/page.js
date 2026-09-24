import BookingsTableList from "@/app/_components/BookingsTableList";
import { cookies } from "next/headers";
import { getBookingList, getManagedProperties, getMyProperties, getMyRentedProperties, getRentedProperties } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertiesSummary from "@/app/_components/PropertiesSummary";
import SummaryCards from "@/app/_components/SummaryCards";
import { FaHandshake, FaTag } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";

export default async function Page(){


        const [
            ownedProperties,
            managedProperties,
            rentedProperties,
        ] = await Promise.all([
            getMyProperties(),
            getManagedProperties(),
            getMyRentedProperties(),
        ]);
   
     const counts = {
            owned: ownedProperties.length,
            managed: managedProperties.length,
            rented: rentedProperties.length,
        };
    
        const summaryCards = [
            {
                title: "owned",
                count: counts.owned,
                icon: <FaHome className="text-blue-500" size={20} />,
                color: "bg-blue-50 border-blue-100",
                bgColor:"bg-blue-50"
            },
            {
                title: "managed",
                count: counts.managed,
                icon: <FaHandshake className="text-green-500" size={20} />,
                color: "bg-green-50 border-green-100",
                bgColor:"bg-green-50"
            },
            {
                title: "rented",
                count: counts.rented,
                icon: <FaTag className="text-orange-500" size={20} />,
                color: "bg-orange-50 border-orange-100",
                bgColor:"bg-orange-50"
            },
        ];
    
    return (
        <div className="p-2 space-y-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">My Properties</h1>
            <DashboardGridItem title="Properties Summary">
            <SummaryCards cards={summaryCards} />


            </DashboardGridItem>            
            <DashboardGridItem title="My Properties List">
                <BookingsTableList bookings={ownedProperties}/>
            </DashboardGridItem>
        </div>
    )
}
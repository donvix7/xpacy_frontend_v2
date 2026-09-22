import BookingsTableList from "@/app/_components/BookingsTableList";
import { cookies } from "next/headers";
import { getBookingList, getManagedProperties, getMyProperties, getRentedProperties } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import PropertiesSummary from "@/app/_components/PropertiesSummary";

export default async function Page(){
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const properties = await getMyProperties();
    const managedProperties = await getManagedProperties();
    const rentedProperties = await getRentedProperties();
    console.log(properties)
    console.log(managedProperties)
    console.log(rentedProperties)
    return (
        <div className="p-2 space-y-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">My Properties</h1>
            <DashboardGridItem title="Properties Summary">
            <PropertiesSummary properties={properties || []} totalProperties={properties?.length || 0} />
            </DashboardGridItem>            
            <DashboardGridItem title="My Properties List">
                <BookingsTableList bookings={properties}/>
            </DashboardGridItem>
        </div>
    )
}
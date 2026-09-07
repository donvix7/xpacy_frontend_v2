import BookingsTableList from "@/app/_components/BookingsTableList";
import { cookies } from "next/headers";
import { getBookingList } from "@/app/_lib/data-services";

export default async function Page(){
        const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const bookings = await getBookingList(token);
    return (
        <div className="p-6">
            <BookingsTableList bookings={bookings}/>
        </div>
    )
}
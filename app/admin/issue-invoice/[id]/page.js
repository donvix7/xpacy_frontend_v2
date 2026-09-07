import IssueInvoice from "@/app/_components/IssueInvoice";
import InvoiceNav from "@/app/_components/InvoiceNav";
import { getAdminBooking, getAllUsers, getAdminServices, getAdminServiceById, getAdminBookingById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
        const {id} = await params

        console.log("id:", id)
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
     
        const [users, booking, service] = await Promise.all([
            getAllUsers(token),
            getAdminBookingById(token, id),
            getAdminServiceById(token, id)
        ]);
    
    return (
        <div className="flex flex-col lg:px-[7%] gap-8 lg:pb-28 px-6 pb-12 w-full h-full min-h-screen bg-gray-50 border-x border-gray-100">
            <InvoiceNav />
            <IssueInvoice 
                token={token} 
                users={users?.data || users || []} 
                booking={booking}
                service={service}
            />
        </div>
    );
}

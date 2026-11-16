import IssueInvoice from "@/app/_components/IssueInvoice";
import InvoiceNav from "@/app/_components/InvoiceNav";
import { getAdminBooking, getAllUsers, getAdminServices, getAdminServiceById, getAdminBookingById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page({ params }) {
        const {id} = await params

        const cookieStore = await cookies();
        const token = cookieStore.get("token");
     
        const results = await Promise.allSettled([
            getAllUsers(token),
            getAdminBookingById(token, id),
        ]);
        const dataErrorMessages = getSettledErrorMessages(results);

        const users = results[0].status === "fulfilled" ? results[0].value : [];
        const booking = results[1].status === "fulfilled" ? results[1].value : null;
    return (
        <div className="flex flex-col lg:px-[7%] gap-8 lg:pb-28 px-6 pb-12 w-full h-full min-h-screen bg-gray-50 border-x border-gray-100">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <InvoiceNav />
            <IssueInvoice 
                token={token} 
                users={users?.data || users || []} 
                booking={booking}
            />
        </div>
    );
}

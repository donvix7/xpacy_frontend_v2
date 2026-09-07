import InvoiceContainer from "@/app/_components/InvoiceContainer";
import InvoiceNav from "@/app/_components/InvoiceNav";
import { getInvoice, getAllUsers } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const pageParam = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const [invoice, users] = await Promise.all([
        getInvoice(token, pageParam.invoiceId),
        getAllUsers(token)
    ]);

    return (
        <div className="flex flex-col lg:px-[7%] gap-8 lg:pb-28 px-6 pb-12">
            <InvoiceNav />
            <InvoiceContainer invoice={invoice} token={token} users={users} />
        </div>
    )
}
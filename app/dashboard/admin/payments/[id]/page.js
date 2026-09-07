import InvoiceContainer from "@/app/_components/InvoiceContainer";
import InvoiceNav from "@/app/_components/InvoiceNav";
import { getAdminInvoice, getAllUsers } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const pageParam = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    // Fetch both the particular invoice and the user map using Promise.all for optimization
    const [invoice, users] = await Promise.all([
        getAdminInvoice(token, pageParam.id),
        getAllUsers(token)
    ]);

    return (
        <div className="flex flex-col lg:px-[7%] gap-8 lg:pb-28 px-6 pb-12 w-full h-full min-h-screen bg-gray-50 border-x border-gray-100">
            <InvoiceNav />
            {invoice ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <InvoiceContainer invoice={invoice} token={token} users={users} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500 font-mono h-[60vh] bg-white border border-gray-100 rounded-lg">
                    <p className="text-xl font-bold mb-2">Invoice Not Found</p>
                    <p className="text-sm">Could not load invoice data. It might be missing or unavailable.</p>
                </div>
            )}
        </div>
    );
}

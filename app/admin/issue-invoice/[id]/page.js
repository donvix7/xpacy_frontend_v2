import IssueInvoice from "@/app/_components/IssueInvoice";
import AdminHeader from "@/app/_components/AdminHeader";
import { getAllUsers, getAdminServiceById, getAdminBookingById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const [users, booking, service] = await Promise.all([
        getAllUsers(token),
        getAdminBookingById(token, id),
        getAdminServiceById(token, id),
    ]);

    return (
        <div className="flex flex-col w-full min-h-screen">
            <AdminHeader title="Issue Invoice" backHref="/dashboard/admin/invoices" />
            <main className="flex-1 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6">
                <IssueInvoice
                    token={token}
                    users={users?.data || users || []}
                    booking={booking}
                    service={service}
                />
            </main>
        </div>
    );
}

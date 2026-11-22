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
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Issue Invoice" backHref="/dashboard/admin/invoices" />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Issue Invoice
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Generate and send an invoice for this booking or service request.
                    </p>
                </header>
                <div className="p-6 sm:p-8 rounded-2xl border border-line bg-card shadow-sm">
                    <IssueInvoice
                        token={token}
                        users={users?.data || users || []}
                        booking={booking}
                        service={service}
                    />
                </div>
            </main>
        </div>
    );
}

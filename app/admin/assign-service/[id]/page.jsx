import React from 'react';
import { cookies } from "next/headers";
import { getAdminServices } from "@/app/_lib/data-services";
import AdminHeader from "@/app/_components/AdminHeader";
import AssignServiceTable from "@/app/_components/AssignServiceTable";

export default async function AssignServiceRequestsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const services = await getAdminServices(token);

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <AdminHeader title="Assign Service Requests" backHref="/dashboard/admin/services" />

            <main className="flex-1 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6 flex flex-col gap-8">
                <header className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Assign Service Requests</h1>
                    <p className="text-sm text-mute">Select and assign vetted service providers to active client requests.</p>
                </header>

                <div className="rounded-2xl border border-line bg-card p-4 sm:p-6 shadow-sm">
                    <AssignServiceTable services={services} />
                </div>
            </main>
        </div>
    );
}

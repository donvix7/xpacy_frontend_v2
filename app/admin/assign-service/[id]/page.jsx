import React from 'react';
import { cookies } from "next/headers";
import { getAdminServices } from "../../../_lib/data-services";
import BackBtn from "../../../_components/BackBtn";
import Logo from "../../../_components/Logo";
import AssignServiceTable from "../../../_components/AssignServiceTable";

export default async function AssignServiceRequestsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const services = await getAdminServices(token);

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-white">
            {/* Header Navigation */}
            <nav className="flex items-center px-[7%] py-6 bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="w-1/3">
                    <BackBtn />
                </div>
                <div className="w-1/3 flex justify-center">
                    <Logo />
                </div>
                <div className="w-1/3 flex justify-end">
                    {/* Placeholder for trailing items if any */}
                </div>
            </nav>

            {/* Content Area */}
            <main className="flex-1 max-w-[70vw] mx-auto w-full py-12 px-6 flex flex-col gap-10">
                <header className="flex flex-col items-center gap-4">
                    <h1 className="text-[2.5rem] font-bold text-primary-900 font-mono tracking-tight">Assign Service Requests</h1>
                </header>

                <AssignServiceTable services={services} />
            </main>
        </div>
    );
}
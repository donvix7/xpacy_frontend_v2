"use client";
import { useState } from "react";
import AdminServiceList from "./AdminServiceList";
import AdminServiceProvidersList from "./AdminServiceProvidersList";

export default function AdminServicesTabs({ services, serviceProviders }) {
    const [activeTab, setActiveTab] = useState("requests");

    return (
        <div className="flex min-w-0 flex-col items-center gap-6 sm:gap-10">
            <header className="flex w-full flex-col items-center gap-4 sm:gap-6">
                <h1 className="text-center text-2xl font-bold tracking-tight text-primary-900 sm:text-[2.5rem]">Manage Service Requests</h1>
                
                {/* Custom Tab Switcher */}
                <div className="grid w-full max-w-xl grid-cols-2 rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`rounded-md px-2 py-2 text-xs font-bold transition-all cursor-pointer sm:px-6 sm:text-sm ${
                            activeTab === "requests" 
                            ? "bg-[#D2B48C] text-gray-900" 
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        Service Requests List
                    </button>
                    <button
                        onClick={() => setActiveTab("providers")}
                        className={`rounded-md px-2 py-2 text-xs font-bold transition-all cursor-pointer sm:px-6 sm:text-sm ${
                            activeTab === "providers" 
                            ? "bg-[#D2B48C] text-gray-900" 
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        Service Providers List
                    </button>
                </div>
            </header>

            <div className="w-full">
                {activeTab === "requests" ? (
                    <AdminServiceList services={services} />
                ) : (
                    <AdminServiceProvidersList providers={serviceProviders} />
                )}
            </div>
        </div>
    );
}

"use client";
import { useState } from "react";
import AdminServiceList from "./AdminServiceList";
import AdminServiceProvidersList from "./AdminServiceProvidersList";

export default function AdminServicesTabs({ services, serviceProviders }) {
    const [activeTab, setActiveTab] = useState("requests");

    return (
        <div className="flex flex-col gap-10 items-center">
            <header className="flex flex-col items-center gap-6">
                <h1 className="text-[2.5rem] font-bold text-primary-900 font-mono tracking-tight">Manage Service Requests</h1>
                
                {/* Custom Tab Switcher */}
                <div className="flex bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`py-2 px-6 rounded-md text-sm font-bold font-mono transition-all cursor-pointer ${
                            activeTab === "requests" 
                            ? "bg-[#D2B48C] text-gray-900" 
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        Service Requests List
                    </button>
                    <button
                        onClick={() => setActiveTab("providers")}
                        className={`py-2 px-6 rounded-md text-sm font-bold font-mono transition-all cursor-pointer ${
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

"use client";

import React, { useEffect, useState } from 'react';
import AdminHeader from "../../../_components/AdminHeader";
import { useParams } from "next/navigation";

export default function EditProviderPage() {
    const { id } = useParams();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);

    // In a real app, you'd fetch this from a server action or API route
    // For now, I'll assume the provider data is passed or fetched client-side
    useEffect(() => {
        // Mock fetch or actual fetch logic
        setLoading(false);
    }, [id]);

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            {/* Header Navigation */}
            <AdminHeader title="Edit Provider" backHref="/dashboard/admin/services" />

            {/* Content Area */}
            <main className="flex-1 max-w-3xl mx-auto w-full py-8 px-4 sm:px-6 flex flex-col gap-8">
                <header className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">Edit Provider Details</h1>
                </header>

                <form className="flex flex-col gap-8 mt-4 pb-20">
                    <FieldGroup label="Provider's Name">
                        <input 
                            type="text"
                            placeholder="Provider's Name"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Contact's First Name">
                            <input 
                                type="text"
                                placeholder="First Name"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="Contact's Last Name">
                            <input 
                                type="text"
                                placeholder="Last Name"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Email">
                        <input 
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <FieldGroup label="Phone number">
                        <input 
                            type="tel"
                            placeholder="Phone number"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <FieldGroup label="Address">
                        <input 
                            type="text"
                            placeholder="Address"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="City/Town">
                            <input 
                                type="text"
                                placeholder="City/Town"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="State">
                            <input 
                                type="text"
                                placeholder="State"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Service Type">
                            <input 
                                type="text"
                                placeholder="Service Type"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="Building Type">
                            <input 
                                type="text"
                                placeholder="Building Type"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Available days">
                            <input 
                                type="text"
                                placeholder="Available days"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="Available time">
                            <input 
                                type="text"
                                placeholder="Available time"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <div className="flex justify-center mt-10">
                        <button 
                            type="submit"
                            className="px-16 py-4 bg-[#263238] text-white rounded-lg font-bold font-mono hover:bg-[#1a2327] transition-all shadow-lg text-center"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

function FieldGroup({ label, children }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500 font-mono">{label}</label>
            {children}
        </div>
    );
}

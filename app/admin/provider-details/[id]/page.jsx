"use client";

import React, { useState, useEffect } from 'react';
import BackBtn from "../../../_components/BackBtn";
import Logo from "../../../_components/Logo";
import { useParams } from "next/navigation";

export default function ProviderDetailsPage() {
    const { id } = useParams();
    const [provider, setProvider] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mock initial data fetch (in real app, this would be an API call)
    useEffect(() => {
        // Simulating data fetch
        const mockProvider = {
            company_name: "Bright Plumbing",
            firstname: "Bright",
            lastname: "Nelson",
            email: "bplumbing@gmail.com",
            phone: "+234 08000000000",
            address: "16, Awolowo Way, Ikoyi, Lagos",
            city: "Ikoyi",
            state: "Lagos",
            service_type: "Plumbing",
            building_type: "Residential, Commercial",
            available_days: "Mondays-Fridays",
            available_time: "8am - 6pm"
        };
        setProvider(mockProvider);
        setLoading(false);
    }, [id]);

    const handleToggleEdit = () => {
        if (isEditing) {
            // Here you would normally trigger a save API call
            console.log("Saving changes...", provider);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (field, value) => {
        setProvider(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-20 text-center font-mono text-gray-400">Loading provider details...</div>;
    if (!provider) return <div className="p-20 text-center font-mono text-gray-500">Provider not found.</div>;

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
                <div className="w-1/3 flex justify-end"></div>
            </nav>

            {/* Content Area */}
            <main className="flex-1 max-w-[800px] mx-auto w-full py-12 px-6 flex flex-col gap-10">
                <header className="flex flex-col items-center gap-4">
                    <h1 className="text-[2.5rem] font-bold text-primary-900 font-mono tracking-tight">
                        {isEditing ? "Edit Provider's Details" : "Service Provider Details"}
                    </h1>
                </header>

                <div className="flex flex-col gap-8 mt-4 pb-20">
                    {/* Provider's Name */}
                    <FieldGroup label="Provider's Name">
                        <EditableField 
                            isEditing={isEditing} 
                            value={provider.company_name} 
                            onChange={(val) => handleChange("company_name", val)}
                            placeholder="Provider's Name"
                        />
                    </FieldGroup>

                    {/* Contact's Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Contact's First Name">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.firstname} 
                                onChange={(val) => handleChange("firstname", val)}
                                placeholder="First Name"
                            />
                        </FieldGroup>
                        <FieldGroup label="Contact's Last Name">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.lastname} 
                                onChange={(val) => handleChange("lastname", val)}
                                placeholder="Last Name"
                            />
                        </FieldGroup>
                    </div>

                    {/* Email */}
                    <FieldGroup label="Email">
                        <EditableField 
                            isEditing={isEditing} 
                            value={provider.email} 
                            onChange={(val) => handleChange("email", val)}
                            placeholder="Email"
                            type="email"
                        />
                    </FieldGroup>

                    {/* Phone */}
                    <FieldGroup label="Phone number">
                        <EditableField 
                            isEditing={isEditing} 
                            value={provider.phone} 
                            onChange={(val) => handleChange("phone", val)}
                            placeholder="Phone number"
                            type="tel"
                        />
                    </FieldGroup>

                    {/* Address */}
                    <FieldGroup label="Address">
                        <EditableField 
                            isEditing={isEditing} 
                            value={provider.address} 
                            onChange={(val) => handleChange("address", val)}
                            placeholder="Address"
                        />
                    </FieldGroup>

                    {/* City/State Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="City/Town">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.city} 
                                onChange={(val) => handleChange("city", val)}
                                placeholder="City/Town"
                            />
                        </FieldGroup>
                        <FieldGroup label="State">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.state} 
                                onChange={(val) => handleChange("state", val)}
                                placeholder="State"
                            />
                        </FieldGroup>
                    </div>

                    {/* Service/Building Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Service Type">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.service_type} 
                                onChange={(val) => handleChange("service_type", val)}
                                placeholder="Service Type"
                            />
                        </FieldGroup>
                        <FieldGroup label="Building Type">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.building_type} 
                                onChange={(val) => handleChange("building_type", val)}
                                placeholder="Building Type"
                            />
                        </FieldGroup>
                    </div>
                    

                    {/* Availability Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Available days">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.available_days} 
                                onChange={(val) => handleChange("available_days", val)}
                                placeholder="Available days"
                            />
                        </FieldGroup>
                        <FieldGroup label="Available time">
                            <EditableField 
                                isEditing={isEditing} 
                                value={provider.available_time} 
                                onChange={(val) => handleChange("available_time", val)}
                                placeholder="Available time"
                            />
                        </FieldGroup>
                    </div>

                    <div className="flex justify-center mt-10">
                        <button 
                            onClick={handleToggleEdit}
                            className="px-12 py-4 bg-[#263238] text-white rounded-lg font-bold font-mono hover:bg-[#1a2327] transition-all shadow-lg min-w-[240px]"
                        >
                            {isEditing ? "Save Changes" : "Edit Provider's Details"}
                        </button>
                    </div>
                </div>
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

function EditableField({ isEditing, value, onChange, placeholder, type = "text" }) {
    if (isEditing) {
        return (
            <input 
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[#1a1a1a]"
            />
        );
    }

    return (
        <div className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono text-[#1a1a1a]">
            {value || "N/A"}
        </div>
    );
}
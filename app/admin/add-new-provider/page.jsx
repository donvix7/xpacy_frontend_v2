"use client";

import React from 'react';
import BackBtn from "../../_components/BackBtn";
import Logo from "../../_components/Logo";

export default function AddNewProviderPage() {
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
                    <h1 className="text-[2.5rem] font-bold text-primary-900 font-mono tracking-tight">Add New Provider</h1>
                </header>

                <form className="flex flex-col gap-8 mt-4 pb-20">
                    <FieldGroup label="Provider's Name">
                        <input 
                            type="text"
                            placeholder="Enter business or company name"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Contact's First Name">
                            <input 
                                type="text"
                                placeholder="First name"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="Contact's Last Name">
                            <input 
                                type="text"
                                placeholder="Last name"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Email">
                        <input 
                            type="email"
                            placeholder="email@example.com"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <FieldGroup label="Phone number">
                        <input 
                            type="tel"
                            placeholder="+234 000 000 0000"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <FieldGroup label="Address">
                        <input 
                            type="text"
                            placeholder="Street address"
                            className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="City/Town">
                            <input 
                                type="text"
                                placeholder="City"
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
                                placeholder="e.g. Plumbing, Electrical"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="Building Type">
                            <input 
                                type="text"
                                placeholder="Residential, Commercial"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldGroup label="Available days">
                            <input 
                                type="text"
                                placeholder="e.g. Mondays-Fridays"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                        <FieldGroup label="Available time">
                            <input 
                                type="text"
                                placeholder="e.g. 8am - 6pm"
                                className="w-full px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </FieldGroup>
                    </div>

                    <div className="flex justify-center mt-10">
                        <button 
                            type="submit"
                            className="px-16 py-4 bg-[#263238] text-white rounded-lg font-bold font-mono hover:bg-[#1a2327] transition-all shadow-lg text-center"
                        >
                            Add New Provider
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

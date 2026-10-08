"use client";

import { useState } from "react";

export default function AdminPropertiesTabs({ ownedList, managedList, ownedCount = 0, managedCount = 0, initialTab = "owned" }) {
    const [activeTab, setActiveTab] = useState(initialTab === "managed" ? "managed" : "owned");

    return (
        <div className="flex min-w-0 flex-col items-center gap-6 sm:gap-10">
            <header className="flex w-full flex-col items-center gap-4 sm:gap-6">
                <p className="text-center text-2xl font-bold tracking-tight text-primary-900 sm:text-[2.5rem]">Manage Properties</p>
                <div className="grid w-full max-w-xl grid-cols-2 rounded-lg border border-primary-200 bg-white p-1.5 " role="tablist" aria-label="Property ownership views">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "owned"}
                        onClick={() => setActiveTab("owned")}
                        className={`cursor-pointer rounded-md px-2 py-2 text-xs font-bold transition-all sm:px-6 sm:text-sm ${activeTab === "owned" ? "bg-[#D2B48C] text-gray-900" : "text-gray-900 hover:bg-gray-50"}`}
                    >
                        Owned Properties List
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "managed"}
                        onClick={() => setActiveTab("managed")}
                        className={`cursor-pointer rounded-md px-2 py-2 text-xs font-bold transition-all sm:px-6 sm:text-sm ${activeTab === "managed" ? "bg-[#D2B48C] text-gray-900" : "text-gray-900 hover:bg-gray-50"}`}
                    >
                        Managed Properties List
                    </button>
                </div>
            </header>
            <div className="w-full">{activeTab === "owned" ? ownedList : managedList}</div>
        </div>
    );
}

"use client"
import { useState } from "react";
import AdminUsersList from "./AdminUsersList";

export default function UsersListTabs({ allUsers, regularUsers, owners, admins }) {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "Registered Users" },
        { id: "tenants", label: "Tenants / Buyers" },
        { id: "owners", label: "Property Owners" },
        { id: "admins", label: "Admins" }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                            activeTab === tab.id
                                ? "text-primary border-b-2 border-primary"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="transition-opacity duration-300">
                {activeTab === "all" && (
                    <AdminUsersList users={allUsers} title="All Registered Users" />
                )}
                {activeTab === "tenants" && (
                     <AdminUsersList users={regularUsers} title="Tenants / Buyers List" />
                )}
                {activeTab === "owners" && (
                     <AdminUsersList users={owners} title="Property Owners List" />
                )}
                {activeTab === "admins" && (
                     <AdminUsersList users={admins} title="Admins List" />
                )}
            </div>
        </div>
    );
}

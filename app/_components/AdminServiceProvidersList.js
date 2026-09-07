"use client";

import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { HiOutlinePlus } from "react-icons/hi";
import UserOptionsMenu from "./UserOptionsMenu";
import Image from "next/image";
import Link from "next/link";

export default function AdminServiceProvidersList({ providers = [] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProviders = providers.filter(provider => {
        const searchStr = searchTerm.toLowerCase();
        const name = `${provider.company_name || provider.name || provider.firstname || ""} ${provider.lastname || ""}`.toLowerCase();
        return (
            name.includes(searchStr) ||
            provider.email?.toLowerCase().includes(searchStr) ||
            provider.service_type?.toLowerCase().includes(searchStr) ||
            provider.city?.toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Top Bar */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-primary-900 font-mono">Service Providers List</h3>
                
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full md:w-[340px]">
                        <input 
                            type="text" 
                            placeholder="Search provider, service type, email or location"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center gap-2 font-mono text-sm text-gray-500 whitespace-nowrap">
                        <span>Sort by:</span>
                        <select className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
                            <option>Default</option>
                            <option>Highest Rated</option>
                            <option>Most Completed</option>
                        </select>
                    </div>

                    {/* Filter Icon */}
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                        <HiOutlineAdjustmentsHorizontal className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="text-gray-400 font-mono text-[10px] uppercase tracking-wider border-b border-gray-50">
                            <th className="px-6 py-4 font-bold">N/O</th>
                            <th className="px-6 py-4 font-bold">Provider's Name</th>
                            <th className="px-6 py-4 font-bold">Contact Info</th>
                            <th className="px-6 py-4 font-bold">Service Type</th>
                            <th className="px-6 py-4 font-bold">Location</th>
                            <th className="px-6 py-4 font-bold text-center">Completed Services</th>
                            <th className="px-6 py-4 font-bold text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-[13px]">
                        {filteredProviders.length > 0 ? (
                            filteredProviders.map((provider, index) => (
                                <tr key={provider._id || index} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-6 border-t border-gray-50 font-bold">{index + 1}</td>
                                    <td className="px-6 py-6 border-t border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 relative shrink-0">
                                                <Image 
                                                    src={provider.display_picture ? `https://app.xpacy.com/src/upload/display_img/${provider.display_picture}` : "/avatar.png"} 
                                                    alt="provider" 
                                                    className="object-cover rounded-full" 
                                                    unoptimized 
                                                    fill 
                                                />
                                            </div>
                                            <span className="font-semibold">{provider.company_name || provider.name || provider.firstname || "N/A"} {provider.lastname || ""}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span>{provider.phone || "N/A"}</span>
                                            <span className="text-gray-400 text-[11px]">{provider.email || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-t border-gray-50 capitalize">{provider.service_type || provider.specialization || "N/A"}</td>
                                    <td className="px-6 py-6 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span>{provider.city || "N/A"}</span>
                                            <span className="text-gray-400 text-[11px]">{provider.state || ""}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-t border-gray-50 text-center font-bold">
                                        {provider.completed_services || 0}
                                    </td>
                                    <td className="px-6 py-6 border-t border-gray-50 text-right relative">
                                        <UserOptionsMenu id={provider._id || provider.id} role={provider?.user_role || "provider"} /> 
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center text-gray-400">
                                    No service providers found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-gray-50 flex flex-col gap-8">
                <Link 
                    href="/admin/add-new-provider"
                    className="flex items-center gap-2 text-primary-900 font-bold font-mono text-sm hover:text-primary transition-colors"
                >
                    <HiOutlinePlus className="text-lg" />
                    <span>Add New Provider</span>
                </Link>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 font-mono text-sm">
                    <button className="text-gray-400 hover:text-primary-900">&lt; Previous</button>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded bg-primary-50 text-primary-900 font-bold">1</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">2</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">3</button>
                        <span className="mx-1">...</span>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">7</button>
                    </div>
                    <button className="text-gray-400 hover:text-primary-900">Next &gt;</button>
                </div>
            </div>
        </div>
    );
}
